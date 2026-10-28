import { db } from '../db/store.ts';
import {
  Assessment,
  AssessmentResult,
  Question,
  TestAttempt,
  LearningLevel
} from '../../src/types/index.ts';

export class ScoringService {
  /**
   * Scores a student test attempt securely on the server
   */
  scoreAttempt(attemptId: string): AssessmentResult {
    const attempt = db.attempts.get(attemptId);
    if (!attempt) {
      throw new Error('Test attempt not found.');
    }

    // Idempotency: Return existing result if already completed
    const existingResult = db.results.get(`res-${attempt.id}`);
    if (existingResult && attempt.status === 'COMPLETED') {
      return existingResult;
    }

    const assessment = db.assessments.get(attempt.assessmentId);
    if (!assessment || !assessment.questions) {
      throw new Error('Associated assessment data or questions missing.');
    }

    // Check expiration / deadline (allow 60s network latency grace window)
    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    const gracePeriodMs = 60 * 1000;
    if (now.getTime() > expiresAt.getTime() + gracePeriodMs) {
      attempt.status = 'TIMED_OUT';
    } else {
      attempt.status = 'COMPLETED';
    }

    attempt.submittedAt = now.toISOString();
    attempt.durationSeconds = Math.max(1, Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));

    // Score individual questions
    let totalScore = 0;
    let correctCount = 0;
    const pointsPerQuestion = assessment.totalPoints / assessment.totalQuestions;

    const strengths: string[] = [];
    const weakTopics: string[] = [];
    const questionBreakdown = [];

    for (const q of assessment.questions) {
      const studentAns = (attempt.answers[q.id] || '').trim();
      let isCorrect = false;

      if (q.type === 'MCQ') {
        isCorrect = studentAns.toLowerCase() === q.correctAnswer.toLowerCase();
      } else if (q.type === 'FILL_IN_BLANK') {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        isCorrect = normalize(studentAns) === normalize(q.correctAnswer);
      } else {
        // Short Answer / Coding: Match essential keywords
        const keywords = q.correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const studentLower = studentAns.toLowerCase();
        const matched = keywords.filter(kw => studentLower.includes(kw));
        const matchRatio = keywords.length > 0 ? matched.length / keywords.length : 0;
        isCorrect = matchRatio >= 0.4;
      }

      const points = isCorrect ? pointsPerQuestion : 0;
      if (isCorrect) {
        correctCount++;
        totalScore += points;
        if (q.topicName && !strengths.includes(q.topicName)) {
          strengths.push(q.topicName);
        }
      } else {
        if (q.topicName && !weakTopics.includes(q.topicName)) {
          weakTopics.push(q.topicName);
        }
      }

      // Display question breakdown with correct text
      let studentDisplayText = studentAns;
      if (q.type === 'MCQ' && q.options) {
        const selectedOpt = q.options.find(o => o.id === studentAns);
        if (selectedOpt) studentDisplayText = `${selectedOpt.label}: ${selectedOpt.text}`;
      }

      questionBreakdown.push({
        question: q,
        studentAnswer: studentDisplayText || '(No answer provided)',
        isCorrect,
        points: Math.round(points),
        explanation: q.explanation,
      });
    }

    const percentage = Math.round((totalScore / assessment.totalPoints) * 100);
    const passed = percentage >= assessment.passPercentage;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    let levelAchieved: LearningLevel = 'Beginner';
    if (percentage >= 90) levelAchieved = 'Proficient';
    else if (percentage >= 75) levelAchieved = 'Advanced';
    else if (percentage >= 60) levelAchieved = 'Intermediate';
    else if (percentage >= 40) levelAchieved = 'Basic';

    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.correctCount = correctCount;

    // Generate actionable recommendations
    const recommendations: string[] = [];
    if (weakTopics.length > 0) {
      recommendations.push(`Targeted revision needed on: ${weakTopics.join(', ')}.`);
      recommendations.push('Review the foundational invariants and re-attempt practice exercises.');
    } else {
      recommendations.push('Exceptional mastery demonstrated! Proceed to advanced curriculum modules.');
    }

    const result: AssessmentResult = {
      id: `res-${attempt.id}`,
      attemptId: attempt.id,
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      subjectName: assessment.subjectName || 'Computer Science',
      studentId: attempt.studentId,
      totalScore: Math.round(totalScore),
      maxScore: assessment.totalPoints,
      percentage,
      passed,
      grade,
      levelAchieved,
      durationSeconds: attempt.durationSeconds,
      submittedAt: attempt.submittedAt,
      strengths: strengths.slice(0, 3),
      weakTopics: weakTopics.slice(0, 3),
      recommendations,
      questionBreakdown,
    };

    // Save result to store
    db.results.set(result.id, result);

    // Update topic performances for the student
    this.updateTopicMasteries(attempt.studentId, assessment.subjectId, assessment.subjectName || '', questionBreakdown);

    // Update daily study stats & streak
    this.updateDailyConsistency(attempt.studentId, attempt.durationSeconds, percentage);

    // Recalculate 50/25/15/10 weighted score
    db.calculateStudentProgress(attempt.studentId);

    // Audit log
    const studentUser = db.users.get(attempt.studentId);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: attempt.studentId,
      userName: studentUser?.name || 'Student',
      action: 'SUBMIT_TEST',
      resource: 'AssessmentResult',
      details: `Submitted assessment "${assessment.title}". Score: ${totalScore}/${assessment.totalPoints} (${percentage}%) - ${passed ? 'PASSED' : 'FAILED'}`,
      ipAddress: '127.0.0.1',
      createdAt: now.toISOString(),
    });

    return result;
  }

  private updateTopicMasteries(studentId: string, subjectId: string, subjectName: string, breakdown: any[]) {
    for (const item of breakdown) {
      const topicName = item.question.topicName || item.question.topicId || 'General Principles';
      const existingKey = Array.from(db.topicPerformances.keys()).find(k => {
        const tp = db.topicPerformances.get(k);
        return tp && tp.studentId === studentId && tp.topicName.toLowerCase() === topicName.toLowerCase();
      });

      if (existingKey) {
        const tp = db.topicPerformances.get(existingKey)!;
        tp.attemptsCount += 1;
        if (item.isCorrect) tp.correctCount += 1;
        tp.masteryPercentage = Math.round((tp.correctCount / tp.attemptsCount) * 100);
        tp.lastEvaluatedAt = new Date().toISOString();

        if (tp.masteryPercentage >= 90) tp.currentLevel = 'Proficient';
        else if (tp.masteryPercentage >= 75) tp.currentLevel = 'Advanced';
        else if (tp.masteryPercentage >= 60) tp.currentLevel = 'Intermediate';
        else if (tp.masteryPercentage >= 40) tp.currentLevel = 'Basic';
        else tp.currentLevel = 'Beginner';
      } else {
        const newId = `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const correct = item.isCorrect ? 1 : 0;
        const pct = correct ? 100 : 0;
        db.topicPerformances.set(newId, {
          id: newId,
          studentId,
          subjectId,
          subjectName,
          topicName,
          attemptsCount: 1,
          correctCount: correct,
          masteryPercentage: pct,
          currentLevel: pct >= 90 ? 'Proficient' : 'Beginner',
          lastEvaluatedAt: new Date().toISOString(),
        });
      }
    }
  }

  private updateDailyConsistency(studentId: string, durationSeconds: number, score: number) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dailyList = db.dailyProgress.get(studentId) || [];
    const todayRecord = dailyList.find(d => d.date === today);

    const minutes = Math.max(5, Math.round(durationSeconds / 60));

    if (todayRecord) {
      todayRecord.studyMinutes += minutes;
      todayRecord.testsAttempted += 1;
      todayRecord.averageScore = Math.round((todayRecord.averageScore + score) / 2);
    } else {
      dailyList.push({
        date: today,
        studyMinutes: minutes,
        testsAttempted: 1,
        averageScore: score,
        consistencyPoints: 10,
      });
      // Increment consistency streak
      const profile = db.studentProfiles.get(studentId);
      if (profile) {
        profile.consistencyStreak += 1;
      }
    }

    db.dailyProgress.set(studentId, dailyList);
  }
}

export const scoringService = new ScoringService();
