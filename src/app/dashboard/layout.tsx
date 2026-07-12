import { ReactNode } from 'react';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/components/command-palette';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4 px-8">
          <div className="flex gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="inline-block font-bold">HireTrack</span>
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/dashboard"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/jobs"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Jobs
              </Link>
              <Link
                href="/dashboard/candidates"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Candidates
              </Link>
              <Link
                href="/dashboard/team"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Team Settings
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground">
                {session?.user?.name || session?.user?.email}
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut();
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <CommandPalette />
      <main className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </main>
    </div>
  );
}
