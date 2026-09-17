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
  Plus
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/actions/auth';

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspaceName?: string;
  role?: string;
}

export function DashboardSidebar({ user, workspaceName = 'Workspace', role = 'MEMBER' }: DashboardSidebarProps) {
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
    <div className="flex flex-col h-full bg-card border-r border-border select-none">
      {/* Workspace Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            H
          </div>
          <div className="overflow-hidden text-left">
            <div className="font-bold text-sm truncate tracking-tight text-foreground flex items-center gap-1.5">
              {workspaceName}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              HireTrack v2.0
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Search trigger & New Candidate button */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/40 hover:bg-muted rounded-lg border border-border/80 transition-all group"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
            Quick search...
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border rounded font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <Link href="/dashboard/candidates/new" className="block">
          <Button size="sm" className="w-full h-8 text-xs font-semibold gap-1.5 shadow-sm justify-center">
            <Plus className="h-3.5 w-3.5" />
            Add Candidate
          </Button>
        </Link>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 py-1.5">
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
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
      <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px] mb-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          No Drag & Drop Lag
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Triage candidates instantly using split-screen and hotkeys [A] & [R].
        </p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-border bg-card/50">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
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
            <form action={signOutAction}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-3.5 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
            H
          </div>
          <span className="font-bold text-sm tracking-tight">{workspaceName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenSearch}
            className="p-2 rounded-lg bg-muted text-muted-foreground"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-muted text-foreground"
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
            className="w-72 h-full bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
