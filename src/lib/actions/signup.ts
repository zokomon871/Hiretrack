'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(2),
});

export async function signup(prevState: any, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      error: 'Invalid form data. Please check your inputs.',
    };
  }

  const { name, email, password, workspaceName } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: 'User already exists.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create Workspace and User in a transaction
    await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName },
      });

      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          workspaceMembers: {
            create: {
              workspaceId: workspace.id,
              role: 'ADMIN',
            },
          },
        },
      });
    });
  } catch (error) {
    return {
      error: 'An error occurred while creating your account.',
    };
  }

  redirect('/login');
}
