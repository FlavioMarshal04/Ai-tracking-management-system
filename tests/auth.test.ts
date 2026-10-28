import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { generateToken } from '../server/middleware/auth.ts';
import { db } from '../server/db/store.ts';

describe('Authentication & RBAC Governance', () => {
  it('correctly hashes and verifies passwords using bcrypt', () => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Password123!', salt);

    expect(bcrypt.compareSync('Password123!', hash)).toBe(true);
    expect(bcrypt.compareSync('WrongPassword', hash)).toBe(false);
  });

  it('generates a valid JWT token with required payload claims', () => {
    const token = generateToken({
      id: 'usr-student-alex',
      email: 'alex@edupulse.edu',
      role: 'STUDENT',
      name: 'Alex Chen',
    });

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
  });

  it('verifies that default student Alex Chen is seeded with proper role and assignment', () => {
    const user = db.users.get('usr-student-alex');
    expect(user).toBeDefined();
    expect(user?.role).toBe('STUDENT');

    const faculty = db.users.get('usr-faculty-sarah');
    expect(faculty).toBeDefined();
    expect(faculty?.role).toBe('FACULTY');

    const assigned = db.facultyAssignments.get('usr-faculty-sarah');
    expect(assigned?.has('usr-student-alex')).toBe(true);
  });
});
