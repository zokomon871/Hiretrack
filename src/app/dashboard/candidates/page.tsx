import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { KanbanBoard } from '@/components/candidates/kanban-board';
import { SearchInput } from '@/components/candidates/search-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  // We fetch candidates for all jobs in this workspace
  const candidates = await prisma.candidate.findMany({
    where: {
      job: {
        workspaceId,
        ...(jobId ? { id: jobId } : {}),
      },
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    },
    orderBy: { createdAt: 'desc' },
  });

  const jobs = await prisma.job.findMany({
    where: { workspaceId },
    select: { id: true, title: true }
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Candidates Pipeline</h2>
          <p className="text-muted-foreground">
            Drag and drop candidates to update their stage in the hiring process.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SearchInput defaultValue={search} />
          </div>
          <Link href="/dashboard/candidates/new">
            <Button>Add Candidate</Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialCandidates={candidates} />
      </div>
    </div>
  );
}
