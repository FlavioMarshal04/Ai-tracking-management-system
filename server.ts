import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ [EduPulse] Vite development middleware mounted successfully.');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`📦 [EduPulse] Serving production static bundle from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 EduPulse AI-Powered Student Progress Platform Running!`);
    console.log(`📡 Local Server URL: http://localhost:${PORT}`);
    console.log(`🩺 Health Endpoint:  http://localhost:${PORT}/api/health`);
    console.log(`-------------------------------------------------------------`);
    console.log(`🔑 Development Seed Credentials (Password: Password123!):`);
    console.log(`   - Student:  alex@edupulse.edu     (Alex Chen - Advanced)`);
    console.log(`   - Faculty:  sarah.vance@edupulse.edu (Dr. Sarah Vance)`);
    console.log(`   - Admin:    admin@edupulse.edu   (Eleanor Ward)`);
    console.log(`=============================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
