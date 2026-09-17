import { ReactNode } from 'react';
import { verifySuperAdmin } from '@/lib/superadmin';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShieldCheck, ArrowLeft, Database, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const user = await verifySuperAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Super Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-8 w-8 text-sm" />
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-base sm:text-lg">Hiretrack</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin CRM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Neon DB Live Chip */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 opacity-70" />
            <span>Neon DB Connected</span>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to App</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-foreground">{user.email}</span>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Owner</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
