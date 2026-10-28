import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Subject,
  StudyDocument,
  ExtractedTopic,
  Question,
  Assessment,
  TestAttempt,
  AssessmentResult,
  TopicPerformance,
  DailyProgressPoint,
  WeeklyScorePoint,
  FacultyFeedback,
  FacultyMeeting,
  AssignedStudent,
  AuditLog,
  SystemSettings
} from '../../src/types/index.ts';

// In-memory persistent state store for the server
class DatabaseStore {
  users: Map<string, User & { passwordHash: string }> = new Map();
  studentProfiles: Map<string, StudentProfile> = new Map();
  facultyProfiles: Map<string, FacultyProfile> = new Map();
  departments: Map<string, Department> = new Map();
  subjects: Map<string, Subject> = new Map();
  studentSubjects: Map<string, Set<string>> = new Map(); // studentId -> Set<subjectId>
  documents: Map<string, StudyDocument> = new Map();
  topics: Map<string, ExtractedTopic> = new Map();
  questions: Map<string, Question> = new Map();
  assessments: Map<string, Assessment> = new Map();
  attempts: Map<string, TestAttempt> = new Map();
  results: Map<string, AssessmentResult> = new Map();
  topicPerformances: Map<string, TopicPerformance> = new Map();
  dailyProgress: Map<string, DailyProgressPoint[]> = new Map(); // studentId -> daily list
  weeklyScores: Map<string, WeeklyScorePoint[]> = new Map(); // studentId -> weekly list
  facultyAssignments: Map<string, Set<string>> = new Map(); // facultyId -> Set<studentId>
  facultyFeedback: Map<string, FacultyFeedback> = new Map();
  facultyMeetings: Map<string, FacultyMeeting> = new Map();
  auditLogs: AuditLog[] = [];
  settings: SystemSettings = {
    assessmentWeight: 50,
    topicMasteryWeight: 25,
    consistencyWeight: 15,
    improvementWeight: 10,
    beginnerMax: 39,
    basicMax: 59,
    intermediateMax: 74,
    advancedMax: 89,
    proficientMin: 90,
    aiProvider: 'sample',
    defaultModel: 'gemini-2.5-flash',
    maxUploadSizeMb: 15,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password123!', salt);

    // 1. Departments
    const dep1: Department = { id: 'dep-cse', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computing, Algorithms, and Software Engineering' };
    const dep2: Department = { id: 'dep-aids', name: 'AI & Data Science', code: 'AIDS', description: 'Department of Machine Learning and Intelligence Systems' };
    const dep3: Department = { id: 'dep-mac', name: 'Mathematics & Computing', code: 'MAC', description: 'Department of Applied Mathematics and Computational Theory' };
    [dep1, dep2, dep3].forEach(d => this.departments.set(d.id, d));

    // 2. Users
    const studentUser: User & { passwordHash: string } = {
      id: 'usr-student-alex',
      email: 'alex@edupulse.edu',
      name: 'Alex Chen',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      createdAt: '2026-09-01T08:00:00Z',
      passwordHash: demoPasswordHash,
    };

    const studentUser2: User & { passwordHash: string } = {
      id: 'usr-student-marcus',
      email: 'marcus@edupulse.edu',
      name: 'Marcus Brody',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      createdAt: '2026-09-05T09:30:00Z',
      passwordHash: demoPasswordHash,
    };

    const studentUser3: User & { passwordHash: string } = {
      id: 'usr-student-priya',
      email: 'priya@edupulse.edu',
      name: 'Priya Sharma',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      createdAt: '2026-09-10T10:15:00Z',
      passwordHash: demoPasswordHash,
    };

    const facultyUser: User & { passwordHash: string } = {
      id: 'usr-faculty-sarah',
      email: 'sarah.vance@edupulse.edu',
      name: 'Dr. Sarah Vance',
      role: 'FACULTY',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      createdAt: '2026-08-15T08:00:00Z',
      passwordHash: demoPasswordHash,
    };

    const adminUser: User & { passwordHash: string } = {
      id: 'usr-admin-eleanor',
      email: 'admin@edupulse.edu',
      name: 'Eleanor Ward',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      createdAt: '2026-08-01T08:00:00Z',
      passwordHash: demoPasswordHash,
    };

    [studentUser, studentUser2, studentUser3, facultyUser, adminUser].forEach(u => this.users.set(u.id, u));

    // 3. Profiles
    const alexProfile: StudentProfile = {
      id: 'prof-alex',
      userId: studentUser.id,
      rollNumber: 'CS-2024-042',
      departmentId: dep1.id,
      departmentName: dep1.name,
      currentLevel: 'Advanced',
      targetExam: 'Graduate Aptitude Test / Tech Placements 2027',
      overallScore: 82.4,
      consistencyStreak: 12,
      lastActiveAt: new Date().toISOString(),
    };

    const marcusProfile: StudentProfile = {
      id: 'prof-marcus',
      userId: studentUser2.id,
      rollNumber: 'CS-2024-089',
      departmentId: dep1.id,
      departmentName: dep1.name,
      currentLevel: 'Basic',
      targetExam: 'Semester End Finals 2026',
      overallScore: 54.2,
      consistencyStreak: 2,
      lastActiveAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    };

    const priyaProfile: StudentProfile = {
      id: 'prof-priya',
      userId: studentUser3.id,
      rollNumber: 'AI-2024-015',
      departmentId: dep2.id,
      departmentName: dep2.name,
      currentLevel: 'Proficient',
      targetExam: 'ACM ICPC & Research Fellowship',
      overallScore: 94.6,
      consistencyStreak: 28,
      lastActiveAt: new Date().toISOString(),
    };

    [alexProfile, marcusProfile, priyaProfile].forEach(p => this.studentProfiles.set(p.userId, p));

    const sarahProfile: FacultyProfile = {
      id: 'prof-sarah',
      userId: facultyUser.id,
      departmentId: dep1.id,
      departmentName: dep1.name,
      designation: 'Associate Professor of Computer Science',
      officeHours: 'Tue & Thu: 2:00 PM - 5:00 PM',
      cabinNumber: 'Engineering Hall, Suite 412',
    };
    this.facultyProfiles.set(sarahProfile.userId, sarahProfile);

    // Faculty Assignments (Dr. Sarah is mentor to Alex, Marcus, and Priya)
    this.facultyAssignments.set(facultyUser.id, new Set([studentUser.id, studentUser2.id, studentUser3.id]));

    // 4. Subjects
    const sub1: Subject = {
      id: 'sub-dsa',
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      departmentId: dep1.id,
      departmentName: dep1.name,
      description: 'Advanced asymptotic analysis, balanced search trees, dynamic programming, and network graph algorithms.',
      creditHours: 4,
      iconName: 'Binary',
      color: '#6D28D9',
      enrolledStudentsCount: 64,
      totalAssessmentsCount: 12,
    };

    const sub2: Subject = {
      id: 'sub-os',
      code: 'CS304',
      name: 'Operating Systems & Concurrency',
      departmentId: dep1.id,
      departmentName: dep1.name,
      description: 'Kernel abstractions, multi-threading primitives, virtual memory management, TLBs, and POSIX file systems.',
      creditHours: 4,
      iconName: 'Cpu',
      color: '#2563EB',
      enrolledStudentsCount: 58,
      totalAssessmentsCount: 9,
    };

    const sub3: Subject = {
      id: 'sub-dl',
      code: 'AI401',
      name: 'Deep Learning & Transformers',
      departmentId: dep2.id,
      departmentName: dep2.name,
      description: 'Foundations of backpropagation, scaled dot-product self-attention, generative architectures, and fine-tuning.',
      creditHours: 3,
      iconName: 'Brain',
      color: '#7C3AED',
      enrolledStudentsCount: 42,
      totalAssessmentsCount: 8,
    };

    const sub4: Subject = {
      id: 'sub-db',
      code: 'CS205',
      name: 'Database Management Systems',
      departmentId: dep1.id,
      departmentName: dep1.name,
      description: 'Relational algebra, ACID transaction semantics, multi-version concurrency control (MVCC), and B+ Tree indexing.',
      creditHours: 3,
      iconName: 'Database',
      color: '#059669',
      enrolledStudentsCount: 52,
      totalAssessmentsCount: 7,
    };

    const sub5: Subject = {
      id: 'sub-math',
      code: 'MA102',
      name: 'Linear Algebra & Optimization',
      departmentId: dep3.id,
      departmentName: dep3.name,
      description: 'Vector spaces, singular value decomposition (SVD), positive definite matrices, and gradient descent convergence.',
      creditHours: 4,
      iconName: 'Calculator',
      color: '#D97706',
      enrolledStudentsCount: 70,
      totalAssessmentsCount: 10,
    };

    [sub1, sub2, sub3, sub4, sub5].forEach(s => this.subjects.set(s.id, s));

    // Student enrollments
    this.studentSubjects.set(studentUser.id, new Set([sub1.id, sub2.id, sub3.id, sub4.id]));
    this.studentSubjects.set(studentUser2.id, new Set([sub1.id, sub2.id]));
    this.studentSubjects.set(studentUser3.id, new Set([sub1.id, sub3.id, sub5.id]));

    // 5. Pre-loaded Study Documents
    const doc1: StudyDocument = {
      id: 'doc-dsa-graphs',
      title: 'Graph Traversal & Shortest Path Theory',
      originalFilename: 'CS201_Module4_Graphs_and_Paths.pdf',
      fileSize: 2450000,
      subjectId: sub1.id,
      subjectName: sub1.name,
      uploadedById: studentUser.id,
      uploaderName: 'Alex Chen',
      status: 'Processed',
      pageCount: 38,
      wordCount: 14200,
      chunkCount: 8,
      topicsExtracted: ["Dijkstra's Algorithm", "Bellman-Ford & Negative Cycles", "A* Heuristic Search", "Minimum Spanning Trees (Kruskal & Prim)", "Topological Sorting & DAGs"],
      createdAt: '2026-10-15T11:20:00Z',
      extractedSnippet: 'Graph data structures: adjacency lists vs matrices. Priority queues in Dijkstra algorithm yield O((V+E) log V) complexity. When negative edge weights exist, Bellman-Ford runs in O(VE) and detects negative cost cycles. Heuristic search with A* guarantees admissibility if h(n) never overestimates true cost to goal.',
    };

    const doc2: StudyDocument = {
      id: 'doc-os-vm',
      title: 'Virtual Memory & Multi-Level Paging',
      originalFilename: 'OS_Chapter08_Virtual_Memory.pdf',
      fileSize: 3100000,
      subjectId: sub2.id,
      subjectName: sub2.name,
      uploadedById: studentUser.id,
      uploaderName: 'Alex Chen',
      status: 'Processed',
      pageCount: 44,
      wordCount: 17800,
      chunkCount: 10,
      topicsExtracted: ["Multi-Level Page Tables", "Translation Lookaside Buffer (TLB)", "Page Fault Handling Mechanism", "LRU & Clock Page Replacement", "Thrashing & Working Set Model"],
      createdAt: '2026-10-18T14:45:00Z',
      extractedSnippet: 'Virtual memory isolates process address spaces while presenting a contiguous abstraction over segmented physical DRAM. Modern 64-bit architectures utilize 4-level or 5-level page tables with 4KB pages. Hardware TLB caches virtual-to-physical address mappings; TLB miss triggers page table walk.',
    };

    const doc3: StudyDocument = {
      id: 'doc-dl-transformers',
      title: 'Self-Attention Mechanisms & Transformers',
      originalFilename: 'DeepLearning_Attention_and_Transformers.pdf',
      fileSize: 4200000,
      subjectId: sub3.id,
      subjectName: sub3.name,
      uploadedById: studentUser3.id,
      uploaderName: 'Priya Sharma',
      status: 'Processed',
      pageCount: 52,
      wordCount: 22100,
      chunkCount: 12,
      topicsExtracted: ["Scaled Dot-Product Attention", "Multi-Head Attention Projections", "Positional Encodings (Sinusoidal & RoPE)", "Layer Normalization & Residual Paths", "Causal Masking in Autoregressive Decoders"],
      createdAt: '2026-10-20T09:10:00Z',
      extractedSnippet: 'The core innovation of the Transformer is replacing recurrent inductive bias with pairwise self-attention. Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V. Multi-head projection permits the model to jointly attend to information at different representation subspaces at different positions.',
    };

    [doc1, doc2, doc3].forEach(d => this.documents.set(d.id, d));

    // 6. Extracted Topics
    const top1: ExtractedTopic = { id: 'top-dijkstra', documentId: doc1.id, subjectId: sub1.id, name: "Dijkstra's Algorithm", summary: 'Shortest path computation in non-negative weighted graphs using min-heaps.', difficultyLevel: 'Medium', importanceScore: 92 };
    const top2: ExtractedTopic = { id: 'top-bellman', documentId: doc1.id, subjectId: sub1.id, name: 'Bellman-Ford & Negative Cycles', summary: 'Dynamic programming formulation for edge relaxation with cycle detection.', difficultyLevel: 'Hard', importanceScore: 88 };
    const top3: ExtractedTopic = { id: 'top-tlb', documentId: doc2.id, subjectId: sub2.id, name: 'Translation Lookaside Buffer (TLB)', summary: 'Hardware cache for virtual-to-physical page frame translations.', difficultyLevel: 'Medium', importanceScore: 95 };
    const top4: ExtractedTopic = { id: 'top-attention', documentId: doc3.id, subjectId: sub3.id, name: 'Scaled Dot-Product Attention', summary: 'Matrix formulation of queries, keys, and values with square-root dimension scaling.', difficultyLevel: 'Hard', importanceScore: 98 };

    [top1, top2, top3, top4].forEach(t => this.topics.set(t.id, t));

    // 7. Questions & Assessments
    const q1: Question = {
      id: 'q-dsa-1',
      documentId: doc1.id,
      subjectId: sub1.id,
      topicId: top1.id,
      topicName: "Dijkstra's Algorithm",
      type: 'MCQ',
      prompt: 'What is the optimal time complexity of Dijkstra’s single-source shortest path algorithm when implemented using a Fibonacci Heap on a graph with V vertices and E edges?',
      options: [
        { id: 'opt-a', label: 'A', text: 'O(V²)' },
        { id: 'opt-b', label: 'B', text: 'O((V + E) log V)' },
        { id: 'opt-c', label: 'C', text: 'O(E + V log V)' },
        { id: 'opt-d', label: 'D', text: 'O(V · E)' },
      ],
      correctAnswer: 'opt-c',
      explanation: 'With a Fibonacci heap, the decrease-key operation runs in amortized O(1) time while extract-min takes O(log V) time. Over E decrease-keys and V extract-mins, the total complexity simplifies to O(E + V log V).',
      difficulty: 'Medium',
      isSample: false,
    };

    const q2: Question = {
      id: 'q-dsa-2',
      documentId: doc1.id,
      subjectId: sub1.id,
      topicId: top1.id,
      topicName: "Dijkstra's Algorithm",
      type: 'MCQ',
      prompt: 'Why does Dijkstra’s greedy shortest path algorithm fail to produce correct distances on graphs containing edges with negative weights?',
      options: [
        { id: 'opt-a', label: 'A', text: 'Once a node is marked as visited / finalized, the greedy choice assumption precludes relaxing its cost via a later negative edge.' },
        { id: 'opt-b', label: 'B', text: 'A min-heap cannot store negative integer values without integer overflow.' },
        { id: 'opt-c', label: 'C', text: 'Negative weights convert undirected graphs into non-planar hypergraphs.' },
        { id: 'opt-d', label: 'D', text: 'It triggers infinite recursion during depth-first tree traversal.' },
      ],
      correctAnswer: 'opt-a',
      explanation: 'Dijkstras greedy invariant assumes that once a vertex with the minimum tentative distance is popped from the priority queue, no shorter path to that vertex can exist. A negative edge encountered later in the traversal can violate this monotonicity.',
      difficulty: 'Medium',
      isSample: false,
    };

    const q3: Question = {
      id: 'q-dsa-3',
      documentId: doc1.id,
      subjectId: sub1.id,
      topicId: top2.id,
      topicName: 'Bellman-Ford & Negative Cycles',
      type: 'MCQ',
      prompt: 'In the Bellman-Ford algorithm, how many relaxation passes over all edges are required in the worst-case for a graph with V vertices to guarantee shortest paths in the absence of negative cycles?',
      options: [
        { id: 'opt-a', label: 'A', text: 'V passes' },
        { id: 'opt-b', label: 'B', text: 'V - 1 passes' },
        { id: 'opt-c', label: 'C', text: 'log(V) passes' },
        { id: 'opt-d', label: 'D', text: '2V passes' },
      ],
      correctAnswer: 'opt-b',
      explanation: 'Any simple shortest path in a graph of V vertices contains at most V - 1 edges. Each complete pass of edge relaxation guarantees that paths of length k are correctly calculated.',
      difficulty: 'Easy',
      isSample: false,
    };

    const q4: Question = {
      id: 'q-dsa-4',
      documentId: doc1.id,
      subjectId: sub1.id,
      topicId: top2.id,
      topicName: 'Bellman-Ford & Negative Cycles',
      type: 'FILL_IN_BLANK',
      prompt: 'To detect if a graph contains a negative-weight cycle reachable from the source vertex, we perform an additional relaxation pass. If any distance value can still be ___________, a negative cycle exists.',
      correctAnswer: 'decreased',
      explanation: 'In the V-th relaxation step of Bellman-Ford, if dist[u] + weight(u, v) < dist[v], the distance can still be decreased, demonstrating that an infinitely negative cycle exists along the path.',
      difficulty: 'Medium',
      isSample: false,
    };

    const q5: Question = {
      id: 'q-dsa-5',
      documentId: doc1.id,
      subjectId: sub1.id,
      topicId: top1.id,
      topicName: "Dijkstra's Algorithm",
      type: 'SHORT_ANSWER',
      prompt: 'State the difference in edge requirements between Prim’s Minimum Spanning Tree algorithm and Dijkstra’s Shortest Path algorithm.',
      correctAnswer: 'Prims algorithm finds a minimum spanning tree minimizing total tree weight and works with negative edge weights, whereas Dijkstras algorithm finds shortest paths from a single root and strictly requires all edge weights to be non-negative.',
      explanation: 'Prims algorithm operates on global edge minimization to connect all vertices into a spanning tree and is unaffected by negative weights (provided the graph is connected), whereas Dijkstras greedy choice property breaks if negative weights exist.',
      difficulty: 'Hard',
      isSample: false,
    };

    [q1, q2, q3, q4, q5].forEach(q => this.questions.set(q.id, q));

    // Assessments
    const assess1: Assessment = {
      id: 'asmt-graphs-comprehensive',
      title: 'Graph Traversal & Shortest Path Mastery',
      description: 'Comprehensive test covering Dijkstra’s priority queue implementation, Bellman-Ford edge relaxations, and negative cycle detection derived from Course Module 4.',
      subjectId: sub1.id,
      subjectName: sub1.name,
      documentId: doc1.id,
      documentTitle: doc1.title,
      createdById: facultyUser.id,
      durationMinutes: 15,
      totalQuestions: 5,
      totalPoints: 50,
      passPercentage: 70,
      type: 'MIXED',
      difficulty: 'Medium',
      isAiGenerated: true,
      isSample: false,
      createdAt: '2026-10-22T10:00:00Z',
      questions: [q1, q2, q3, q4, q5],
    };

    // Assessment 2 (Operating Systems)
    const qOs1: Question = {
      id: 'q-os-1',
      documentId: doc2.id,
      subjectId: sub2.id,
      topicId: top3.id,
      topicName: 'Translation Lookaside Buffer (TLB)',
      type: 'MCQ',
      prompt: 'What happens when a CPU generates a virtual memory address that is not present in the hardware Translation Lookaside Buffer (TLB)?',
      options: [
        { id: 'opt-a', label: 'A', text: 'A TLB miss occurs, triggering a multi-level page table walk in main memory or a software trap.' },
        { id: 'opt-b', label: 'B', text: 'The kernel immediately terminates the running process with SIGSEGV.' },
        { id: 'opt-c', label: 'C', text: 'The CPU switches automatically from 64-bit protected mode into real 16-bit address mode.' },
        { id: 'opt-d', label: 'D', text: 'The operating system flushes the entire L1/L2 data cache.' },
      ],
      correctAnswer: 'opt-a',
      explanation: 'A TLB miss means the hardware cache does not have the translated frame address. The Memory Management Unit (MMU) performs a page table walk across page directory levels. If the page is valid in memory, the TLB is updated.',
      difficulty: 'Medium',
      isSample: false,
    };

    const qOs2: Question = {
      id: 'q-os-2',
      documentId: doc2.id,
      subjectId: sub2.id,
      topicId: top3.id,
      topicName: 'Translation Lookaside Buffer (TLB)',
      type: 'MCQ',
      prompt: 'Which page replacement policy is immune to Belady’s Anomaly (where increasing the number of page frames leads to more page faults)?',
      options: [
        { id: 'opt-a', label: 'A', text: 'First-In, First-Out (FIFO)' },
        { id: 'opt-b', label: 'B', text: 'Least Recently Used (LRU)' },
        { id: 'opt-c', label: 'C', text: 'Second-Chance Clock Algorithm' },
        { id: 'opt-d', label: 'D', text: 'Random Eviction' },
      ],
      correctAnswer: 'opt-b',
      explanation: 'LRU is a stack algorithm (inclusion property: the set of pages in memory with n frames is always a subset of the pages with n+1 frames). Stack algorithms are mathematically proven to be immune to Beladys anomaly.',
      difficulty: 'Medium',
      isSample: false,
    };

    const qOs3: Question = {
      id: 'q-os-3',
      documentId: doc2.id,
      subjectId: sub2.id,
      topicId: top3.id,
      topicName: 'Translation Lookaside Buffer (TLB)',
      type: 'FILL_IN_BLANK',
      prompt: 'When a process spends substantially more time paging pages in and out of disk rather than executing CPU instructions, the system enters a state called ___________.',
      correctAnswer: 'thrashing',
      explanation: 'Thrashing occurs when the sum of active processes working sets exceeds available physical RAM frames, causing continuous high disk I/O and near zero CPU throughput.',
      difficulty: 'Easy',
      isSample: false,
    };

    [qOs1, qOs2, qOs3].forEach(q => this.questions.set(q.id, q));

    const assess2: Assessment = {
      id: 'asmt-os-paging',
      title: 'Virtual Memory & TLB Architecture Examination',
      description: 'Covers hardware page address translation, multi-level hierarchical paging, TLB hit rates, and Belady’s anomaly.',
      subjectId: sub2.id,
      subjectName: sub2.name,
      documentId: doc2.id,
      documentTitle: doc2.title,
      createdById: facultyUser.id,
      durationMinutes: 10,
      totalQuestions: 3,
      totalPoints: 30,
      passPercentage: 65,
      type: 'MIXED',
      difficulty: 'Medium',
      isAiGenerated: true,
      isSample: false,
      createdAt: '2026-10-24T14:00:00Z',
      questions: [qOs1, qOs2, qOs3],
    };

    [assess1, assess2].forEach(a => this.assessments.set(a.id, a));

    // 8. Completed Test Attempt for Alex Chen
    const attempt1: TestAttempt = {
      id: 'att-alex-graphs-1',
      assessmentId: assess1.id,
      assessmentTitle: assess1.title,
      subjectName: sub1.name,
      studentId: studentUser.id,
      studentName: studentUser.name,
      startedAt: '2026-10-25T11:00:00Z',
      submittedAt: '2026-10-25T11:11:42Z',
      expiresAt: '2026-10-25T11:15:00Z',
      durationSeconds: 702,
      status: 'COMPLETED',
      score: 40,
      percentage: 80,
      passed: true,
      totalQuestions: 5,
      correctCount: 4,
      flaggedQuestions: ['q-dsa-5'],
      answers: {
        'q-dsa-1': 'opt-c',
        'q-dsa-2': 'opt-a',
        'q-dsa-3': 'opt-b',
        'q-dsa-4': 'decreased',
        'q-dsa-5': 'Prims works on trees while Dijkstra is for shortest paths.',
      },
    };
    this.attempts.set(attempt1.id, attempt1);

    const result1: AssessmentResult = {
      id: 'res-alex-graphs-1',
      attemptId: attempt1.id,
      assessmentId: assess1.id,
      assessmentTitle: assess1.title,
      subjectName: sub1.name,
      studentId: studentUser.id,
      totalScore: 40,
      maxScore: 50,
      percentage: 80,
      passed: true,
      grade: 'A-',
      levelAchieved: 'Advanced',
      durationSeconds: 702,
      submittedAt: attempt1.submittedAt!,
      strengths: ['Dijkstra Heap Optimization', 'Bellman-Ford Convergence', 'Negative Cycle Identification'],
      weakTopics: ['Distinction between MST and Single-Source Path Formulations'],
      recommendations: [
        'Review the mathematical proof for why Dijkstra fails with negative cycles.',
        'Solve 3 practice problems comparing Prim and Kruskal cut properties.',
      ],
      questionBreakdown: [
        { question: q1, studentAnswer: 'O(E + V log V)', isCorrect: true, points: 10, explanation: q1.explanation },
        { question: q2, studentAnswer: 'Greedy choice assumption prevents revisitation', isCorrect: true, points: 10, explanation: q2.explanation },
        { question: q3, studentAnswer: 'V - 1 passes', isCorrect: true, points: 10, explanation: q3.explanation },
        { question: q4, studentAnswer: 'decreased', isCorrect: true, points: 10, explanation: q4.explanation },
        { question: q5, studentAnswer: 'Prims works on trees while Dijkstra is for shortest paths.', isCorrect: false, points: 0, explanation: q5.explanation },
      ],
    };
    this.results.set(result1.id, result1);

    // 9. Topic Performance Records for Alex Chen
    const tp1: TopicPerformance = {
      id: 'tp-1',
      studentId: studentUser.id,
      subjectId: sub1.id,
      subjectName: sub1.name,
      topicName: "Dijkstra's Algorithm",
      attemptsCount: 8,
      correctCount: 7,
      masteryPercentage: 88,
      currentLevel: 'Advanced',
      lastEvaluatedAt: '2026-10-25T11:15:00Z',
    };

    const tp2: TopicPerformance = {
      id: 'tp-2',
      studentId: studentUser.id,
      subjectId: sub1.id,
      subjectName: sub1.name,
      topicName: 'Bellman-Ford & Negative Cycles',
      attemptsCount: 6,
      correctCount: 5,
      masteryPercentage: 83,
      currentLevel: 'Advanced',
      lastEvaluatedAt: '2026-10-25T11:15:00Z',
    };

    const tp3: TopicPerformance = {
      id: 'tp-3',
      studentId: studentUser.id,
      subjectId: sub1.id,
      subjectName: sub1.name,
      topicName: 'Dynamic Programming & Memoization',
      attemptsCount: 10,
      correctCount: 6,
      masteryPercentage: 60,
      currentLevel: 'Intermediate',
      lastEvaluatedAt: '2026-10-21T16:00:00Z',
    };

    const tp4: TopicPerformance = {
      id: 'tp-4',
      studentId: studentUser.id,
      subjectId: sub2.id,
      subjectName: sub2.name,
      topicName: 'Virtual Memory & Paging',
      attemptsCount: 5,
      correctCount: 5,
      masteryPercentage: 100,
      currentLevel: 'Proficient',
      lastEvaluatedAt: '2026-10-23T14:30:00Z',
    };

    const tp5: TopicPerformance = {
      id: 'tp-5',
      studentId: studentUser.id,
      subjectId: sub2.id,
      subjectName: sub2.name,
      topicName: 'Multi-threaded Synchronization & Mutexes',
      attemptsCount: 7,
      correctCount: 4,
      masteryPercentage: 57,
      currentLevel: 'Basic',
      lastEvaluatedAt: '2026-10-22T09:45:00Z',
    };

    [tp1, tp2, tp3, tp4, tp5].forEach(tp => this.topicPerformances.set(tp.id, tp));

    // 10. Daily Progress Points for Alex (Past 14 days)
    const alexDaily: DailyProgressPoint[] = [
      { date: 'Oct 15', studyMinutes: 45, testsAttempted: 1, averageScore: 78, consistencyPoints: 10 },
      { date: 'Oct 16', studyMinutes: 60, testsAttempted: 2, averageScore: 82, consistencyPoints: 10 },
      { date: 'Oct 17', studyMinutes: 90, testsAttempted: 2, averageScore: 85, consistencyPoints: 10 },
      { date: 'Oct 18', studyMinutes: 30, testsAttempted: 1, averageScore: 75, consistencyPoints: 10 },
      { date: 'Oct 19', studyMinutes: 75, testsAttempted: 2, averageScore: 88, consistencyPoints: 10 },
      { date: 'Oct 20', studyMinutes: 110, testsAttempted: 3, averageScore: 90, consistencyPoints: 10 },
      { date: 'Oct 21', studyMinutes: 50, testsAttempted: 1, averageScore: 70, consistencyPoints: 10 },
      { date: 'Oct 22', studyMinutes: 65, testsAttempted: 1, averageScore: 84, consistencyPoints: 10 },
      { date: 'Oct 23', studyMinutes: 120, testsAttempted: 3, averageScore: 92, consistencyPoints: 10 },
      { date: 'Oct 24', studyMinutes: 85, testsAttempted: 2, averageScore: 86, consistencyPoints: 10 },
      { date: 'Oct 25', studyMinutes: 95, testsAttempted: 2, averageScore: 80, consistencyPoints: 10 },
      { date: 'Oct 26', studyMinutes: 70, testsAttempted: 1, averageScore: 85, consistencyPoints: 10 },
      { date: 'Oct 27', studyMinutes: 105, testsAttempted: 2, averageScore: 89, consistencyPoints: 10 },
      { date: 'Oct 28', studyMinutes: 80, testsAttempted: 1, averageScore: 88, consistencyPoints: 10 },
    ];
    this.dailyProgress.set(studentUser.id, alexDaily);

    // Weekly scores
    const alexWeekly: WeeklyScorePoint[] = [
      { week: 'Wk 38', score: 68, testsTaken: 4 },
      { week: 'Wk 39', score: 72, testsTaken: 6 },
      { week: 'Wk 40', score: 77, testsTaken: 8 },
      { week: 'Wk 41', score: 81, testsTaken: 7 },
      { week: 'Wk 42', score: 84, testsTaken: 10 },
      { week: 'Wk 43', score: 86, testsTaken: 9 },
    ];
    this.weeklyScores.set(studentUser.id, alexWeekly);

    // 11. Faculty Feedback
    const fb1: FacultyFeedback = {
      id: 'fb-1',
      facultyId: facultyUser.id,
      facultyName: facultyUser.name,
      studentId: studentUser.id,
      attemptId: attempt1.id,
      assessmentTitle: assess1.title,
      title: 'Strong Mastery of Shortest Path Formulations',
      message: 'Great execution on the Fibonacci heap derivation and Bellman-Ford passes. I noticed you stumbled slightly on the contrast between MST and single-source paths in the short answer. Let us discuss Prim’s cut property in our upcoming session.',
      isPrivate: true,
      createdAt: '2026-10-26T09:30:00Z',
      isRead: false,
    };

    const fb2: FacultyFeedback = {
      id: 'fb-2',
      facultyId: facultyUser.id,
      facultyName: facultyUser.name,
      studentId: studentUser2.id,
      title: 'Support Session for Operating Systems Concurrency',
      message: 'Marcus, you have missed the last two weekly practice sets on Semaphore and Lock synchronization. Please review the lecture notes and book an advisory meeting so we can bridge this gap before midterms.',
      isPrivate: true,
      createdAt: '2026-10-24T16:00:00Z',
      isRead: true,
    };

    [fb1, fb2].forEach(fb => this.facultyFeedback.set(fb.id, fb));

    // 12. Faculty Meetings
    const meet1: FacultyMeeting = {
      id: 'meet-1',
      facultyId: facultyUser.id,
      facultyName: facultyUser.name,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      title: 'Bi-Weekly Academic Progress & Placement Review',
      agenda: 'Review Graph Algorithms proficiency, discuss dynamic programming weak spots, and outline mock interview schedule.',
      scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(), // in 2 days
      durationMinutes: 30,
      status: 'SCHEDULED',
      meetingUrl: 'https://meet.google.com/edupulse-adv-alex',
      notes: 'Alex is tracking at Advanced level (82.4%). Preparing for graduate technical assessments.',
      createdAt: '2026-10-25T15:00:00Z',
    };

    const meet2: FacultyMeeting = {
      id: 'meet-2',
      facultyId: facultyUser.id,
      facultyName: facultyUser.name,
      studentId: studentUser2.id,
      studentName: studentUser2.name,
      studentEmail: studentUser2.email,
      title: 'Academic Intervention & Recovery Plan',
      agenda: 'Diagnose study bottlenecks in CS201 and build structured 15-minute daily practice schedule.',
      scheduledAt: new Date(Date.now() + 1 * 86400000).toISOString(),
      durationMinutes: 45,
      status: 'SCHEDULED',
      meetingUrl: 'https://meet.google.com/edupulse-adv-marcus',
      notes: 'Marcus is flagged as At-Risk due to low consistency (2 days) and 54.2% test average.',
      createdAt: '2026-10-26T11:00:00Z',
    };

    [meet1, meet2].forEach(m => this.facultyMeetings.set(m.id, m));

    // 13. Audit Logs
    this.auditLogs = [
      { id: 'log-1', userId: adminUser.id, userName: adminUser.name, action: 'SYSTEM_INIT', resource: 'Database', details: 'Initialized EduPulse database schemas and default departments', ipAddress: '127.0.0.1', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'log-2', userId: adminUser.id, userName: adminUser.name, action: 'CREATE_FACULTY', resource: 'Users', details: 'Provisioned faculty account for Dr. Sarah Vance (CSE Dept)', ipAddress: '127.0.0.1', createdAt: '2026-10-02T09:12:00Z' },
      { id: 'log-3', userId: facultyUser.id, userName: facultyUser.name, action: 'GENERATE_ASSESSMENT', resource: 'Assessments', details: 'AI Assessment generated for CS201 Module 4 Graphs (5 questions)', ipAddress: '192.168.1.45', createdAt: '2026-10-22T10:00:00Z' },
      { id: 'log-4', userId: studentUser.id, userName: studentUser.name, action: 'SUBMIT_TEST', resource: 'Attempts', details: 'Submitted test asmt-graphs-comprehensive: Score 40/50 (80%)', ipAddress: '192.168.1.102', createdAt: '2026-10-25T11:11:42Z' },
      { id: 'log-5', userId: facultyUser.id, userName: facultyUser.name, action: 'FEEDBACK_POSTED', resource: 'FacultyFeedback', details: 'Sent private academic feedback to Alex Chen', ipAddress: '192.168.1.45', createdAt: '2026-10-26T09:30:00Z' },
    ];
  }

  // Helper calculation for overall student progress according to 50/25/15/10 weights
  calculateStudentProgress(studentId: string) {
    const studentAttempts = Array.from(this.attempts.values()).filter(a => a.studentId === studentId && a.status === 'COMPLETED');
    const topics = Array.from(this.topicPerformances.values()).filter(tp => tp.studentId === studentId);
    const daily = this.dailyProgress.get(studentId) || [];
    const profile = this.studentProfiles.get(studentId);

    // 1. Assessment Performance (50%): Average of completed test percentages
    let assessmentScore = 0;
    if (studentAttempts.length > 0) {
      const sum = studentAttempts.reduce((acc, a) => acc + a.percentage, 0);
      assessmentScore = sum / studentAttempts.length;
    } else {
      assessmentScore = 75; // Baseline neutral initialization
    }

    // 2. Topic Mastery (25%): Average of topic mastery percentages
    let masteryScore = 0;
    if (topics.length > 0) {
      const sum = topics.reduce((acc, t) => acc + t.masteryPercentage, 0);
      masteryScore = sum / topics.length;
    } else {
      masteryScore = 70;
    }

    // 3. Practice Consistency (15%): Streak & weekly study frequency (streak / 14 capped at 100%)
    const streak = profile?.consistencyStreak || 7;
    const consistencyScore = Math.min(100, (streak / 14) * 100);

    // 4. Improvement Over Time (10%): Trajectory of recent tests vs early tests
    let improvementScore = 80;
    if (studentAttempts.length >= 2) {
      const sorted = [...studentAttempts].sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime());
      const firstScore = sorted[0].percentage;
      const lastScore = sorted[sorted.length - 1].percentage;
      const delta = lastScore - firstScore;
      improvementScore = Math.min(100, Math.max(0, 75 + delta * 1.5));
    }

    // Weighted Total: 50% + 25% + 15% + 10%
    const weights = this.settings;
    const totalWeightedScore = (
      (assessmentScore * (weights.assessmentWeight / 100)) +
      (masteryScore * (weights.topicMasteryWeight / 100)) +
      (consistencyScore * (weights.consistencyWeight / 100)) +
      (improvementScore * (weights.improvementWeight / 100))
    );

    const roundedScore = Math.round(totalWeightedScore * 10) / 10;

    // Determine Learning Level:
    // Beginner < 40%, Basic 40-59%, Intermediate 60-74%, Advanced 75-89%, Proficient 90-100%
    let currentLevel: 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced' | 'Proficient' = 'Beginner';
    let nextLevel: 'Basic' | 'Intermediate' | 'Advanced' | 'Proficient' | 'Max Level' = 'Basic';
    let pointsToNext = 0;

    if (roundedScore >= weights.proficientMin) {
      currentLevel = 'Proficient';
      nextLevel = 'Max Level';
      pointsToNext = 0;
    } else if (roundedScore >= weights.intermediateMax + 1) {
      currentLevel = 'Advanced';
      nextLevel = 'Proficient';
      pointsToNext = Math.round((weights.proficientMin - roundedScore) * 10) / 10;
    } else if (roundedScore >= weights.basicMax + 1) {
      currentLevel = 'Intermediate';
      nextLevel = 'Advanced';
      pointsToNext = Math.round((weights.intermediateMax + 1 - roundedScore) * 10) / 10;
    } else if (roundedScore >= weights.beginnerMax + 1) {
      currentLevel = 'Basic';
      nextLevel = 'Intermediate';
      pointsToNext = Math.round((weights.basicMax + 1 - roundedScore) * 10) / 10;
    } else {
      currentLevel = 'Beginner';
      nextLevel = 'Basic';
      pointsToNext = Math.round((weights.beginnerMax + 1 - roundedScore) * 10) / 10;
    }

    // Update student profile cache
    if (profile) {
      profile.overallScore = roundedScore;
      profile.currentLevel = currentLevel;
    }

    return {
      overallScore: roundedScore,
      currentLevel,
      nextLevel,
      pointsToNextLevel: pointsToNext,
      consistencyStreak: streak,
      totalTestsCompleted: studentAttempts.length,
      averagePassRate: studentAttempts.length > 0 ? Math.round((studentAttempts.filter(a => a.passed).length / studentAttempts.length) * 100) : 100,
      studyTimeHours: Math.round((daily.reduce((acc, d) => acc + d.studyMinutes, 0) / 60) * 10) / 10,
      weights: {
        assessmentPerformance: weights.assessmentWeight,
        topicMastery: weights.topicMasteryWeight,
        practiceConsistency: weights.consistencyWeight,
        improvementOverTime: weights.improvementWeight,
      },
      componentScores: {
        assessmentScore: Math.round(assessmentScore * 10) / 10,
        masteryScore: Math.round(masteryScore * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 10) / 10,
        improvementScore: Math.round(improvementScore * 10) / 10,
      },
      levelThresholds: {
        Beginner: weights.beginnerMax,
        Basic: weights.basicMax,
        Intermediate: weights.intermediateMax,
        Advanced: weights.advancedMax,
        Proficient: weights.proficientMin,
      },
    };
  }

  // Assigned students with performance analytics for faculty
  getFacultyAssignedStudents(facultyId: string): AssignedStudent[] {
    const studentUserIds = this.facultyAssignments.get(facultyId) || new Set();
    const list: AssignedStudent[] = [];

    for (const userId of studentUserIds) {
      const user = this.users.get(userId);
      const profile = this.studentProfiles.get(userId);
      if (!user || !profile) continue;

      const attempts = Array.from(this.attempts.values()).filter(a => a.studentId === userId && a.status === 'COMPLETED');
      const topics = Array.from(this.topicPerformances.values()).filter(tp => tp.studentId === userId);
      const weak = topics.filter(tp => tp.masteryPercentage < 65).map(tp => tp.topicName);

      // Check at-risk conditions: consistency < 3 days or overall score < 60%
      const atRisk = profile.overallScore < 60 || profile.consistencyStreak <= 2;
      let riskReason = undefined;
      if (profile.overallScore < 60 && profile.consistencyStreak <= 2) {
        riskReason = 'Low test score average (<60%) and inactive study consistency (streak <= 2 days)';
      } else if (profile.overallScore < 60) {
        riskReason = 'Overall assessment average is below required benchmark (60%)';
      } else if (profile.consistencyStreak <= 2) {
        riskReason = 'Low study frequency; has missed recent scheduled practice';
      }

      list.push({
        studentId: userId,
        userId: userId,
        name: user.name,
        email: user.email,
        rollNumber: profile.rollNumber,
        departmentName: profile.departmentName || 'Computer Science & Engineering',
        currentLevel: profile.currentLevel,
        overallScore: profile.overallScore,
        consistencyStreak: profile.consistencyStreak,
        testsCompleted: attempts.length,
        lastActiveAt: profile.lastActiveAt,
        atRisk,
        riskReason,
        weakTopics: weak.length > 0 ? weak : ['None identified (performing well)'],
      });
    }

    return list;
  }
}

export const db = new DatabaseStore();
