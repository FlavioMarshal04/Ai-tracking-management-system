import express from 'express';
import authRoutes from './routes/auth.ts';
import subjectRoutes from './routes/subjects.ts';
import documentRoutes from './routes/documents.ts';
import assessmentRoutes from './routes/assessments.ts';
import progressRoutes from './routes/progress.ts';
import facultyRoutes from './routes/faculty.ts';
import adminRoutes from './routes/admin.ts';
import { db } from './db/store.ts';

export function createApp() {
  const app = express();

  // Basic CORS & Parser
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-demo-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dbConnected: true,
      usersCount: db.users.size,
      assessmentsCount: db.assessments.size,
      documentsCount: db.documents.size,
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
}

export const app = createApp();
