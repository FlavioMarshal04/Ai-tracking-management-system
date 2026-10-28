import { Router, Response } from 'express';
import { db } from '../db/store.ts';
import { authenticate, requireRole, requireFacultyAssignment, AuthRequest } from '../middleware/auth.ts';
import { FacultyFeedback, FacultyMeeting } from '../../src/types/index.ts';

const router = Router();

// GET /api/faculty/dashboard
router.get('/dashboard', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const facultyId = req.user!.id;
  const assigned = db.getFacultyAssignedStudents(facultyId);

  const totalAssigned = assigned.length;
  const atRiskCount = assigned.filter(s => s.atRisk).length;
  const avgClassScore = totalAssigned > 0 ? Math.round(assigned.reduce((acc, s) => acc + s.overallScore, 0) / totalAssigned) : 0;

  const upcomingMeetings = Array.from(db.facultyMeetings.values())
    .filter(m => m.facultyId === facultyId && m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const recentFeedback = Array.from(db.facultyFeedback.values())
    .filter(f => f.facultyId === facultyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return res.json({
    metrics: {
      totalAssignedStudents: totalAssigned,
      atRiskCount,
      averageClassScore: avgClassScore,
      scheduledMeetingsCount: upcomingMeetings.length,
    },
    assignedStudents: assigned,
    upcomingMeetings,
    recentFeedback,
  });
});

// GET /api/faculty/students
router.get('/students', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const facultyId = req.user!.id;
  const { search, level, atRisk } = req.query;
  let students = db.getFacultyAssignedStudents(facultyId);

  if (search) {
    const q = (search as string).toLowerCase();
    students = students.filter(s => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  if (level) {
    students = students.filter(s => s.currentLevel === level);
  }
  if (atRisk === 'true') {
    students = students.filter(s => s.atRisk);
  }

  return res.json({ students });
});

// GET /api/faculty/students/:id (Secured by requireFacultyAssignment)
router.get('/students/:id', authenticate, requireFacultyAssignment, (req: AuthRequest, res: Response) => {
  const studentId = req.params.id;
  const user = db.users.get(studentId);
  const profile = db.studentProfiles.get(studentId);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const overview = db.calculateStudentProgress(studentId);
  const attempts = Array.from(db.attempts.values()).filter(a => a.studentId === studentId);
  const topics = Array.from(db.topicPerformances.values()).filter(tp => tp.studentId === studentId);
  const feedback = Array.from(db.facultyFeedback.values()).filter(fb => fb.studentId === studentId);
  const meetings = Array.from(db.facultyMeetings.values()).filter(m => m.studentId === studentId);

  return res.json({
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      rollNumber: profile.rollNumber,
      departmentName: profile.departmentName,
      currentLevel: profile.currentLevel,
      targetExam: profile.targetExam,
      lastActiveAt: profile.lastActiveAt,
      streak: profile.consistencyStreak,
    },
    overview,
    attempts,
    topics,
    feedback,
    meetings,
  });
});

// GET /api/faculty/students/:id/progress
router.get('/students/:id/progress', authenticate, requireFacultyAssignment, (req: AuthRequest, res: Response) => {
  const studentId = req.params.id;
  const overview = db.calculateStudentProgress(studentId);
  const daily = db.dailyProgress.get(studentId) || [];
  const weekly = db.weeklyScores.get(studentId) || [];
  const topics = Array.from(db.topicPerformances.values()).filter(tp => tp.studentId === studentId);

  return res.json({ overview, daily, weekly, topics });
});

// POST /api/faculty/feedback
router.post('/feedback', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const { studentId, title, message, attemptId, isPrivate = true } = req.body;
  if (!studentId || !title || !message) {
    return res.status(400).json({ error: 'Student ID, Title, and Message are required' });
  }

  const studentUser = db.users.get(studentId);
  if (!studentUser) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const feedback: FacultyFeedback = {
    id: `fb-${Date.now()}`,
    facultyId: req.user!.id,
    facultyName: req.user!.name,
    studentId,
    studentName: studentUser.name,
    attemptId,
    title,
    message,
    isPrivate: Boolean(isPrivate),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  db.facultyFeedback.set(feedback.id, feedback);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'FACULTY_FEEDBACK',
    resource: 'FacultyFeedback',
    details: `Provided academic feedback to student ${studentUser.name} (${studentUser.email})`,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ message: 'Feedback sent successfully', feedback });
});

// POST /api/faculty/meetings
router.post('/meetings', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const { studentId, title, agenda, scheduledAt, durationMinutes = 30, meetingUrl, notes } = req.body;
  if (!studentId || !title || !scheduledAt) {
    return res.status(400).json({ error: 'Student ID, Title, and Scheduled Date/Time are required' });
  }

  const studentUser = db.users.get(studentId);
  if (!studentUser) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const meeting: FacultyMeeting = {
    id: `meet-${Date.now()}`,
    facultyId: req.user!.id,
    facultyName: req.user!.name,
    studentId,
    studentName: studentUser.name,
    studentEmail: studentUser.email,
    title,
    agenda: agenda || 'One-on-one academic consultation and progress review',
    scheduledAt,
    durationMinutes: Number(durationMinutes) || 30,
    status: 'SCHEDULED',
    meetingUrl: meetingUrl || `https://meet.google.com/edupulse-${Math.random().toString(36).substr(2, 6)}`,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  db.facultyMeetings.set(meeting.id, meeting);

  return res.status(201).json({ message: 'Meeting scheduled successfully', meeting });
});

// PATCH /api/faculty/meetings/:id
router.patch('/meetings/:id', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const meeting = db.facultyMeetings.get(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const { status, notes } = req.body;
  if (status) meeting.status = status;
  if (notes !== undefined) meeting.notes = notes;

  db.facultyMeetings.set(meeting.id, meeting);
  return res.json({ message: 'Meeting updated', meeting });
});

// GET /api/faculty/reports (CSV Export)
router.get('/reports', authenticate, requireRole(['FACULTY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const facultyId = req.user!.id;
  const students = db.getFacultyAssignedStudents(facultyId);

  let csv = 'Roll Number,Student Name,Email,Department,Current Level,Overall Score (%),Consistency Streak (Days),Tests Completed,At Risk,Weak Topics\n';
  students.forEach(s => {
    csv += `"${s.rollNumber}","${s.name}","${s.email}","${s.departmentName}","${s.currentLevel}",${s.overallScore},${s.consistencyStreak},${s.testsCompleted},"${s.atRisk ? 'YES' : 'NO'}","${s.weakTopics.join('; ')}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="assigned_students_progress_report.csv"');
  return res.send(csv);
});

export default router;
