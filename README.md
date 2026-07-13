# HireTrack

> An applicant pipeline with scorecards and interview scheduling for recruiters.

![Hero screenshot](docs/screenshots/hero.png)


## Features
- Manages candidate pipelines through a drag-and-drop Kanban board with quick manual addition.
- Enforces strict role-based access control (Admin, Member, Viewer) for workspace members.
- Advanced "Magic Auto-Join" system that allows new team members to automatically join the correct workspace simply by logging in via OAuth, bypassing the need for manual email verification links.
- Generates structured scorecards to capture 1-5 ratings across technical, cultural, and communication metrics.
- Schedules and tracks upcoming interview appointments.
- Secures all API endpoints with NextAuth.js JWT sessions, bcrypt hashed passwords, and OAuth integration (Google & GitHub) protected by Edge Middleware.
- Heavily optimized database queries to eliminate waterfalls and fetch data efficiently.
- Validates all client and server input using shared Zod schemas.
- Features a premium, responsive UI with automatic Dark/Light mode toggling based on system preferences.

## Tech Stack
Next.js · TypeScript · PostgreSQL (Prisma) · Tailwind · Auth.js · Vercel

## Quick Start
```bash
git clone https://github.com/zokomon871/Hiretrack.git && cd hiretrack
cp .env.example .env # then fill in values
npm install
npm run db:migrate && npm run db:seed
npm run dev # http://localhost:3000
```

## Environment Variables
| Variable | Description |
| --- | --- |
| DATABASE_URL | Postgres connection string |
| AUTH_SECRET | Session signing secret |
| NEXTAUTH_URL | App URL (http://localhost:3000) |
| AUTH_GOOGLE_ID | Google OAuth Client ID |
| AUTH_GOOGLE_SECRET | Google OAuth Client Secret |
| AUTH_GITHUB_ID | GitHub OAuth Client ID |
| AUTH_GITHUB_SECRET | GitHub OAuth Client Secret |

## Architecture
HireTrack uses a standard Next.js App Router architecture with a monolithic backend powered by Prisma ORM. Server Actions handle all mutations with optimistic UI updates on the client. See [docs/architecture.md](docs/architecture.md) for data models and diagrams.

## Testing
```bash
npm run lint # TypeScript typechecking and ESLint
```

## Roadmap
- [x] Shipped drag-and-drop candidate pipeline
- [x] Shipped 1-to-1 interview scorecards
- [ ] Add public /careers landing page for candidates to apply
- [ ] Add integration with external calendars (Google Calendar/Outlook)

## Screenshots
[Include screenshots of the dashboard, kanban board, and scorecard here]

## License
MIT — see [LICENSE](LICENSE).

---

### Demo credentials
To view the application without signing up, use the following credentials:
- **Email:** `alice@acmecorp.com` (Admin)
- **Password:** `password123`
