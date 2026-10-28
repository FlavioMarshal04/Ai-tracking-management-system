import { Router, Response } from 'express';
import { db } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';
import { Subject } from '../../src/types/index.ts';

const router = Router();

// GET /api/subjects
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const enrolledSet = userId ? db.studentSubjects.get(userId) || new Set() : new Set();

  const list = Array.from(db.subjects.values()).map(sub => ({
    ...sub,
    isEnrolled: enrolledSet.has(sub.id),
    documentCount: Array.from(db.documents.values()).filter(d => d.subjectId === sub.id).length,
    assessmentCount: Array.from(db.assessments.values()).filter(a => a.subjectId === sub.id).length,
  }));

  return res.json({ subjects: list });
});

// GET /api/subjects/:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const subject = db.subjects.get(req.params.id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const userId = req.user?.id;
  const enrolledSet = userId ? db.studentSubjects.get(userId) || new Set() : new Set();

  const docs = Array.from(db.documents.values()).filter(d => d.subjectId === subject.id);
  const assessments = Array.from(db.assessments.values()).filter(a => a.subjectId === subject.id);

  return res.json({
    subject: {
      ...subject,
      isEnrolled: enrolledSet.has(subject.id),
    },
    documents: docs,
    assessments,
  });
});

// POST /api/subjects (ADMIN only)
router.post('/', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const { code, name, departmentId, description, creditHours, color } = req.body;
  if (!code || !name || !departmentId) {
    return res.status(400).json({ error: 'Code, Name, and Department are required' });
  }

  const dep = db.departments.get(departmentId);
  const newSubject: Subject = {
    id: `sub-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
    code,
    name,
    departmentId,
    departmentName: dep?.name || 'Computer Science & Engineering',
    description: description || '',
    creditHours: Number(creditHours) || 3,
    iconName: 'BookOpen',
    color: color || '#6D28D9',
    enrolledStudentsCount: 0,
    totalAssessmentsCount: 0,
  };

  db.subjects.set(newSubject.id, newSubject);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'CREATE_SUBJECT',
    resource: 'Subject',
    details: `Created subject: ${newSubject.code} - ${newSubject.name}`,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ subject: newSubject });
});

// PUT /api/subjects/:id (ADMIN only)
router.put('/:id', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const subject = db.subjects.get(req.params.id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const { name, code, description, creditHours, color } = req.body;
  if (name) subject.name = name;
  if (code) subject.code = code;
  if (description !== undefined) subject.description = description;
  if (creditHours) subject.creditHours = Number(creditHours);
  if (color) subject.color = color;

  db.subjects.set(subject.id, subject);
  return res.json({ subject });
});

// DELETE /api/subjects/:id (ADMIN only)
router.delete('/:id', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const subject = db.subjects.get(req.params.id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  db.subjects.delete(subject.id);
  return res.json({ message: 'Subject deleted successfully' });
});

// POST /api/subjects/:id/enroll
router.post('/:id/enroll', authenticate, (req: AuthRequest, res: Response) => {
  const subject = db.subjects.get(req.params.id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const studentId = req.user!.id;
  const enrolled = db.studentSubjects.get(studentId) || new Set();

  let isEnrolled = false;
  if (enrolled.has(subject.id)) {
    enrolled.delete(subject.id);
    subject.enrolledStudentsCount = Math.max(0, subject.enrolledStudentsCount - 1);
    isEnrolled = false;
  } else {
    enrolled.add(subject.id);
    subject.enrolledStudentsCount += 1;
    isEnrolled = true;
  }

  db.studentSubjects.set(studentId, enrolled);
  return res.json({
    message: isEnrolled ? `Enrolled in ${subject.name}` : `Unenrolled from ${subject.name}`,
    isEnrolled,
    enrolledStudentsCount: subject.enrolledStudentsCount,
  });
});

export default router;
