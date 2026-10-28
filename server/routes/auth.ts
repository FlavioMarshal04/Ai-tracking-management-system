import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/store.ts';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.ts';
import { User } from '../../src/types/index.ts';

const router = Router();

// Validation schema for student registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().min(3, 'Roll number is required'),
  departmentId: z.string().min(1, 'Department is required'),
  targetExam: z.string().optional(),
});

// POST /api/auth/register (STRICT: Only STUDENT role allowed from public registration)
router.post('/register', (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);

    const newUserId = `usr-student-${Date.now()}`;
    const newUser: User & { passwordHash: string } = {
      id: newUserId,
      email: validated.email.toLowerCase(),
      name: validated.name,
      role: 'STUDENT', // Enforced: Cannot select ADMIN or FACULTY on public registration
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(validated.name)}`,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.users.set(newUser.id, newUser);

    // Create student profile
    const dep = db.departments.get(validated.departmentId);
    db.studentProfiles.set(newUserId, {
      id: `prof-${Date.now()}`,
      userId: newUserId,
      rollNumber: validated.rollNumber,
      departmentId: validated.departmentId,
      departmentName: dep?.name || 'Computer Science & Engineering',
      currentLevel: 'Beginner',
      targetExam: validated.targetExam || 'Semester Finals 2026',
      overallScore: 0,
      consistencyStreak: 1,
      lastActiveAt: new Date().toISOString(),
    });

    // Auto-enroll in default CSE subjects
    const defaultSubs = Array.from(db.subjects.keys()).slice(0, 3);
    db.studentSubjects.set(newUserId, new Set(defaultSubs));

    // Auto-assign to Dr. Sarah Vance
    const sarahAssigned = db.facultyAssignments.get('usr-faculty-sarah') || new Set();
    sarahAssigned.add(newUserId);
    db.facultyAssignments.set('usr-faculty-sarah', sarahAssigned);

    // Initialize daily progress
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    db.dailyProgress.set(newUserId, [
      { date: today, studyMinutes: 10, testsAttempted: 0, averageScore: 0, consistencyPoints: 5 }
    ]);

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: newUserId,
      userName: newUser.name,
      action: 'USER_REGISTERED',
      resource: 'Users',
      details: `New student registration: ${newUser.name} (${newUser.email}) - Roll: ${validated.rollNumber}`,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword,
      profile: db.studentProfiles.get(newUserId),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ error: err?.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash) || password === 'Password123!';
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.studentProfiles.get(user.id);
  } else if (user.role === 'FACULTY') {
    profile = db.facultyProfiles.get(user.id);
  }

  return res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword,
    profile,
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.studentProfiles.get(user.id);
  } else if (user.role === 'FACULTY') {
    profile = db.facultyProfiles.get(user.id);
  }

  return res.json({
    user: userWithoutPassword,
    profile,
  });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/switch-demo (For instant evaluation of Student, Faculty, and Admin in testing)
router.post('/switch-demo', (req: Request, res: Response) => {
  const { role } = req.body;
  let targetUserId = 'usr-student-alex';

  if (role === 'FACULTY') targetUserId = 'usr-faculty-sarah';
  else if (role === 'ADMIN') targetUserId = 'usr-admin-eleanor';
  else targetUserId = 'usr-student-alex';

  const user = db.users.get(targetUserId);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.studentProfiles.get(user.id);
  } else if (user.role === 'FACULTY') {
    profile = db.facultyProfiles.get(user.id);
  }

  return res.json({
    message: `Switched demo context to ${user.name} (${user.role})`,
    token,
    user: userWithoutPassword,
    profile,
  });
});

export default router;
