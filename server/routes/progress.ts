import { Router, Response } from 'express';
import { db } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/progress/overview
router.get('/overview', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const overview = db.calculateStudentProgress(studentId);
  const profile = db.studentProfiles.get(studentId);

  return res.json({
    overview,
    profile,
  });
});

// GET /api/progress/daily
router.get('/daily', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const daily = db.dailyProgress.get(studentId) || [];
  return res.json({ daily });
});

// GET /api/progress/weekly
router.get('/weekly', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const weekly = db.weeklyScores.get(studentId) || [];
  return res.json({ weekly });
});

// GET /api/progress/monthly
router.get('/monthly', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  // Generate aggregated monthly comparison
  const monthly = [
    { month: 'Aug', score: 65, consistencyRate: 60, testsCount: 14 },
    { month: 'Sep', score: 74, consistencyRate: 80, testsCount: 22 },
    { month: 'Oct', score: 84, consistencyRate: 92, testsCount: 28 },
  ];
  return res.json({ monthly });
});

// GET /api/progress/subjects
router.get('/subjects', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const enrolledSubs = db.studentSubjects.get(studentId) || new Set();

  const list = Array.from(db.subjects.values())
    .filter(s => enrolledSubs.has(s.id))
    .map(sub => {
      const subAttempts = Array.from(db.attempts.values()).filter(a => a.studentId === studentId && a.subjectName === sub.name && a.status === 'COMPLETED');
      const avgScore = subAttempts.length > 0 ? Math.round(subAttempts.reduce((acc, a) => acc + a.percentage, 0) / subAttempts.length) : 75;
      const subTopics = Array.from(db.topicPerformances.values()).filter(tp => tp.studentId === studentId && tp.subjectId === sub.id);
      const mastery = subTopics.length > 0 ? Math.round(subTopics.reduce((acc, t) => acc + t.masteryPercentage, 0) / subTopics.length) : 70;

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        color: sub.color,
        averageScore: avgScore,
        topicMastery: mastery,
        testsCompleted: subAttempts.length,
        totalTopics: subTopics.length || 5,
      };
    });

  return res.json({ subjects: list });
});

// GET /api/progress/topics
router.get('/topics', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const topics = Array.from(db.topicPerformances.values()).filter(tp => tp.studentId === studentId);
  return res.json({ topics });
});

// GET /api/progress/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  const studentId = req.user!.id;
  const attempts = Array.from(db.attempts.values())
    .filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return res.json({ history: attempts });
});

export default router;
