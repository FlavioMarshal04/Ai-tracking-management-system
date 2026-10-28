# EduPulse System Architecture

EduPulse is an AI-powered student progress tracking, assessment generation, and faculty mentorship platform designed for universities and academic institutions.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   React 19 + Vite SPA (Tailwind CSS, Recharts, Lucide Icons)│
└───────────────────────────────┬─────────────────────────────┘
                                │ JSON / Multipart HTTP REST
┌───────────────────────────────▼─────────────────────────────┐
│                      Express Backend                        │
│   Auth & RBAC Middleware | Scoring Engine | Rate Limiter    │
├───────────────────────────────┬─────────────────────────────┤
│      PDF Extraction Service   │     AI Generation Service   │
│   pdf-parse + text chunking   │   Gemini 2.5 Flash / Sample │
└───────────────┬───────────────┴───────────────┬─────────────┘
                │ Prisma ORM                    │
┌───────────────▼───────────────┐ ┌─────────────▼─────────────┐
│     PostgreSQL Database       │ │ Persistent Local Storage  │
│   27 Relational Models & ACID │ │ Course PDFs & Uploads     │
└───────────────────────────────┘ └───────────────────────────┘
```

## 2. Multi-Factor Progress Calculation (50/25/15/10)

The student overall progress index is computed using a deterministic weighted formula:

$$Score = (0.50 \times Asmt) + (0.25 \times Mastery) + (0.15 \times Streak) + (0.10 \times Trajectory)$$

1. **Assessment Performance (50%)**: Mean percentage scored across all submitted test attempts.
2. **Topic Concept Mastery (25%)**: Average accuracy across all distinct curriculum topics.
3. **Practice Consistency (15%)**: Active study streak mapped onto a rolling 14-day threshold: $\min(100, \frac{streak}{14} \times 100)$.
4. **Improvement Trajectory (10%)**: Gradient delta between initial diagnostic attempts and recent test results.

### Learning Level Thresholds:
- **Beginner**: 0% – 39%
- **Basic**: 40% – 59%
- **Intermediate**: 60% – 74%
- **Advanced**: 75% – 89%
- **Proficient**: 90% – 100%

## 3. Server-Side AI PDF & Question Pipeline

1. **Upload & Verification**: Validates file size (max 15MB) and MIME type (`application/pdf`).
2. **Semantic Extraction**: Extracts clean text, filters noise, and computes word counts.
3. **Chunking**: Divides documents into overlapping chunks (800 words with 100-word overlap).
4. **Structured Generation**: Prompts Gemini 2.5 Flash with strict JSON Schema output.
5. **Development Fallback**: When `GEMINI_API_KEY` is not present, activates a verified curriculum sample provider, clearly marking `isSample: true`.

## 4. Role-Based Access Control (RBAC)

- **STUDENT**: Access own study documents, generate assessments, take timed tests, review detailed explanations, view progress charts, inspect faculty feedback.
- **FACULTY**: Restricted strictly to assigned students (enforced at the Express router level via `requireFacultyAssignment`). Schedule 1-on-1 consultations, issue feedback, export CSV reports.
- **ADMIN**: Universal oversight, create faculty accounts, manage system weights, assign students to faculty mentors, and inspect security audit logs.
