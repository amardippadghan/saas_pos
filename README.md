# Multi-Tenant POS SaaS Platform

This is a modular, multi-tenant POS (Point of Sale) SaaS platform built for small and medium-sized businesses.

## Tech Stack
- **Monorepo**: Turborepo, npm workspaces
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL (via Docker Compose)
- **Caching/Queues**: Redis (via Docker Compose)

## Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v10.x or later)
- **Docker & Docker Compose** (for running PostgreSQL and Redis)

## Setup & Running Locally

1. **Install Dependencies**
   Install all dependencies for the workspace from the root folder:
   ```bash
   npm install
   ```

2. **Start Infrastructure (Database & Redis)**
   Launch PostgreSQL and Redis locally using Docker:
   ```bash
   docker-compose up -d
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (or in `apps/api`) with your database connection URL:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/pos_saas?schema=public"
   ```

4. **Initialize the Database**
   Push the Prisma schema to the database and generate the Prisma Client:
   ```bash
   cd apps/api
   npx prisma db push
   npx prisma generate
   cd ../..
   ```
   *(Note: You can also use `npx prisma migrate dev` in the future for controlled migrations)*

5. **Run the Application**
   You can start both the Next.js frontend and NestJS backend concurrently using Turborepo from the root directory:
   ```bash
   npm run dev
   ```
   
   - **Frontend (Next.js)** will be available at: `http://localhost:3000`
   - **Backend (NestJS API)** will be available at: `http://localhost:3000` (or whichever port NestJS configures, typically 3000, so you may want to change the API port to 3001 in `apps/api/src/main.ts`)

## Architecture Overview
- `apps/web`: Next.js business dashboard.
- `apps/api`: NestJS modular monolith backend.
- `apps/desktop`: Future Electron app for local hardware (printers).
- `packages/*`: Shared configurations and UI components across apps.
