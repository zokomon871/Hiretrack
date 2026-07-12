import { PrismaClient, Role, JobStatus, CandidateStage, InterviewStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcryptjs'
dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing data (in case of re-seeding)
  await prisma.scorecard.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.job.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create a Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Corp',
    },
  })
  console.log(`Created workspace: ${workspace.name}`)

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'alice@acmecorp.com',
      password: defaultPassword,
      workspaceMembers: {
        create: {
          workspaceId: workspace.id,
          role: Role.ADMIN,
        },
      },
    },
  })

  const recruiter = await prisma.user.create({
    data: {
      name: 'Bob Recruiter',
      email: 'bob@acmecorp.com',
      password: defaultPassword,
      workspaceMembers: {
        create: {
          workspaceId: workspace.id,
          role: Role.MEMBER,
        },
      },
    },
  })

  const interviewer = await prisma.user.create({
    data: {
      name: 'Charlie Interviewer',
      email: 'charlie@acmecorp.com',
      password: defaultPassword,
      workspaceMembers: {
        create: {
          workspaceId: workspace.id,
          role: Role.VIEWER,
        },
      },
    },
  })
  console.log('Created users (Admin, Member, Viewer)')

  // 3. Create Jobs
  const frontendJob = await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      description: 'Looking for a senior frontend engineer with React and Next.js experience.',
      status: JobStatus.OPEN,
      workspaceId: workspace.id,
    },
  })

  const salesJob = await prisma.job.create({
    data: {
      title: 'Account Executive',
      department: 'Sales',
      description: 'B2B Sales role focusing on mid-market accounts.',
      status: JobStatus.OPEN,
      workspaceId: workspace.id,
    },
  })
  console.log('Created jobs')

  // 4. Create Candidates
  const cand1 = await prisma.candidate.create({
    data: {
      name: 'David Developer',
      email: 'david@example.com',
      stage: CandidateStage.INTERVIEW,
      jobId: frontendJob.id,
    },
  })

  const cand2 = await prisma.candidate.create({
    data: {
      name: 'Eve Engineer',
      email: 'eve@example.com',
      stage: CandidateStage.OFFER,
      jobId: frontendJob.id,
    },
  })

  const cand3 = await prisma.candidate.create({
    data: {
      name: 'Sam Sales',
      email: 'sam@example.com',
      stage: CandidateStage.SCREENING,
      jobId: salesJob.id,
    },
  })
  console.log('Created candidates')

  // 5. Create Interviews & Scorecards
  const interview = await prisma.interview.create({
    data: {
      candidateId: cand1.id,
      interviewerId: interviewer.id,
      scheduledAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Yesterday
      status: InterviewStatus.COMPLETED,
    },
  })

  await prisma.scorecard.create({
    data: {
      interviewId: interview.id,
      reviewerId: interviewer.id,
      technicalSkill: 4,
      cultureFit: 4,
      communication: 4,
      overallRating: 4,
      notes: 'Strong technical skills, good communication. Needs a bit more architecture experience.',
    },
  })
  console.log('Created interviews and scorecards')

  console.log('Seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
