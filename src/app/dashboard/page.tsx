import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

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
          workspace: true
        }
      }
    }
  });

  const workspaceId = userWithWorkspace?.workspaceMembers[0]?.workspaceId;

  let jobsCount = 0;
  let candidatesCount = 0;
  let interviewsCount = 0;

  if (workspaceId) {
    jobsCount = await prisma.job.count({ where: { workspaceId } });
    
    // We count candidates belonging to jobs in this workspace
    candidatesCount = await prisma.candidate.count({
      where: {
        job: { workspaceId }
      }
    });

    interviewsCount = await prisma.interview.count({
      where: {
        candidate: {
          job: { workspaceId }
        },
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() }
      }
    });
  }

  // Fetch Activity Log for Activity feed
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      workspaceId
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <>
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidates in Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsCount}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Empty states or additional dashboard widgets could go here */}
      <div className="mt-8">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-0.5 shrink-0"></div>
                    <div className="flex-1 text-muted-foreground">
                      {activity.details}
                    </div>
                    <div className="text-muted-foreground text-xs whitespace-nowrap">
                      {activity.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p>No recent activity found.</p>
                <p className="text-sm">When actions are taken in your workspace, they will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
