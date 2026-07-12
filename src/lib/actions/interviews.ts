'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const scheduleSchema = z.object({
  candidateId: z.string(),
  interviewerId: z.string(),
  scheduledAt: z.string().transform(str => new Date(str)),
});

export async function scheduleInterview(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated', success: '' };

  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid form data', success: '' };
  }

  const { candidateId, interviewerId, scheduledAt } = parsed.data;

  try {
    // Verify candidate belongs to workspace
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { workspaceMembers: true },
    });

    if (!candidate || candidate.job.workspaceId !== user?.workspaceMembers[0]?.workspaceId) {
      return { error: 'Unauthorized', success: '' };
    }

    await prisma.interview.create({
      data: {
        candidateId,
        interviewerId,
        scheduledAt,
      },
    });

    // Also optimistically move candidate to INTERVIEW stage
    if (candidate.stage === 'APPLIED' || candidate.stage === 'SCREENING') {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { stage: 'INTERVIEW' },
      });
    }

    revalidatePath(`/dashboard/candidates/${candidateId}`);
    revalidatePath('/dashboard/candidates');
    return { error: '', success: 'Interview scheduled successfully' };
  } catch (error) {
    return { error: 'Failed to schedule interview', success: '' };
  }
}
