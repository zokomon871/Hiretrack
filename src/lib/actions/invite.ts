'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export async function inviteUser(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated', success: '' };

  // Check if current user is ADMIN
  const currentUserWithWorkspace = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      workspaceMembers: true,
    },
  });

  const memberInfo = currentUserWithWorkspace?.workspaceMembers[0];
  if (!memberInfo || memberInfo.role !== 'ADMIN') {
    return { error: 'Not authorized to invite users', success: '' };
  }

  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid data', success: '' };
  }

  const { email, role } = parsed.data;

  try {
    // In a real app we'd send an email with a token.
    // For this trial, we'll just create an invitation record in the database.
    await prisma.invitation.create({
      data: {
        email,
        role: parsed.data.role,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        workspaceId: memberInfo.workspaceId,
        inviterId: session.user.id,

      }
    });

    revalidatePath('/dashboard/team');
    return { error: '', success: 'Invitation sent successfully!' };
  } catch (error) {
    return { error: 'Failed to send invitation', success: '' };
  }
}
