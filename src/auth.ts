import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Check if user exists and has a password
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          // Verify the password
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      
      // Check if they have a pending invitation
      const invitation = user.email ? await prisma.invitation.findFirst({
        where: { email: user.email }
      }) : null;

      if (invitation) {
        // Automatically join the invited workspace
        await prisma.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role,
          }
        });

        // Optionally log the activity
        const inviter = await prisma.user.findUnique({ where: { id: invitation.inviterId } });
        await prisma.activityLog.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            action: 'JOINED_WORKSPACE',
            details: `${user.name || 'A user'} joined the workspace via an invitation from ${inviter?.name || 'an Admin'}.`,
          }
        });

        // Delete the used invitation so it can't be reused
        await prisma.invitation.delete({
          where: { id: invitation.id }
        });
      } else {
        // No invitation found, provision a brand new Workspace for them automatically
        const existingMember = await prisma.workspaceMember.findFirst({
          where: { userId: user.id }
        });

        if (!existingMember) {
          await prisma.workspace.create({
            data: {
              name: `${user.name || 'My'}'s Workspace`,
              members: {
                create: {
                  userId: user.id,
                  role: 'ADMIN',
                },
              },
            },
          });
        }
      }
    },
  },
});
