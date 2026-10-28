# Docker Compose Local Setup Guide

This guide walks you through running the EduPulse full-stack platform locally on your computer with Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+) or Docker Engine + Docker Compose Plugin (v2+).
- Node.js 20+ (optional, if running outside Docker).
- Git.

## Quick Start (One Command)

1. **Clone or open the repository folder in VS Code**:
   ```bash
   cd student-progress-platform
   ```

2. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. **Start All Services with Docker Compose**:
   ```bash
   docker compose up --build
   ```

   This launches:
   - `postgres`: PostgreSQL 16 on port `5432` with health check.
   - `backend`: Express Node API on port `4000`.
   - `frontend`: React SPA on port `3000`.

4. **Run Prisma Migrations & Seed Data**:
   In a second terminal window:
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npm run prisma:seed
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Pre-Seeded Development Test Accounts

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Student** | `alex@edupulse.edu` | `Password123!` | Alex Chen (CS-2024-042, Advanced level, 82.4%) |
| **Faculty** | `sarah.vance@edupulse.edu` | `Password123!` | Dr. Sarah Vance (Associate Professor, CSE) |
| **Admin** | `admin@edupulse.edu` | `Password123!` | Eleanor Ward (Platform Administrator) |

## Stopping the Containers

```bash
docker compose down
```

To clean up persistent database volumes:
```bash
docker compose down -v
```
