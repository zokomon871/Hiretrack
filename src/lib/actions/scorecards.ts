'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const scorecardSchema = z.object({
  interviewId: z.string(),
  technicalSkill: z.coerce.number().min(1).max(5),
  cultureFit: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  overallRating: z.coerce.number().min(1).max(5),
  notes: z.string().optional(),
});

export async function submitScorecard(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated' };

  const parsed = scorecardSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs.', issues: parsed.error.issues };
  }

  const { interviewId, technicalSkill, cultureFit, communication, overallRating, notes } = parsed.data;

  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { candidate: { include: { job: true } } },
    });

    if (!interview || interview.interviewerId !== userId) {
      return { error: 'Unauthorized to submit scorecard for this interview.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.scorecard.upsert({
        where: { interviewId },
        update: {
          technicalSkill,
          cultureFit,
          communication,
          overallRating,
          notes,
        },
        create: {
          interviewId,
          reviewerId: userId,
          technicalSkill,
          cultureFit,
          communication,
          overallRating,
          notes,
        },
      });

      await tx.interview.update({
        where: { id: interviewId },
        data: { status: 'COMPLETED' },
      });
    });

    revalidatePath(`/dashboard/candidates/${interview.candidateId}`);
  } catch (error) {
    return { error: 'Failed to submit scorecard' };
  }
  
  redirect('/dashboard');
}
