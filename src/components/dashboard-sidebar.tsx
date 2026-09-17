'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Settings, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ChevronRight,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { BrandLogo } from '@/components/brand-logo';

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspaceName?: string;
  role?: string;
  isSuperAdmin?: boolean;
}

export function DashboardSidebar({ user, workspaceName = 'Workspace', role = 'MEMBER', isSuperAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Interviews', href: '/dashboard/interviews', icon: Calendar },
    { name: 'Team & Access', href: '/dashboard/team', icon: Settings },
  ];

  const handleOpenSearch = () => {
    // Trigger the Cmd+K keydown event for CommandPalette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  const initials = (user.name || user.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Workspace Header */}
      <div className="p-4 border-b border-sidebar-border/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
          <BrandLogo className="h-8 w-8 text-sm group-hover:scale-105 transition-transform shrink-0" />
          <div className="flex flex-col justify-center min-w-0 text-left">
            <div 
              className="font-semibold text-sm truncate text-foreground leading-tight tracking-normal"
              title={workspaceName}
            >
              {workspaceName}
            </div>
            <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 font-medium leading-none mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50 shrink-0" />
              HireTrack
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Search trigger & New Candidate button */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground bg-card/60 hover:bg-card/90 rounded-xl border border-sidebar-border transition-all group shadow-xs hover:border-primary/40"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
            Quick search...
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border rounded font-mono text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <Link href="/dashboard/candidates/new" className="block">
          <Button size="sm" className="w-full h-8 text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:brightness-110 justify-center rounded-xl transition-all">
            <Plus className="h-3.5 w-3.5" />
            Add Candidate
          </Button>
        </Link>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {isSuperAdmin && (
          <div className="mb-3 pb-2.5 border-b border-sidebar-border/80">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 px-3 py-1 flex items-center justify-between">
              <span>App Owner</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">CRM</span>
            </div>
            <Link
              href="/superadmin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all shadow-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Super Admin CRM</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-amber-400/70" />
            </Link>
          </div>
        )}

        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 px-3 py-1.5">
          Workstation
        </div>
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Upgrade/Feature Note */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/25 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px] mb-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          No Drag & Drop Lag
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Triage candidates instantly using split-screen and hotkeys [A] & [R].
        </p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/30 shadow-2xs">
              {initials}
            </div>
            <div className="overflow-hidden text-left">
              <div className="font-semibold text-xs text-foreground truncate">
                {user.name || 'User'}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {role}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-3.5 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-7 w-7 text-xs" />
          <span className="font-bold text-sm tracking-tight">{workspaceName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenSearch}
            className="p-2 rounded-lg bg-card border border-border/60 text-muted-foreground"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-card border border-border/60 text-foreground"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slideout Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="w-72 h-full bg-sidebar shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[270px] h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
