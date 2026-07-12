'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { JobStatus } from '@prisma/client';
import { redirect } from 'next/navigation';

const jobSchema = z.object({
  title: z.string().min(2),
  department: z.nativeEnum(Department),
  location: z.string().min(2),
  status: z.nativeEnum(JobStatus).default('DRAFT'),
  description: z.string().optional(),
});

async function getWorkspaceId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;
  if (!workspaceId) throw new Error('No workspace found');
  
  return workspaceId;
}

export async function createJob(prevState: any, formData: FormData) {
  try {
    const workspaceId = await getWorkspaceId();
    const parsed = jobSchema.safeParse(Object.fromEntries(formData));
    
    if (!parsed.success) {
      return { error: 'Invalid form data' };
    }

    const job = await prisma.job.create({
      data: {
        ...parsed.data,
        workspaceId,
      },
    });

    revalidatePath('/dashboard/jobs');
  } catch (error) {
    return { error: 'Failed to create job' };
  }
  
  redirect('/dashboard/jobs');
}

export async function updateJob(id: string, prevState: any, formData: FormData) {
  try {
    const workspaceId = await getWorkspaceId();
    const parsed = jobSchema.safeParse(Object.fromEntries(formData));
    
    if (!parsed.success) {
      return { error: 'Invalid form data' };
    }

    // Verify ownership
    const existing = await prisma.job.findUnique({ where: { id } });
    if (existing?.workspaceId !== workspaceId) {
      return { error: 'Unauthorized' };
    }

    await prisma.job.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath('/dashboard/jobs');
    revalidatePath(`/dashboard/jobs/${id}`);
  } catch (error) {
    return { error: 'Failed to update job' };
  }

  redirect('/dashboard/jobs');
}

export async function deleteJob(id: string) {
  try {
    const workspaceId = await getWorkspaceId();
    
    const existing = await prisma.job.findUnique({ where: { id } });
    if (existing?.workspaceId !== workspaceId) {
      return { error: 'Unauthorized' };
    }

    await prisma.job.delete({ where: { id } });
    revalidatePath('/dashboard/jobs');
  } catch (error) {
    return { error: 'Failed to delete job' };
  }
}
