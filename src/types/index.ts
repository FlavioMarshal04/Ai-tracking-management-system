export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type LearningLevel = 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced' | 'Proficient';

export type QuestionType = 'MCQ' | 'FILL_IN_BLANK' | 'SHORT_ANSWER' | 'CODING';

export type AssessmentType = 'MCQ' | 'FILL_IN_BLANK' | 'SHORT_ANSWER' | 'MIXED' | 'CODING';

export type AssessmentDifficulty = 'Easy' | 'Medium' | 'Hard';

export type DocumentStatus = 'Pending' | 'Processing' | 'Processed' | 'Failed';

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';

export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  departmentId: string;
  departmentName?: string;
  currentLevel: LearningLevel;
  targetExam: string;
  overallScore: number;
  consistencyStreak: number;
  lastActiveAt: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  departmentId: string;
  departmentName?: string;
  designation: string;
  officeHours: string;
  cabinNumber: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  description: string;
  creditHours: number;
  iconName: string;
  color: string;
  enrolledStudentsCount: number;
  totalAssessmentsCount: number;
}

export interface StudyDocument {
  id: string;
  title: string;
  originalFilename: string;
  fileSize: number;
  subjectId: string;
  subjectName?: string;
  uploadedById: string;
  uploaderName?: string;
  status: DocumentStatus;
  pageCount: number;
  wordCount: number;
  chunkCount: number;
  errorMessage?: string;
  topicsExtracted: string[];
  createdAt: string;
  extractedSnippet?: string;
}

export interface ExtractedTopic {
  id: string;
  documentId: string;
  subjectId: string;
  name: string;
  summary: string;
  difficultyLevel: AssessmentDifficulty;
  importanceScore: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  documentId?: string;
  subjectId: string;
  topicId?: string;
  topicName?: string;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: AssessmentDifficulty;
  isSample?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName?: string;
  documentId?: string;
  documentTitle?: string;
  createdById: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passPercentage: number;
  type: AssessmentType;
  difficulty: AssessmentDifficulty;
  isAiGenerated: boolean;
  isSample: boolean;
  createdAt: string;
  questions?: Question[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  studentResponse: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
  timeSpentSeconds: number;
  feedback?: string;
}

export interface TestAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  subjectName: string;
  studentId: string;
  studentName?: string;
  startedAt: string;
  submittedAt?: string;
  expiresAt: string;
  durationSeconds: number;
  status: AttemptStatus;
  score: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  flaggedQuestions: string[];
  answers: Record<string, string>;
}

export interface AssessmentResult {
  id: string;
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  subjectName: string;
  studentId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  grade: string;
  levelAchieved: LearningLevel;
  durationSeconds: number;
  submittedAt: string;
  strengths: string[];
  weakTopics: string[];
  recommendations: string[];
  questionBreakdown: {
    question: Question;
    studentAnswer: string;
    isCorrect: boolean;
    points: number;
    explanation: string;
  }[];
}

export interface TopicPerformance {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  attemptsCount: number;
  correctCount: number;
  masteryPercentage: number;
  currentLevel: LearningLevel;
  lastEvaluatedAt: string;
}

export interface DailyProgressPoint {
  date: string;
  studyMinutes: number;
  testsAttempted: number;
  averageScore: number;
  consistencyPoints: number;
}

export interface WeeklyScorePoint {
  week: string;
  score: number;
  testsTaken: number;
}

export interface ProgressOverview {
  overallScore: number;
  currentLevel: LearningLevel;
  nextLevel: LearningLevel | 'Max Level';
  pointsToNextLevel: number;
  consistencyStreak: number;
  totalTestsCompleted: number;
  averagePassRate: number;
  studyTimeHours: number;
  weights: {
    assessmentPerformance: number; // 50%
    topicMastery: number; // 25%
    practiceConsistency: number; // 15%
    improvementOverTime: number; // 10%
  };
  componentScores: {
    assessmentScore: number;
    masteryScore: number;
    consistencyScore: number;
    improvementScore: number;
  };
  levelThresholds: Record<LearningLevel, number>;
}

export interface FacultyFeedback {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName?: string;
  attemptId?: string;
  assessmentTitle?: string;
  title: string;
  message: string;
  isPrivate: boolean;
  createdAt: string;
  isRead: boolean;
}

export interface FacultyMeeting {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  agenda: string;
  scheduledAt: string;
  durationMinutes: number;
  status: MeetingStatus;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface AssignedStudent {
  studentId: string;
  userId: string;
  name: string;
  email: string;
  rollNumber: string;
  departmentName: string;
  currentLevel: LearningLevel;
  overallScore: number;
  consistencyStreak: number;
  testsCompleted: number;
  lastActiveAt: string;
  atRisk: boolean;
  riskReason?: string;
  weakTopics: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemSettings {
  assessmentWeight: number; // 50
  topicMasteryWeight: number; // 25
  consistencyWeight: number; // 15
  improvementWeight: number; // 10
  beginnerMax: number; // 39
  basicMax: number; // 59
  intermediateMax: number; // 74
  advancedMax: number; // 89
  proficientMin: number; // 90
  aiProvider: 'gemini' | 'sample';
  defaultModel: string;
  maxUploadSizeMb: number;
}
