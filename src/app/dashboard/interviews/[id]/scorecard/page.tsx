import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { ScorecardForm } from '@/components/scorecards/scorecard-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ScorecardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const resolvedParams = await params;
  
  const interview = await prisma.interview.findUnique({
    where: { id: resolvedParams.id },
    include: {
      candidate: { include: { job: true } },
      scorecard: true,
    },
  });

  if (!interview || interview.interviewerId !== session.user.id) {
    notFound();
  }



  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Submit Scorecard</h2>
        <p className="text-muted-foreground mt-2">
          Interview with <strong>{interview.candidate.name}</strong> for the <strong>{interview.candidate.job.title}</strong> role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Form</CardTitle>
        </CardHeader>
        <CardContent>
          <ScorecardForm interviewId={interview.id} initialData={interview.scorecard} />
        </CardContent>
      </Card>
    </div>
  );
}
