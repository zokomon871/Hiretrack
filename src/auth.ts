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
      
      // When a new user is created via OAuth, provision a Workspace for them automatically
      // if they aren't already attached to one.
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
    },
  },
});
