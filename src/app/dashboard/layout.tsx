import { ReactNode } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { CommandPalette } from '@/components/command-palette';
import { isSuperAdmin } from '@/lib/superadmin';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

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
  const workspaceName = member?.workspace?.name || 'My Workspace';
  const role = member?.role || 'MEMBER';
  const superAdmin = isSuperAdmin(session.user.email);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <DashboardSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={workspaceName}
        role={role}
        isSuperAdmin={superAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CommandPalette />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-hidden flex flex-col min-h-0 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
