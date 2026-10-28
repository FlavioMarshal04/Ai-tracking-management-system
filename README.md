# EduPulse: AI-Powered Student Progress Tracking & Assessment Platform

EduPulse is an institutional-grade, full-stack academic progress tracking and online examination platform. It ingests course PDF lecture materials, extracts topics, generates curriculum-grounded assessments via server-side AI (Gemini 2.5 Flash with fallback to a curriculum sample provider), scores attempts with deadline enforcement, computes progress using a 50/25/15/10 multi-factor formula, and enables 1-on-1 faculty mentorship and administrative governance.

---

## 🚀 Quick Start in VS Code

### Option 1: Direct Local Execution (Fastest)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Full-Stack Server** (Express backend on port 3000 with Vite middleware):
   ```bash
   npm run dev
   ```

3. **Open the Application**:
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

### Option 2: Full Docker Compose with PostgreSQL

1. **Launch Containers**:
   ```bash
   docker compose up --build
   ```
   This spins up:
   - `postgres`: PostgreSQL 16 on port 5432 with health check and persistent storage.
   - `backend`: Express Node API on port 4000.
   - `frontend`: React SPA on port 3000.

2. **Apply Migrations and Seed Data**:
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npm run prisma:seed
   ```

3. **Access the App**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔑 Pre-Seeded Test Credentials

All accounts are pre-configured with the password: `Password123!`

| Role | Email | Password | Persona & Highlights |
|------|-------|----------|----------------------|
| **Student** | `alex@edupulse.edu` | `Password123!` | **Alex Chen** (CS-2024-042) · Advanced level (82.4%) · 12-day streak · Enrolled in CS201, CS304 |
| **Faculty** | `sarah.vance@edupulse.edu` | `Password123!` | **Dr. Sarah Vance** · CSE Associate Professor · Mentor to Alex, Marcus & Priya |
| **Admin** | `admin@edupulse.edu` | `Password123!` | **Eleanor Ward** · Dean of Computing · Formula weights & audit log governance |

> **Note**: A one-click **Demo Switcher** banner is always available at the top right of the application for instant evaluation between student, faculty, and administrator workflows without manual re-login.

---

## 📂 Project Structure

```
student-progress-platform/
├── backend/                  # Standalone backend project
│   ├── prisma/               # 27 Prisma models, migrations & seed
│   ├── src/                  # Express routes, controllers & services
│   ├── Dockerfile            # Multi-stage production container
│   ├── package.json
│   └── .env.example
├── frontend/                 # Standalone frontend project
│   ├── src/                  # React 19, Recharts & Tailwind CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docs/                     # Engineering documentation
│   ├── ARCHITECTURE.md       # High-level architecture & 50/25/15/10 math
│   ├── API_SPECIFICATION.md  # Exhaustive REST API endpoints
│   ├── DOCKER_GUIDE.md       # Docker Compose setup instructions
│   └── DEPLOYMENT_GUIDE.md   # Free-tier cloud deployment options
├── server/                   # AI Studio full-stack server
│   ├── app.ts                # Express application
│   ├── db/store.ts           # In-memory store with rich seed data
│   ├── middleware/auth.ts    # JWT & RBAC authorization
│   ├── routes/               # Auth, Subjects, Documents, Assessments...
│   └── services/             # AIService, PDFService, ScoringService
├── src/                      # React SPA source code
│   ├── components/           # Navbar, Sidebar, StatCards, Modals
│   ├── context/              # AuthContext, ToastContext
│   ├── pages/                # Dashboards, TestTaking, Analytics, Faculty
│   ├── services/api.ts       # Centralized REST API client
│   └── types/                # Domain TypeScript interfaces
├── tests/                    # Automated Vitest test suites
├── docker-compose.yml        # Multi-container orchestration
├── server.ts                 # Full-stack dev & production entry point
└── README.md
```

---

## 🧠 Key Features

### 1. Student Features
- **Progress Portfolio**: 50/25/15/10 weighted overall evaluation with 5 learning level tiers: Beginner (<40%), Basic (40-59%), Intermediate (60-74%), Advanced (75-89%), Proficient (90-100%).
- **PDF Extraction**: Upload course lecture slides or use sample presets (DSA Graph Algorithms, OS Virtual Memory, DL Attention).
- **AI Assessment Generator**: Synthesizes MCQs, fill-in-the-blanks, and short answers grounded in course material.
- **Examination Mode**: Live countdown timer, question palette with answered/flagged states, auto-saving responses, and submission confirmation.
- **Detailed Explanations**: Instant server scoring with confetti animation, strengths & weaknesses, and deep pedagogical explanations for every question.
- **Recharts Analytics**: 14-day study consistency line charts and weekly score trajectory bar charts.

### 2. Faculty Features
- **Student Roster**: Filter assigned students by learning level and at-risk performance alerts.
- **Deep-Dive Profile**: Review any student's test history, weak concepts, and consistency streak.
- **Private Advisory Guidance**: Send targeted encouragement or study recommendations directly to students.
- **1-on-1 Consultations**: Schedule video consultations with Google Meet integration.
- **CSV Export**: One-click download of cohort progress reports.

### 3. Administrator Features
- **Formula Weights Editor**: Adjust the 50/25/15/10 progress formula with real-time sum validation.
- **User Governance**: Provision faculty and admin accounts (public registration is restricted strictly to students).
- **Mentorship Assignments**: Assign students to faculty mentors.
- **Security Audit Logs**: Real-time tamper-evident stream of all system actions.

---

## 🧪 Testing

Run the automated test suite with Vitest:
```bash
npm test
```
