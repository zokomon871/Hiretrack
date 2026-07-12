# Contributing to HireTrack

Thank you for your interest in contributing! This document outlines how to set up the project locally and our conventions for pull requests.

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hiretrack
   cd hiretrack
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your `.env` file with a valid PostgreSQL connection string. You can spin up a free database using Neon or Supabase.

3. **Install Dependencies & Seed Database**
   ```bash
   npm install
   npm run db:migrate # Pushes schema to your database
   npm run db:seed    # Populates the database with test workspaces and candidates
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Branch Naming**: 
   - Feature: `feat/short-description`
   - Bugfix: `fix/short-description`
   - Documentation: `docs/short-description`

2. **Commit Style**:
   We follow [Conventional Commits](https://www.conventionalcommits.org/).
   - `feat: add email notifications for scheduled interviews`
   - `fix: resolve hydration mismatch on dashboard`
   - `refactor: extract candidate card into separate component`

3. **Before Pushing**:
   Ensure you run the linting and type-checking scripts:
   ```bash
   npm run lint
   ```
   If any TypeScript errors or ESLint warnings are present, your PR will fail CI.

## Opening a PR

- Push your branch to GitHub.
- Open a Pull Request against the `main` branch.
- Ensure your PR description answers: "What changed and why?"
- Provide a Loom video or screenshots if you made visual changes.
