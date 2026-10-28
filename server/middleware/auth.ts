import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.ts';
import { UserRole } from '../../src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'edupulse-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Also support mock/fast auth token header for seamless demo switching
  const demoUserId = req.headers['x-demo-user-id'] as string;
  if (demoUserId && db.users.has(demoUserId)) {
    const user = db.users.get(demoUserId)!;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return next();
  }

  if (!token) {
    // Default to Alex Chen if no auth header in local dev for frictionless exploration
    const defaultUser = db.users.get('usr-student-alex')!;
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role,
      name: defaultUser.name,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
      });
    }
    next();
  };
}

// Ensure faculty can only access their assigned students
export function requireFacultyAssignment(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'ADMIN') {
    return next(); // Admins have universal oversight
  }

  if (req.user.role === 'FACULTY') {
    const studentId = req.params.studentId || req.params.id || req.body.studentId;
    if (!studentId) {
      return next();
    }

    const assigned = db.facultyAssignments.get(req.user.id);
    if (!assigned || !assigned.has(studentId)) {
      return res.status(403).json({
        error: 'Access denied: You are not assigned as mentor/faculty to this student.',
      });
    }
    return next();
  }

  return res.status(403).json({ error: 'Faculty or Admin credentials required' });
}
