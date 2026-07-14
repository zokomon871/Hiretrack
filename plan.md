# HireTrack Implementation Plan

This document outlines the step-by-step execution plan followed to build the HireTrack Applicant Tracking System.

## Phase 1: Foundation & Setup
1. **Next.js Initialization**: Scaffolded the project using Next.js 15 App Router (`npx create-next-app@latest`).
2. **Database & ORM**: Configured PostgreSQL database and initialized Prisma ORM.
3. **Authentication Setup**: Implemented Auth.js (NextAuth v5) using `@auth/prisma-adapter`.
4. **UI Framework**: Set up Tailwind CSS and installed `shadcn/ui` for a premium, accessible component library.

## Phase 2: Schema Design
Modeled the relational database in `prisma/schema.prisma` to support multi-tenancy and the ATS workflow:
- **Core**: `User`, `Account`, `Session` (Auth.js standards)
- **Multi-Tenancy**: `Workspace`, `WorkspaceMember` (Roles: ADMIN, MEMBER, VIEWER)
- **ATS Logic**: `Job`, `Candidate`, `Interview`, `Scorecard`
- Ran database migrations (`npx prisma db push`).

## Phase 3: Core Features
1. **Workspace & Role-Based Access**: 
   - Built a secure routing layer (`src/proxy.ts`) to guard `/dashboard` routes.
   - Enforced database-level authorization (users can only access data within their assigned Workspace).
2. **Authentication Flow**:
   - Built a custom login and signup form (`/login`, `/signup`).
   - Integrated Email/Password Credentials provider.
   - Integrated Google & GitHub OAuth providers, including a custom `createUser` hook to automatically provision Workspaces for new OAuth signups.
3. **Job Management**:
   - Created the `/dashboard/jobs` view to list, create, and manage open requisitions.
4. **Candidate Pipeline (Kanban)**:
   - Built a dynamic Kanban board (`/dashboard/candidates`) using `@hello-pangea/dnd`.
   - Mapped Candidate stages (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`) to draggable columns.
5. **Interview Scheduling & Scorecards**:
   - Built the ability to schedule interviews linking a Candidate to an Interviewer (User).
   - Created the Scorecard submission form allowing interviewers to rate candidates on Technical Skill, Culture Fit, and Communication (1-5 scale) with detailed notes.

## Phase 4: UI/UX & Polish
1. **Premium Design**:
   - Applied a sleek aesthetic using `shadcn/ui` components (glassmorphism, clean typography).
   - Implemented a Dark Mode / Light Mode toggle using `next-themes`.
2. **Search & Filtering**:
   - Added a debounced search bar on the candidate pipeline that syncs with the URL state.
3. **Manual Candidate Addition**:
   - Added a quick "Add Candidate" form for recruiters to manually inject candidates into the pipeline.
4. **Team Invites & Magic Auto-Join**:
   - Built the backend logic and UI for Admins to invite colleagues via email and assign roles.
   - Implemented a "Magic Auto-Join" flow: when an invited user signs up via OAuth, the system automatically detects their email, skips the workspace creation step, and seamlessly deposits them into the inviter's workspace with the correct role.
5. **Performance & Security Tuning**:
   - Refactored database access patterns to eliminate waterfall queries, drastically reducing latency.
   - Implemented `src/proxy.ts` (Next.js 16+ edge routing convention) for strict route protection.

## Phase 5: SEO & Documentation
1. **SEO Optimization**:
   - Configured dynamic metadata (Title, Description).
   - Generated dynamic `sitemap.ts` and `robots.txt`.
   - Designed OpenGraph images for social sharing.
2. **Documentation**:
   - Wrote a comprehensive `README.md` with setup instructions and environment variable details.
   - Generated `architecture.md` with Mermaid ERD diagrams.
   - Created this `plan.md` document.

## Next Steps (Post-Submission)
- Deploy the application to Vercel.
- Configure third-party email providers (e.g., Resend) to dispatch the generated team invite tokens.
- Hook up Google/Outlook Calendar integrations for interview scheduling.
