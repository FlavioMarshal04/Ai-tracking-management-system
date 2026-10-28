import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.ts';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.ts';
import { User, UserRole, SystemSettings } from '../../src/types/index.ts';

const router = Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const users = Array.from(db.users.values());
  const students = users.filter(u => u.role === 'STUDENT');
  const faculty = users.filter(u => u.role === 'FACULTY');
  const attempts = Array.from(db.attempts.values()).filter(a => a.status === 'COMPLETED');

  const totalScoreSum = attempts.reduce((acc, a) => acc + a.percentage, 0);
  const avgPlatformScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 80;

  return res.json({
    metrics: {
      totalUsers: users.length,
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalAssessmentsGenerated: db.assessments.size,
      totalDocumentsProcessed: db.documents.size,
      totalTestsCompleted: attempts.length,
      averagePlatformScore: avgPlatformScore,
    },
    systemSettings: db.settings,
    recentAuditLogs: db.auditLogs.slice(0, 10),
  });
});

// GET /api/admin/users
router.get('/users', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const { role, search } = req.query;
  let list = Array.from(db.users.values()).map(u => {
    const { passwordHash: _, ...userWithoutPass } = u;
    let extra = null;
    if (u.role === 'STUDENT') extra = db.studentProfiles.get(u.id);
    else if (u.role === 'FACULTY') extra = db.facultyProfiles.get(u.id);

    return {
      ...userWithoutPass,
      profile: extra,
    };
  });

  if (role) {
    list = list.filter(u => u.role === role);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  return res.json({ users: list });
});

// POST /api/admin/users (Allows Admin to create Faculty, Student, or Admin accounts)
router.post('/users', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const { name, email, password, role, departmentId, rollNumber, designation, officeHours } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUserId = `usr-${(role as string).toLowerCase()}-${Date.now()}`;

  const newUser: User & { passwordHash: string } = {
    id: newUserId,
    email: email.toLowerCase(),
    name,
    role: role as UserRole,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.users.set(newUser.id, newUser);

  const dep = departmentId ? db.departments.get(departmentId) : undefined;

  if (role === 'STUDENT') {
    db.studentProfiles.set(newUserId, {
      id: `prof-${Date.now()}`,
      userId: newUserId,
      rollNumber: rollNumber || `GEN-${Date.now().toString().slice(-4)}`,
      departmentId: departmentId || 'dep-cse',
      departmentName: dep?.name || 'Computer Science & Engineering',
      currentLevel: 'Beginner',
      targetExam: 'Placements 2026',
      overallScore: 0,
      consistencyStreak: 1,
      lastActiveAt: new Date().toISOString(),
    });
  } else if (role === 'FACULTY') {
    db.facultyProfiles.set(newUserId, {
      id: `prof-${Date.now()}`,
      userId: newUserId,
      departmentId: departmentId || 'dep-cse',
      departmentName: dep?.name || 'Computer Science & Engineering',
      designation: designation || 'Assistant Professor',
      officeHours: officeHours || 'Mon & Wed 2-4 PM',
      cabinNumber: 'Faculty Hall 301',
    });
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'ADMIN_CREATE_USER',
    resource: 'Users',
    details: `Admin created ${role} account: ${name} (${email})`,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  const { passwordHash: _, ...userSafe } = newUser;
  return res.status(201).json({ message: 'User created successfully', user: userSafe });
});

// POST /api/admin/assign-faculty
router.post('/assign-faculty', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const { facultyId, studentId } = req.body;
  if (!facultyId || !studentId) {
    return res.status(400).json({ error: 'Faculty ID and Student ID are required' });
  }

  const assigned = db.facultyAssignments.get(facultyId) || new Set();
  assigned.add(studentId);
  db.facultyAssignments.set(facultyId, assigned);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'ASSIGN_MENTOR',
    resource: 'FacultyAssignment',
    details: `Assigned student ${studentId} to faculty mentor ${facultyId}`,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Student successfully assigned to faculty mentor' });
});

// GET /api/admin/settings
router.get('/settings', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  return res.json({ settings: db.settings });
});

// PATCH /api/admin/settings
router.patch('/settings', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  const updates: Partial<SystemSettings> = req.body;

  // Validate that weights sum up to 100
  const current = db.settings;
  const newAsmt = updates.assessmentWeight !== undefined ? updates.assessmentWeight : current.assessmentWeight;
  const newMastery = updates.topicMasteryWeight !== undefined ? updates.topicMasteryWeight : current.topicMasteryWeight;
  const newCons = updates.consistencyWeight !== undefined ? updates.consistencyWeight : current.consistencyWeight;
  const newImp = updates.improvementWeight !== undefined ? updates.improvementWeight : current.improvementWeight;

  const sum = newAsmt + newMastery + newCons + newImp;
  if (sum !== 100) {
    return res.status(400).json({
      error: `Progress metric weights must sum to exactly 100%. Current sum: ${sum}% (${newAsmt} + ${newMastery} + ${newCons} + ${newImp})`,
    });
  }

  db.settings = {
    ...db.settings,
    ...updates,
    assessmentWeight: newAsmt,
    topicMasteryWeight: newMastery,
    consistencyWeight: newCons,
    improvementWeight: newImp,
  };

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'UPDATE_SYSTEM_SETTINGS',
    resource: 'Settings',
    details: `Updated progress formula weights: Assessment ${newAsmt}%, Mastery ${newMastery}%, Consistency ${newCons}%, Improvement ${newImp}%`,
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'System settings updated successfully', settings: db.settings });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: db.auditLogs });
});

export default router;
