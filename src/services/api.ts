const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;
  private demoUserId: string | null = 'usr-student-alex';

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('edupulse_token') : null;
    const savedDemoUser = typeof window !== 'undefined' ? localStorage.getItem('edupulse_demo_user_id') : null;
    if (savedDemoUser) {
      this.demoUserId = savedDemoUser;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('edupulse_token', token);
    } else {
      localStorage.removeItem('edupulse_token');
    }
  }

  setDemoUserId(userId: string | null) {
    this.demoUserId = userId;
    if (userId) {
      localStorage.setItem('edupulse_demo_user_id', userId);
    } else {
      localStorage.removeItem('edupulse_demo_user_id');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.demoUserId) {
      headers['x-demo-user-id'] = this.demoUserId;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}: ${res.statusText}`);
    }
    return data as T;
  }

  // Auth
  async login(credentials: any) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) this.setToken(data.token);
    if (data.user?.id) this.setDemoUserId(data.user.id);
    return data;
  }

  async register(studentData: any) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    if (data.token) this.setToken(data.token);
    if (data.user?.id) this.setDemoUserId(data.user.id);
    return data;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    this.setToken(null);
    return this.request<any>('/auth/logout', { method: 'POST' });
  }

  async switchDemo(role: 'STUDENT' | 'FACULTY' | 'ADMIN') {
    const data = await this.request<any>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (data.token) this.setToken(data.token);
    if (data.user?.id) this.setDemoUserId(data.user.id);
    return data;
  }

  // Subjects
  async getSubjects() {
    return this.request<{ subjects: any[] }>('/subjects');
  }

  async getSubject(id: string) {
    return this.request<any>(`/subjects/${id}`);
  }

  async enrollSubject(id: string) {
    return this.request<any>(`/subjects/${id}/enroll`, { method: 'POST' });
  }

  async createSubject(subject: any) {
    return this.request<any>('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  }

  // Documents
  async getDocuments(subjectId?: string) {
    const q = subjectId ? `?subjectId=${subjectId}` : '';
    return this.request<{ documents: any[] }>(`/documents${q}`);
  }

  async getDocument(id: string) {
    return this.request<any>(`/documents/${id}`);
  }

  async uploadDocument(formData: FormData) {
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadSimulatedDocument(payload: { title: string; subjectId: string; textContent: string; originalFilename?: string }) {
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteDocument(id: string) {
    return this.request<any>(`/documents/${id}`, { method: 'DELETE' });
  }

  async processDocument(id: string) {
    return this.request<any>(`/documents/${id}/process`, { method: 'POST' });
  }

  // Assessments
  async getAssessments(subjectId?: string, type?: string) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (type) params.append('type', type);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ assessments: any[] }>(`/assessments${q}`);
  }

  async getAssessment(id: string) {
    return this.request<any>(`/assessments/${id}`);
  }

  async generateAssessment(config: any) {
    return this.request<any>('/assessments/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async startAttempt(assessmentId: string) {
    return this.request<any>(`/assessments/${assessmentId}/start`, { method: 'POST' });
  }

  async saveAnswer(attemptId: string, questionId: string, answer: string, isFlagged?: boolean) {
    return this.request<any>(`/assessments/attempts/${attemptId}/answers`, {
      method: 'PUT',
      body: JSON.stringify({ questionId, answer, isFlagged }),
    });
  }

  async submitAttempt(assessmentId: string, attemptId: string) {
    return this.request<any>(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ attemptId }),
    });
  }

  async getAttemptResult(attemptId: string) {
    return this.request<any>(`/assessments/attempts/${attemptId}/result`);
  }

  // Progress
  async getProgressOverview() {
    return this.request<{ overview: any; profile: any }>('/progress/overview');
  }

  async getDailyProgress() {
    return this.request<{ daily: any[] }>('/progress/daily');
  }

  async getWeeklyProgress() {
    return this.request<{ weekly: any[] }>('/progress/weekly');
  }

  async getMonthlyProgress() {
    return this.request<{ monthly: any[] }>('/progress/monthly');
  }

  async getSubjectProgress() {
    return this.request<{ subjects: any[] }>('/progress/subjects');
  }

  async getTopicProgress() {
    return this.request<{ topics: any[] }>('/progress/topics');
  }

  async getTestHistory() {
    return this.request<{ history: any[] }>('/progress/history');
  }

  // Faculty
  async getFacultyDashboard() {
    return this.request<any>('/faculty/dashboard');
  }

  async getFacultyStudents(search?: string, level?: string, atRisk?: boolean) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (level) params.append('level', level);
    if (atRisk) params.append('atRisk', 'true');
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ students: any[] }>(`/faculty/students${q}`);
  }

  async getFacultyStudentDetail(id: string) {
    return this.request<any>(`/faculty/students/${id}`);
  }

  async sendFacultyFeedback(data: any) {
    return this.request<any>('/faculty/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleFacultyMeeting(data: any) {
    return this.request<any>('/faculty/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFacultyMeeting(id: string, updates: any) {
    return this.request<any>(`/faculty/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  getFacultyReportCsvUrl() {
    return `${API_BASE}/faculty/reports`;
  }

  // Admin
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminUsers(role?: string, search?: string) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ users: any[] }>(`/admin/users${q}`);
  }

  async createAdminUser(userData: any) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async assignFaculty(facultyId: string, studentId: string) {
    return this.request<any>('/admin/assign-faculty', {
      method: 'POST',
      body: JSON.stringify({ facultyId, studentId }),
    });
  }

  async getAdminSettings() {
    return this.request<{ settings: any }>('/admin/settings');
  }

  async updateAdminSettings(settings: any) {
    return this.request<any>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async getAdminAuditLogs() {
    return this.request<{ auditLogs: any[] }>('/admin/audit-logs');
  }
}

export const api = new ApiClient();
