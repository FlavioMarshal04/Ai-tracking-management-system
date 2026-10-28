import { Router, Response } from 'express';
import { db } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { aiService } from '../services/aiService.ts';
import { scoringService } from '../services/scoringService.ts';
import { Assessment, AssessmentDifficulty, AssessmentType, TestAttempt } from '../../src/types/index.ts';

const router = Router();

// GET /api/assessments
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { subjectId, type } = req.query;
  let list = Array.from(db.assessments.values());

  if (subjectId) {
    list = list.filter(a => a.subjectId === subjectId);
  }
  if (type) {
    list = list.filter(a => a.type === type);
  }

  // Sanitize to not leak answer keys in public listing
  const sanitized = list.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    subjectId: a.subjectId,
    subjectName: a.subjectName,
    documentId: a.documentId,
    documentTitle: a.documentTitle,
    durationMinutes: a.durationMinutes,
    totalQuestions: a.totalQuestions,
    totalPoints: a.totalPoints,
    passPercentage: a.passPercentage,
    type: a.type,
    difficulty: a.difficulty,
    isAiGenerated: a.isAiGenerated,
    isSample: a.isSample,
    createdAt: a.createdAt,
  }));

  return res.json({ assessments: sanitized });
});

// GET /api/assessments/:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const assessment = db.assessments.get(req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // Student exam security: Mask correct answers and explanations until submission
  const isFacultyOrAdmin = req.user?.role === 'FACULTY' || req.user?.role === 'ADMIN';

  const sanitizedQuestions = (assessment.questions || []).map(q => ({
    id: q.id,
    subjectId: q.subjectId,
    topicName: q.topicName,
    type: q.type,
    prompt: q.prompt,
    codeSnippet: q.codeSnippet,
    options: q.options,
    difficulty: q.difficulty,
    isSample: q.isSample,
    // Only reveal correct answers and explanations if faculty/admin
    ...(isFacultyOrAdmin ? { correctAnswer: q.correctAnswer, explanation: q.explanation } : {}),
  }));

  return res.json({
    assessment: {
      ...assessment,
      questions: sanitizedQuestions,
    },
  });
});

// POST /api/assessments/generate
router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      subjectId,
      documentId,
      topicName,
      title,
      type = 'MCQ',
      difficulty = 'Medium',
      questionCount = 5,
      durationMinutes = 15,
    } = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const subject = db.subjects.get(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    let sourceText = '';
    let docTitle = undefined;
    if (documentId) {
      const doc = db.documents.get(documentId);
      if (doc) {
        sourceText = doc.extractedSnippet || '';
        docTitle = doc.title;
      }
    }

    // Call AIService (Gemini 2.5 Flash if API key provided, or curriculum sample generator)
    const result = await aiService.generateQuestions({
      subjectName: subject.name,
      topicName: topicName || (docTitle ? docTitle : `${subject.name} Core Principles`),
      sourceText,
      type: type as AssessmentType,
      difficulty: difficulty as AssessmentDifficulty,
      questionCount: Math.min(10, Math.max(3, Number(questionCount) || 5)),
    });

    const newAssessmentId = `asmt-${Date.now()}`;
    const generatedTitle = title || `${topicName || docTitle || subject.name} Knowledge Evaluation`;

    // Associate subject ID with generated questions
    const processedQuestions = result.questions.map(q => {
      q.subjectId = subject.id;
      db.questions.set(q.id, q);
      return q;
    });

    const newAssessment: Assessment = {
      id: newAssessmentId,
      title: generatedTitle,
      description: `AI-generated diagnostic examination for ${subject.code} (${subject.name}). Synthesized using ${result.provider}.`,
      subjectId: subject.id,
      subjectName: subject.name,
      documentId,
      documentTitle: docTitle,
      createdById: req.user!.id,
      durationMinutes: Number(durationMinutes) || 15,
      totalQuestions: processedQuestions.length,
      totalPoints: processedQuestions.length * 10,
      passPercentage: 70,
      type: type as AssessmentType,
      difficulty: difficulty as AssessmentDifficulty,
      isAiGenerated: true,
      isSample: result.isSample,
      createdAt: new Date().toISOString(),
      questions: processedQuestions,
    };

    db.assessments.set(newAssessment.id, newAssessment);

    // Update subject assessment count
    subject.totalAssessmentsCount += 1;

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'GENERATE_ASSESSMENT',
      resource: 'Assessment',
      details: `Generated assessment "${newAssessment.title}" with ${processedQuestions.length} questions (${result.provider})`,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Assessment generated successfully',
      assessment: newAssessment,
      provider: result.provider,
      isSample: result.isSample,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error generating assessment' });
  }
});

// POST /api/assessments/:id/start (Starts a test attempt with strict deadline)
router.post('/:id/start', authenticate, (req: AuthRequest, res: Response) => {
  const assessment = db.assessments.get(req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const studentId = req.user!.id;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + assessment.durationMinutes * 60 * 1000);

  const newAttemptId = `att-${studentId}-${Date.now()}`;
  const attempt: TestAttempt = {
    id: newAttemptId,
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    subjectName: assessment.subjectName || 'Coursework',
    studentId,
    studentName: req.user!.name,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    durationSeconds: 0,
    status: 'IN_PROGRESS',
    score: 0,
    percentage: 0,
    passed: false,
    totalQuestions: assessment.totalQuestions,
    correctCount: 0,
    flaggedQuestions: [],
    answers: {},
  };

  db.attempts.set(attempt.id, attempt);

  // Return attempt and sanitized questions
  const sanitizedQuestions = (assessment.questions || []).map(q => ({
    id: q.id,
    subjectId: q.subjectId,
    topicName: q.topicName,
    type: q.type,
    prompt: q.prompt,
    codeSnippet: q.codeSnippet,
    options: q.options,
    difficulty: q.difficulty,
  }));

  return res.status(201).json({
    attempt,
    assessment: {
      ...assessment,
      questions: sanitizedQuestions,
    },
  });
});

// PUT /api/attempts/:id/answers (Auto-saves student answer per question)
router.put('/attempts/:id/answers', authenticate, (req: AuthRequest, res: Response) => {
  const attempt = db.attempts.get(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  if (attempt.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized attempt access' });
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return res.status(400).json({ error: 'Attempt is already finished or timed out.' });
  }

  const { questionId, answer, isFlagged } = req.body;
  if (questionId) {
    if (answer !== undefined) {
      attempt.answers[questionId] = answer;
    }
    if (isFlagged !== undefined) {
      const idx = attempt.flaggedQuestions.indexOf(questionId);
      if (isFlagged && idx === -1) {
        attempt.flaggedQuestions.push(questionId);
      } else if (!isFlagged && idx !== -1) {
        attempt.flaggedQuestions.splice(idx, 1);
      }
    }
  }

  db.attempts.set(attempt.id, attempt);
  return res.json({ message: 'Answer saved', answersCount: Object.keys(attempt.answers).length });
});

// POST /api/assessments/:id/submit
router.post('/:id/submit', authenticate, (req: AuthRequest, res: Response) => {
  const { attemptId } = req.body;
  if (!attemptId) {
    return res.status(400).json({ error: 'Attempt ID is required' });
  }

  const attempt = db.attempts.get(attemptId);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  if (attempt.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized access to submit this attempt' });
  }

  try {
    const result = scoringService.scoreAttempt(attemptId);
    return res.json({
      message: 'Assessment submitted and scored successfully',
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Scoring error' });
  }
});

// GET /api/attempts/:id
router.get('/attempts/:id', authenticate, (req: AuthRequest, res: Response) => {
  const attempt = db.attempts.get(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  return res.json({ attempt });
});

// GET /api/attempts/:id/result
router.get('/attempts/:id/result', authenticate, (req: AuthRequest, res: Response) => {
  const result = db.results.get(`res-${req.params.id}`);
  if (!result) {
    return res.status(404).json({ error: 'Result not found or attempt not yet submitted' });
  }
  return res.json({ result });
});

export default router;
