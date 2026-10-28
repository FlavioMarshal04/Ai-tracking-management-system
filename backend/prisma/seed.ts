import { PrismaClient, Role, LearningLevel, QuestionType, AssessmentType, AssessmentDifficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database for EduPulse...');

  // 1. Password hashing
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password123!', salt);

  // 2. Departments
  const depCse = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computing, Algorithms, and Software Systems',
    },
  });

  const depAids = await prisma.department.upsert({
    where: { code: 'AIDS' },
    update: {},
    create: {
      name: 'AI & Data Science',
      code: 'AIDS',
      description: 'Department of Machine Learning and Intelligent Systems',
    },
  });

  // 3. Users
  const studentAlex = await prisma.user.upsert({
    where: { email: 'alex@edupulse.edu' },
    update: {},
    create: {
      email: 'alex@edupulse.edu',
      name: 'Alex Chen',
      passwordHash,
      role: Role.STUDENT,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const studentMarcus = await prisma.user.upsert({
    where: { email: 'marcus@edupulse.edu' },
    update: {},
    create: {
      email: 'marcus@edupulse.edu',
      name: 'Marcus Brody',
      passwordHash,
      role: Role.STUDENT,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
  });

  const facultySarah = await prisma.user.upsert({
    where: { email: 'sarah.vance@edupulse.edu' },
    update: {},
    create: {
      email: 'sarah.vance@edupulse.edu',
      name: 'Dr. Sarah Vance',
      passwordHash,
      role: Role.FACULTY,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });

  const adminEleanor = await prisma.user.upsert({
    where: { email: 'admin@edupulse.edu' },
    update: {},
    create: {
      email: 'admin@edupulse.edu',
      name: 'Eleanor Ward',
      passwordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    },
  });

  // 4. Profiles
  const alexProfile = await prisma.studentProfile.upsert({
    where: { userId: studentAlex.id },
    update: {},
    create: {
      userId: studentAlex.id,
      rollNumber: 'CS-2024-042',
      departmentId: depCse.id,
      currentLevel: LearningLevel.Advanced,
      targetExam: 'Placements & Technical Finals 2027',
      overallScore: 82.4,
      consistencyStreak: 12,
    },
  });

  const marcusProfile = await prisma.studentProfile.upsert({
    where: { userId: studentMarcus.id },
    update: {},
    create: {
      userId: studentMarcus.id,
      rollNumber: 'CS-2024-089',
      departmentId: depCse.id,
      currentLevel: LearningLevel.Basic,
      targetExam: 'Semester Finals 2026',
      overallScore: 54.2,
      consistencyStreak: 2,
    },
  });

  const sarahProfile = await prisma.facultyProfile.upsert({
    where: { userId: facultySarah.id },
    update: {},
    create: {
      userId: facultySarah.id,
      departmentId: depCse.id,
      designation: 'Associate Professor of Computer Science',
      officeHours: 'Tue & Thu: 2:00 PM - 5:00 PM',
      cabinNumber: 'Engineering Hall, Suite 412',
    },
  });

  // 5. Faculty Assignments
  await prisma.facultyStudentAssignment.upsert({
    where: {
      facultyId_studentId: {
        facultyId: sarahProfile.id,
        studentId: alexProfile.id,
      },
    },
    update: {},
    create: {
      facultyId: sarahProfile.id,
      studentId: alexProfile.id,
      notes: 'Mentoring in Graph Algorithms & Systems Architecture',
    },
  });

  // 6. Subjects
  const subDsa = await prisma.subject.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      departmentId: depCse.id,
      description: 'Asymptotic complexity, balanced search trees, dynamic programming, and network graph algorithms.',
      creditHours: 4,
      color: '#6D28D9',
    },
  });

  const subOs = await prisma.subject.upsert({
    where: { code: 'CS304' },
    update: {},
    create: {
      code: 'CS304',
      name: 'Operating Systems & Concurrency',
      departmentId: depCse.id,
      description: 'Kernel abstractions, multi-threading primitives, virtual memory management, TLBs, and file systems.',
      creditHours: 4,
      color: '#2563EB',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
