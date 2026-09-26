# Agent Standards & Migration Guide

## 📚 Workspace Rules (from `GEMINI.md`)
- **Reusable UI components**: Always use components from `components/ui/` (e.g., `<Input>`, `<Button>`, `<Select>`) instead of raw HTML elements.
- **Readable conditionals**: Avoid nested ternary operators. Use explicit `if/else`, early returns, or separate helper components/variables.

## 🎨 Front‑end Standards
- **Design System**: Follow the premium design guidelines – vibrant color palette, glass‑morphism style, subtle micro‑animations, and Google Fonts (Inter/Roboto).
- **Component Architecture**:
  - All UI lives under `components/ui/` and is exported via an index file.
  - Pages import only from the UI library; never duplicate markup.
- **Routing**: Use Next.js `app/` directory conventions, `router.push` for navigation, and feature‑flag driven UI (e.g., payment options).
- **Accessibility**: Use proper `aria-` attributes, focus outlines, and semantic HTML.
- **State Management**: Prefer React hooks (`useState`, `useEffect`) and context for global state. Keep business logic inside services.

## 🛠️ Backend Standards (NestJS)
- **Framework**: NestJS with TypeScript, Prisma ORM, and JWT authentication.
- **Modules**: Every domain (e.g., `organizations`, `sales`, `payments`) lives in its own Nest module.
- **Transaction Handling**: Use `prisma.$transaction` for multi‑step operations. Increase interactive timeout if needed.
- **Feature Flags**: Guard UI/logic with simple boolean flags stored in the DB or `.env`.
- **Error Handling**: Throw Nest `HttpException`s with clear messages; log errors via a centralized logger.
- **Auth**: JWT strategy now includes `organization` relationship for easy access in the UI.

## 🚀 Deployment & Migration Workflow
1. **Branch‑first Development** (Neon):
   - Create a new branch for each feature (`neon branch create`).
   - The branch gets its own isolated Postgres instance.
2. **Prisma Migrations**:
   - Run `npx prisma migrate dev --name <desc>` on the branch.
   - Commit migration files (SQL) to the repo.
   - When ready, merge to `main`; the CI pipeline runs `npx prisma migrate deploy` against the production Neon branch.
3. **CI/CD** (GitHub Actions):
   - Lint → Test → Build (`npm run build`).
   - Deploy API to **Render** (or any Docker host) using the built image.
   - Deploy Web app to **Vercel** (auto‑detects Next.js). Environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEON_DATABASE_URL`, etc.) are stored in each platform’s dashboard.
4. **Rollback**:
   - Neon supports point‑in‑time restores. Use `neon reset_from_parent` on a branch if a migration fails.
   - For the web, revert the last Vercel deployment via the Vercel UI.
5. **Feature‑Flag Release**:
   - Keep new UI bits hidden behind a flag in the DB (`feature_flags` table) or a `.env` variable.
   - Flip the flag in the UI (admin page) once the backend is verified.

## 📦 How Migration Works (Neon)
- **Push‑based**: When a PR merges, the CI job runs `prisma migrate deploy` which applies pending migrations to the **production** Neon branch.
- **Branch Isolation**: Developers can test migrations on a branch‑specific Neon endpoint without affecting prod data.
- **Egress Optimization**: Large migrations are run on‑branch to minimise data transfer; only the diffs are sent to production.
- **Verification**: After `deploy`, a smoke‑test script (`scripts/verify-deploy.ts`) runs a basic query against the API to ensure the schema is functional.

## 📌 Where We Have Deployed
- **Frontend**: Vercel (`apps/web`).
- **API**: Render (Docker container running NestJS). URL is stored in `.env` as `API_URL`.
- **Database**: Neon Serverless Postgres – each branch has its own endpoint, production endpoint is `*` (default).
- **Static Assets**: Neon Object Storage (S3‑compatible) – used for uploads.
- **AI Gateway**: Neon AI Gateway (if needed for future LLM features).

---
*This file serves as a living reference for any future agent implementation. Keep it updated as standards evolve.*
