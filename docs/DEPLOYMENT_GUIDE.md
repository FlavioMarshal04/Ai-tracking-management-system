# Free-Tier Cloud Deployment Guide

This guide details how to deploy EduPulse to cost-effective and free-tier cloud platforms.

## 1. Database (PostgreSQL)

You can provision a free managed PostgreSQL instance on any of the following:
- **Supabase**: 500MB free PostgreSQL database.
- **Neon**: 0.5GB compute free-tier serverless PostgreSQL.
- **Render**: Free managed PostgreSQL (expires every 90 days on free plan).

Set your production connection string:
```
DATABASE_URL="postgresql://user:password@host:5432/edupulse?sslmode=require"
```

## 2. Express Backend (Render / Railway / Fly.io)

### Option A: Render Web Service
1. Link your GitHub repository.
2. Select **Root Directory**: `backend` (or root with `server.ts`).
3. Set **Build Command**: `npm install && npx prisma generate && npm run build`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `GEMINI_API_KEY` (optional)
   - `PORT=10000`

### Option B: Railway
1. Create new project from GitHub repository.
2. Railway automatically detects Dockerfile or Node.js.
3. Attach PostgreSQL plugin and link `DATABASE_URL`.

## 3. React Frontend (Vercel / Netlify / Cloudflare Pages)

1. Deploy the `frontend` folder or root SPA.
2. Set **Framework Preset**: `Vite`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
