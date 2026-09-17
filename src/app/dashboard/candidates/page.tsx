import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CandidateWorkstation } from '@/components/candidates/candidate-workstation';

interface CandidatesPageProps {
  searchParams: Promise<{
    search?: string;
    jobId?: string;
  }>;
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;
  if (!workspaceId) return <div>No workspace found</div>;

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const jobId = resolvedParams.jobId || '';

  // We fetch candidates for all jobs in this workspace with rich relations
  const candidates = await prisma.candidate.findMany({
    where: {
      job: {
        workspaceId,
        ...(jobId ? { id: jobId } : {}),
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      job: {
        select: { id: true, title: true },
      },
      interviews: {
        include: {
          interviewer: { select: { name: true } },
          scorecard: { select: { overallRating: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const jobs = await prisma.job.findMany({
    where: { workspaceId },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="h-full">
      <CandidateWorkstation
        initialCandidates={candidates}
        jobs={jobs}
        selectedJobId={jobId}
        initialSearch={search}
      />
    </div>
  );
}
