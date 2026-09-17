import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateStage } from '@prisma/client';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user's workspace
  const userWithWorkspace = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      workspaceMembers: {
        include: {
          workspace: true,
        },
      },
    },
  });

  const member = userWithWorkspace?.workspaceMembers[0];
  const workspaceId = member?.workspaceId;
  const workspaceName = member?.workspace?.name || 'Workspace';

  let jobsCount = 0;
  let candidatesCount = 0;
  let interviewsCount = 0;
  let stageStats: Record<string, number> = {
    APPLIED: 0,
    SCREENING: 0,
    INTERVIEW: 0,
    OFFER: 0,
    HIRED: 0,
    REJECTED: 0,
  };
  let upcomingInterviews: any[] = [];
  let recentActivities: any[] = [];

  if (workspaceId) {
    jobsCount = await prisma.job.count({ where: { workspaceId } });

    candidatesCount = await prisma.candidate.count({
      where: {
        job: { workspaceId },
      },
    });

    interviewsCount = await prisma.interview.count({
      where: {
        candidate: {
          job: { workspaceId },
        },
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
    });

    // Stage breakdown
    const candidateStages = await prisma.candidate.groupBy({
      by: ['stage'],
      where: { job: { workspaceId } },
      _count: { stage: true },
    });

    candidateStages.forEach((stat) => {
      stageStats[stat.stage] = stat._count.stage;
    });

    // Upcoming interviews with details
    upcomingInterviews = await prisma.interview.findMany({
      where: {
        candidate: { job: { workspaceId } },
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: {
        candidate: { select: { id: true, name: true, stage: true } },
        interviewer: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 4,
    });

    // Activity log
    recentActivities = await prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  }

  const STAGE_ORDER: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];

  return (
    <div className="space-y-8">
      {/* Workspace Header Command Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {workspaceName}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Recruiting Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pipeline health, upcoming interview rounds, and real-time team activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/candidates/new">
            <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Add Candidate
            </Button>
          </Link>
          <Link href="/dashboard/jobs/new">
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Jobs */}
        <Link href="/dashboard/jobs" className="group">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Jobs</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight">{jobsCount}</div>
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center group-hover:text-primary transition-colors">
                View jobs <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* Total Candidates */}
        <Link href="/dashboard/candidates" className="group">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Candidates in Pipeline</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight">{candidatesCount}</div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Active funnel
              </span>
            </div>
          </div>
        </Link>

        {/* Upcoming Interviews */}
        <Link href="/dashboard/candidates" className="group">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Upcoming Interviews</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight">{interviewsCount}</div>
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center group-hover:text-primary transition-colors">
                Scheduled <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* Hired Candidates */}
        <Link href="/dashboard/candidates" className="group">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Hired Candidates</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight">{stageStats.HIRED || 0}</div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Accepted offers
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Visual Pipeline Conversion Funnel */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pipeline Velocity & Stage Conversion
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live candidate distribution across your hiring stages.
            </p>
          </div>
          <Link href="/dashboard/candidates">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary gap-1">
              Open Workstation <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {STAGE_ORDER.map((stage) => {
            const count = stageStats[stage] || 0;
            const percentage = candidatesCount > 0 ? Math.round((count / candidatesCount) * 100) : 0;

            return (
              <div
                key={stage}
                className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground capitalize">
                    {stage.toLowerCase()}
                  </span>
                  <span className="text-[11px] font-bold text-foreground">{count}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  {percentage}% of pipeline
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Upcoming Interviews & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews Schedule */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Upcoming Interviews
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {upcomingInterviews.length} Scheduled
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((intv) => (
                <div
                  key={intv.id}
                  className="p-4 rounded-xl bg-muted/25 border border-border/70 flex items-center justify-between text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{intv.candidate.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {intv.candidate.stage}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>Interviewer: {intv.interviewer?.name || 'Assigned Member'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(intv.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <Link href={`/dashboard/candidates/${intv.candidate.id}`}>
                      <Button variant="outline" size="sm" className="h-6 text-[11px] px-2">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
                <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-medium text-foreground">No upcoming interviews</p>
                <p className="text-[11px] mt-0.5">Schedule an interview round from any candidate profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Live Workspace Activity
            </h3>
            <span className="text-xs text-muted-foreground font-medium">Recent events</span>
          </div>

          <div className="flex-1 space-y-3">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-border/60">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="py-2.5 flex items-start gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 text-muted-foreground leading-relaxed">
                      {activity.details}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 shrink-0 whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
                <p className="text-xs font-medium text-foreground">No activity recorded yet</p>
                <p className="text-[11px] mt-0.5">Actions taken in your workspace will stream here live.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
