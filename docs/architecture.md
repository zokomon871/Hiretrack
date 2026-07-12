# Architecture

HireTrack is a monolithic full-stack Next.js application built to demonstrate senior-level product engineering.

## Data Model

```mermaid
erDiagram
    WORKSPACE ||--o{ WORKSPACE_MEMBER : "has"
    WORKSPACE ||--o{ JOB : "posts"
    WORKSPACE_MEMBER }o--|| USER : "belongs to"
    
    JOB ||--o{ CANDIDATE : "receives"
    
    CANDIDATE ||--o{ INTERVIEW : "undergoes"
    USER ||--o{ INTERVIEW : "conducts"
    
    INTERVIEW ||--o| SCORECARD : "generates"
    USER ||--o{ SCORECARD : "writes"
    
    USER {
        string id PK
        string email
        string password
    }
    
    WORKSPACE {
        string id PK
        string name
    }
    
    WORKSPACE_MEMBER {
        string id PK
        string role "ADMIN | MEMBER | VIEWER"
    }
    
    JOB {
        string id PK
        string title
        string status "OPEN | DRAFT | CLOSED"
    }
    
    CANDIDATE {
        string id PK
        string name
        string email
        string stage "APPLIED | SCREENING | INTERVIEW | OFFER | HIRED | REJECTED"
    }
    
    INTERVIEW {
        string id PK
        datetime scheduledAt
        string status "SCHEDULED | COMPLETED | CANCELLED"
    }
    
    SCORECARD {
        string id PK
        int overallRating
        int technicalSkill
        string notes
    }
```

## Authentication & Authorization

Authentication is handled securely using **Auth.js (NextAuth.js v5)**. Passwords are hashed with `bcryptjs` and stored safely in PostgreSQL. Upon a successful login, Auth.js signs a secure, HTTP-only JWT token that stores the user's `id`.

Authorization is enforced at both the middleware routing level and the database mutation level:
- **Routing**: `src/proxy.ts` strictly guards the `/dashboard/*` routes. Unauthenticated users are hard-redirected to `/login`.
- **Data Access (RBAC)**: When performing server actions (like `updateCandidateStage` or `submitScorecard`), the server explicitly fetches the authenticated user's `WorkspaceMember` relationship. If a user tries to mutate a Candidate that does not belong to a Job inside their authorized Workspace, the action throws an `Unauthorized` error. Furthermore, Scorecards can only be submitted by the explicitly assigned `interviewerId` for that specific Interview.
