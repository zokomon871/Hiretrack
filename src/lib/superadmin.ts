import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export function getSuperAdminEmails(): string[] {
  const envEmails = process.env.SUPER_ADMIN_EMAILS || '';
  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = getSuperAdminEmails();
  return adminEmails.includes(email.trim().toLowerCase());
}

export async function verifySuperAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  if (!isSuperAdmin(session.user.email)) {
    redirect('/dashboard?error=unauthorized_superadmin');
  }

  return session.user;
}
