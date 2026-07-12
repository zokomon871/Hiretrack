import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { InviteForm } from '@/components/team/invite-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function TeamPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const currentUserWithWorkspace = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      workspaceMembers: true,
    },
  });

  const memberInfo = currentUserWithWorkspace?.workspaceMembers[0];
  if (!memberInfo) {
    return <div>No workspace found.</div>;
  }

  const isAdmin = memberInfo.role === 'ADMIN';

  // Get all members of the workspace
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: memberInfo.workspaceId },
    include: { user: true },
  });

  // Get pending invitations
  const pendingInvitations = await prisma.invitation.findMany({
    where: { workspaceId: memberInfo.workspaceId },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Settings</h2>
      </div>

      {isAdmin && (
        <div className="w-full max-w-2xl">
          <InviteForm />
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4">Current Members</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaceMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.name || 'N/A'}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Pending Invitations</h3>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{invitation.role}</TableCell>
                    <TableCell>{new Date(invitation.expiresAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
