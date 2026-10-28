# EduPulse REST API Specification

Base URL: `/api`

## Authentication

### `POST /api/auth/register`
Creates a new student account (Public registration is restricted exclusively to the `STUDENT` role).
- **Body**:
  ```json
  {
    "name": "Jordan Miller",
    "email": "jordan@edupulse.edu",
    "password": "Password123!",
    "rollNumber": "CS-2025-012",
    "departmentId": "dep-cse",
    "targetExam": "Tech Placements 2027"
  }
  ```
- **Response**: `201 Created` with JWT token and student profile.

### `POST /api/auth/login`
- **Body**: `{ "email": "alex@edupulse.edu", "password": "Password123!" }`
- **Response**: `200 OK` with `{ token, user, profile }`.

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ user, profile }`.

---

## Subjects & Documents

### `GET /api/subjects`
Returns all subjects with enrollment indicators.

### `POST /api/subjects/:id/enroll`
Toggles enrollment status for the current student.

### `POST /api/documents/upload`
Uploads a course PDF document (multipart/form-data or JSON with text content).
- **Response**: `201 Created` with `{ id, title, status, pageCount, wordCount, topicsExtracted }`.

---

## AI Assessments & Examinations

### `POST /api/assessments/generate`
Generates a new assessment from course materials using AI or the development sample provider.
- **Body**:
  ```json
  {
    "subjectId": "sub-dsa",
    "documentId": "doc-dsa-graphs",
    "type": "MIXED",
    "difficulty": "Medium",
    "questionCount": 5,
    "durationMinutes": 15
  }
  ```

### `POST /api/assessments/:id/start`
Starts a timed examination attempt. Answers are masked until submission.

### `PUT /api/assessments/attempts/:id/answers`
Auto-saves an individual question response or flag status.
- **Body**: `{ "questionId": "q-1", "answer": "opt-c", "isFlagged": false }`

### `POST /api/assessments/:id/submit`
Scores the assessment attempt server-side, commits transaction, and calculates:
- Percentage & Grade
- Topic mastery changes
- Deep AI explanations
- Streak & daily progress points

---

## Progress Analytics

### `GET /api/progress/overview`
Returns the 50/25/15/10 weighted score, current level, next level threshold, and component scores.

### `GET /api/progress/daily`
Returns 14-day study minutes and consistency records.

---

## Faculty Endpoints

### `GET /api/faculty/dashboard`
Assigned students overview, at-risk alerts, class average, upcoming meetings.

### `GET /api/faculty/students/:id`
Deep-dive into an assigned student's test history and weaknesses (Secured by assignment validation).

### `POST /api/faculty/feedback`
Sends private encouragement or academic recommendations.

### `GET /api/faculty/reports`
Downloads assigned students performance summary as CSV.

---

## Administrative Endpoints

### `GET /api/admin/dashboard`
Platform-wide health metrics and statistics.

### `POST /api/admin/users`
Allows administrators to provision new Faculty or Admin accounts.

### `PATCH /api/admin/settings`
Updates formula weights (validating that the sum equals 100%).
