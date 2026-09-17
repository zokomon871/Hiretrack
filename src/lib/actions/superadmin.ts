'use server';

import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/superadmin';
import { CandidateStage, JobStatus, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

function revalidateAll() {
  revalidatePath('/superadmin');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/candidates');
  revalidatePath('/dashboard/jobs');
  revalidatePath('/dashboard/team');
  revalidatePath('/dashboard/interviews');
}

export async function getSuperAdminInitialData() {
  await verifySuperAdmin();

  const [
    users,
    accounts,
    sessions,
    verificationTokens,
    workspaces,
    workspaceMembers,
    invitations,
    jobs,
    candidates,
    interviews,
    scorecards,
    activityLogs,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        workspaceMembers: {
          include: {
            workspace: { select: { id: true, name: true } },
          },
        },
        accounts: {
          select: { provider: true, type: true },
        },
      },
    }),
    prisma.account.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.session.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.verificationToken.findMany(),
    prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: {
            jobs: true,
            members: true,
            invitations: true,
            activity: true,
          },
        },
      },
    }),
    prisma.workspaceMember.findMany({
      include: {
        workspace: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invitation.findMany({
      include: {
        workspace: { select: { id: true, name: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: { select: { id: true, name: true } },
        _count: {
          select: { candidates: true },
        },
      },
    }),
    prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            workspace: { select: { id: true, name: true } },
          },
        },
        interviews: {
          select: { id: true, status: true, scheduledAt: true },
        },
      },
    }),
    prisma.interview.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        scorecard: true,
      },
    }),
    prisma.scorecard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        interview: {
          include: {
            candidate: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        workspace: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    counts: {
      users: users.length,
      workspaces: workspaces.length,
      jobs: jobs.length,
      candidates: candidates.length,
      interviews: interviews.length,
      scorecards: scorecards.length,
      invitations: invitations.length,
      activityLogs: activityLogs.length,
      accounts: accounts.length,
      sessions: sessions.length,
      verificationTokens: verificationTokens.length,
      workspaceMembers: workspaceMembers.length,
    },
    tables: {
      User: users,
      Account: accounts,
      Session: sessions,
      VerificationToken: verificationTokens,
      Workspace: workspaces,
      WorkspaceMember: workspaceMembers,
      Invitation: invitations,
      Job: jobs,
      Candidate: candidates,
      Interview: interviews,
      Scorecard: scorecards,
      ActivityLog: activityLogs,
    },
  };
}

// ---------------------- CREATE ACTIONS ----------------------

export async function superAdminCreateWorkspace(name: string) {
  const admin = await verifySuperAdmin();
  if (!name.trim()) return { error: 'Workspace name is required' };

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      ...(admin.id
        ? {
            members: {
              create: {
                userId: admin.id,
                role: 'ADMIN',
              },
            },
          }
        : {}),
    },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: workspace.id,
        userId: admin.id,
        action: 'SUPER_ADMIN_CREATE_WORKSPACE',
        details: `Super Admin ${admin.name || admin.email} created workspace "${workspace.name}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, workspace };
}

export async function superAdminCreateJob(data: {
  title: string;
  department?: string;
  description?: string;
  status?: JobStatus;
  workspaceId: string;
}) {
  const admin = await verifySuperAdmin();
  if (!data.title.trim()) return { error: 'Job title is required' };
  if (!data.workspaceId) return { error: 'Workspace ID is required' };

  const job = await prisma.job.create({
    data: {
      title: data.title.trim(),
      department: data.department?.trim() || null,
      description: data.description?.trim() || null,
      status: data.status || 'OPEN',
      workspaceId: data.workspaceId,
    },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_CREATE_JOB',
        details: `Super Admin ${admin.name || admin.email} created job "${job.title}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, job };
}

export async function superAdminCreateCandidate(data: {
  name: string;
  email: string;
  jobId: string;
  stage?: CandidateStage;
  resumeUrl?: string;
}) {
  const admin = await verifySuperAdmin();
  if (!data.name.trim()) return { error: 'Candidate name is required' };
  if (!data.email.trim()) return { error: 'Candidate email is required' };
  if (!data.jobId) return { error: 'Job is required' };

  const candidate = await prisma.candidate.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      jobId: data.jobId,
      stage: data.stage || 'APPLIED',
      resumeUrl: data.resumeUrl?.trim() || null,
    },
    include: { job: true },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: candidate.job.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_CREATE_CANDIDATE',
        details: `Super Admin ${admin.name || admin.email} added candidate "${candidate.name}" for job "${candidate.job.title}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, candidate };
}

export async function superAdminCreateUser(data: {
  name?: string;
  email: string;
  password?: string;
  workspaceId?: string;
  role?: Role;
}) {
  const admin = await verifySuperAdmin();
  if (!data.email.trim()) return { error: 'Email is required' };

  const existing = await prisma.user.findUnique({ where: { email: data.email.trim() } });
  if (existing) return { error: 'User with this email already exists' };

  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

  const user = await prisma.user.create({
    data: {
      name: data.name?.trim() || null,
      email: data.email.trim(),
      password: hashedPassword,
      ...(data.workspaceId
        ? {
            workspaceMembers: {
              create: {
                workspaceId: data.workspaceId,
                role: data.role || 'MEMBER',
              },
            },
          }
        : {}),
    },
  });

  revalidateAll();
  return { success: true, user };
}

// ---------------------- UPDATE ACTIONS ----------------------

export async function superAdminUpdateJob(data: {
  id: string;
  title: string;
  department?: string;
  description?: string;
  status: JobStatus;
}) {
  const admin = await verifySuperAdmin();
  if (!data.title.trim()) return { error: 'Job title is required' };

  const updated = await prisma.job.update({
    where: { id: data.id },
    data: {
      title: data.title.trim(),
      department: data.department?.trim() || null,
      description: data.description?.trim() || null,
      status: data.status,
    },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: updated.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_UPDATE_JOB',
        details: `Super Admin ${admin.name || admin.email} updated job "${updated.title}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, job: updated };
}

export async function superAdminUpdateCandidate(data: {
  id: string;
  name: string;
  email: string;
  stage: CandidateStage;
  resumeUrl?: string;
}) {
  const admin = await verifySuperAdmin();
  if (!data.name.trim()) return { error: 'Name is required' };
  if (!data.email.trim()) return { error: 'Email is required' };

  const updated = await prisma.candidate.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      stage: data.stage,
      resumeUrl: data.resumeUrl?.trim() || null,
    },
    include: { job: true },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: updated.job.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_UPDATE_CANDIDATE',
        details: `Super Admin ${admin.name || admin.email} updated candidate "${updated.name}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, candidate: updated };
}

export async function superAdminUpdateUser(data: {
  id: string;
  name?: string;
  email: string;
}) {
  await verifySuperAdmin();
  if (!data.email.trim()) return { error: 'Email is required' };

  const updated = await prisma.user.update({
    where: { id: data.id },
    data: {
      name: data.name?.trim() || null,
      email: data.email.trim(),
    },
  });

  revalidateAll();
  return { success: true, user: updated };
}

export async function superAdminUpdateCandidateStage(candidateId: string, stage: CandidateStage) {
  const admin = await verifySuperAdmin();
  const updated = await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage },
    include: { job: true },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: updated.job.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_STAGE_UPDATE',
        details: `Super Admin ${admin.name || admin.email} moved ${updated.name} to ${stage}.`,
      },
    });
  }

  revalidateAll();
  return { success: true, candidate: updated };
}

export async function superAdminUpdateJobStatus(jobId: string, status: JobStatus) {
  const admin = await verifySuperAdmin();
  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { status },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: updated.workspaceId,
        userId: admin.id,
        action: 'SUPER_ADMIN_JOB_STATUS_UPDATE',
        details: `Super Admin ${admin.name || admin.email} changed job "${updated.title}" status to ${status}.`,
      },
    });
  }

  revalidateAll();
  return { success: true, job: updated };
}

export async function superAdminUpdateWorkspaceName(workspaceId: string, name: string) {
  const admin = await verifySuperAdmin();
  if (!name.trim()) return { error: 'Workspace name cannot be empty' };

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: name.trim() },
  });

  if (admin.id) {
    await prisma.activityLog.create({
      data: {
        workspaceId: updated.id,
        userId: admin.id,
        action: 'SUPER_ADMIN_WORKSPACE_UPDATE',
        details: `Super Admin ${admin.name || admin.email} renamed workspace to "${updated.name}".`,
      },
    });
  }

  revalidateAll();
  return { success: true, workspace: updated };
}

export async function superAdminUpdateMemberRole(memberId: string, role: Role) {
  await verifySuperAdmin();
  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
  });

  revalidateAll();
  return { success: true, member: updated };
}

// ---------------------- DELETE ACTIONS ----------------------

export async function superAdminDeleteRecord(modelName: string, id: string) {
  const admin = await verifySuperAdmin();

  try {
    switch (modelName) {
      case 'Candidate':
        await prisma.candidate.delete({ where: { id } });
        break;
      case 'Job':
        await prisma.job.delete({ where: { id } });
        break;
      case 'Workspace':
        await prisma.workspace.delete({ where: { id } });
        break;
      case 'User':
        await prisma.user.delete({ where: { id } });
        break;
      case 'Interview':
        await prisma.interview.delete({ where: { id } });
        break;
      case 'Scorecard':
        await prisma.scorecard.delete({ where: { id } });
        break;
      case 'Invitation':
        await prisma.invitation.delete({ where: { id } });
        break;
      case 'WorkspaceMember':
        await prisma.workspaceMember.delete({ where: { id } });
        break;
      case 'ActivityLog':
        await prisma.activityLog.delete({ where: { id } });
        break;
      case 'Session':
        await prisma.session.delete({ where: { id } });
        break;
      case 'Account':
        await prisma.account.delete({ where: { id } });
        break;
      case 'VerificationToken':
        // VerificationToken unique is compound identifier_token
        await prisma.verificationToken.deleteMany({ where: { token: id } });
        break;
      default:
        return { error: `Model ${modelName} not supported for direct deletion` };
    }

    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to delete record from database' };
  }
}
