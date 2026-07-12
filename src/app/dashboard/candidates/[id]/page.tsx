import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { ScheduleForm } from '@/components/interviews/schedule-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StageChanger } from '@/components/candidates/stage-changer';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CandidatePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;
  if (!workspaceId) return <div>No workspace found</div>;

  const resolvedParams = await params;
  
  const candidate = await prisma.candidate.findUnique({
    where: { id: resolvedParams.id },
    include: {
      job: true,
      interviews: {
        include: {
          interviewer: true,
          scorecard: true,
        },
        orderBy: { scheduledAt: 'asc' },
      },
    },
  });

  if (!candidate || candidate.job.workspaceId !== workspaceId) {
    notFound();
  }

  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
  });

  const interviewers = workspaceMembers.map(m => ({
    id: m.userId,
    name: m.user.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/candidates">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{candidate.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Applied for <Link href={`/dashboard/jobs/${candidate.jobId}`} className="font-medium underline">{candidate.job.title}</Link>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{candidate.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current Stage</div>
              <div><StageChanger candidateId={candidate.id} currentStage={candidate.stage} /></div>
            </div>
            {candidate.resumeUrl && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Resume</div>
                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  View Resume
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Interview</CardTitle>
            <CardDescription>Schedule a new interview for this candidate.</CardDescription>
          </CardHeader>
          <CardContent>
            {['OFFER', 'HIRED', 'REJECTED'].includes(candidate.stage) ? (
              <p className="text-muted-foreground text-sm border border-dashed rounded-lg p-4 text-center">
                This candidate is in the <strong>{candidate.stage}</strong> stage. Scheduling new interviews is disabled.
              </p>
            ) : (
              <ScheduleForm candidateId={candidate.id} interviewers={interviewers} />
            )}
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Interviews</h3>
      <div className="space-y-4">
        {candidate.interviews.length === 0 ? (
          <p className="text-muted-foreground">No interviews scheduled yet.</p>
        ) : (
          candidate.interviews.map(interview => (
            <Card key={interview.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Interview with {interview.interviewer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  {interview.status === 'COMPLETED' ? (
                    <Badge variant="default">Completed</Badge>
                  ) : interview.status === 'CANCELLED' ? (
                    <Badge variant="destructive">Cancelled</Badge>
                  ) : (
                    <Badge variant="secondary">Scheduled</Badge>
                  )}
                </div>
                <div>
                  {interview.scorecard ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">Score: {interview.scorecard.overallRating}/5</span>
                      {session?.user?.id && interview.interviewerId === session.user.id && (
                        <Link href={`/dashboard/interviews/${interview.id}/scorecard`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                      )}
                    </div>
                  ) : interview.status === 'COMPLETED' ? (
                    <span className="text-sm text-muted-foreground italic">Waiting for scorecard</span>
                  ) : session?.user?.id && interview.interviewerId === session.user.id ? (
                    <Link href={`/dashboard/interviews/${interview.id}/scorecard`}>
                      <Button variant="outline" size="sm">Submit Scorecard</Button>
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Waiting for {interview.interviewer.name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
