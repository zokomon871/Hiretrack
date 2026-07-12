import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CandidateForm } from '@/components/candidates/candidate-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function NewCandidatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;
  if (!workspaceId) return <div>No workspace found</div>;

  const jobs = await prisma.job.findMany({
    where: { workspaceId, status: 'OPEN' },
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Candidate</h2>
          <p className="text-muted-foreground">
            Manually add a candidate to an open job pipeline.
          </p>
        </div>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You need at least one open job to add a candidate.</p>
            <Link href="/dashboard/jobs/new">
              <Button>Create Job</Button>
            </Link>
          </div>
        ) : (
          <CandidateForm jobs={jobs} />
        )}
      </div>
    </div>
  );
}
