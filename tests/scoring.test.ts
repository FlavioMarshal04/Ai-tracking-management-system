import { describe, it, expect } from 'vitest';
import { db } from '../server/db/store.ts';
import { scoringService } from '../server/services/scoringService.ts';

describe('Scoring & Progress Analytics Engine', () => {
  it('correctly calculates student weighted progress with 50/25/15/10 weights', () => {
    const studentId = 'usr-student-alex';
    const progress = db.calculateStudentProgress(studentId);

    expect(progress).toBeDefined();
    expect(progress.overallScore).toBeGreaterThan(0);
    expect(progress.overallScore).toBeLessThanOrEqual(100);
    expect(progress.weights.assessmentPerformance).toBe(50);
    expect(progress.weights.topicMastery).toBe(25);
    expect(progress.weights.practiceConsistency).toBe(15);
    expect(progress.weights.improvementOverTime).toBe(10);
    expect(['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Proficient']).toContain(progress.currentLevel);
  });

  it('accurately scores completed test attempts and computes question-level explanations', () => {
    // Attempt att-alex-graphs-1 was pre-seeded
    const result = scoringService.scoreAttempt('att-alex-graphs-1');

    expect(result).toBeDefined();
    expect(result.totalScore).toBe(40);
    expect(result.maxScore).toBe(50);
    expect(result.percentage).toBe(80);
    expect(result.passed).toBe(true);
    expect(result.levelAchieved).toBe('Advanced');
    expect(result.questionBreakdown.length).toBe(5);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('enforces deadline expiration if attempt submitted past deadline', () => {
    const now = new Date();
    const expiredAttemptId = 'test-expired-att';

    db.attempts.set(expiredAttemptId, {
      id: expiredAttemptId,
      assessmentId: 'asmt-graphs-comprehensive',
      assessmentTitle: 'Graph Traversal & Shortest Path Mastery',
      subjectName: 'Data Structures & Algorithms',
      studentId: 'usr-student-alex',
      startedAt: new Date(now.getTime() - 3600000).toISOString(),
      expiresAt: new Date(now.getTime() - 1800000).toISOString(), // expired 30 mins ago
      durationSeconds: 0,
      status: 'IN_PROGRESS',
      score: 0,
      percentage: 0,
      passed: false,
      totalQuestions: 5,
      correctCount: 0,
      flaggedQuestions: [],
      answers: {},
    });

    const result = scoringService.scoreAttempt(expiredAttemptId);
    const updatedAttempt = db.attempts.get(expiredAttemptId);

    expect(updatedAttempt?.status).toBe('TIMED_OUT');
  });
});
