'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { CandidateStage } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function updateCandidateStage(candidateId: string, newStage: CandidateStage) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // Verify ownership
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;

  if (candidate?.job.workspaceId !== workspaceId) {
    throw new Error('Unauthorized');
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage: newStage },
  });

  revalidatePath('/dashboard/candidates');
}

const candidateSchema = z.object({
  jobId: z.string().min(1, 'Job is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  resumeUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export async function createCandidate(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };

  const parsed = candidateSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid form data', issues: parsed.error.issues };
  }

  const { jobId, name, email, resumeUrl } = parsed.data;

  // Verify the job exists in the user's workspace
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaceMembers: true },
  });

  const workspaceId = user?.workspaceMembers[0]?.workspaceId;
  if (!workspaceId) return { error: 'No workspace found' };

  const job = await prisma.job.findFirst({
    where: { id: jobId, workspaceId },
  });

  if (!job) {
    return { error: 'Job not found or unauthorized' };
  }

  try {
    const candidate = await prisma.candidate.create({
      data: {
        jobId,
        name,
        email,
        resumeUrl: resumeUrl || null,
        stage: 'APPLIED',
      },
    });

    revalidatePath('/dashboard/candidates');
  } catch (error) {
    return { error: 'Failed to create candidate' };
  }

  redirect('/dashboard/candidates');
}
