import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Sparkles, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function LoginPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden grid lg:grid-cols-2 bg-background text-foreground relative">
      {/* Left side: Premium Branding & Feature Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-8 lg:p-10 h-full bg-card/60 border-r border-border/80 text-foreground relative overflow-hidden backdrop-blur-2xl">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <BrandLogo className="h-8 w-8 text-xs group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight text-foreground">HireTrack</span>
          </Link>
        </div>

        {/* Center Showcase */}
        <div className="relative z-10 max-w-md space-y-6 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 backdrop-blur-md text-xs font-medium text-primary border border-primary/20 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Engineered for modern high-growth hiring teams</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
              Recruit at the <span className="text-gradient">speed of thought.</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              HireTrack replaces clunky Kanban boards with a high-velocity Candidate Review Cockpit, one-click stage progression, and structured interview scorecards.
            </p>
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="p-4 rounded-xl glass-card border-border/80 shadow-xl glow-box space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Users className="h-3.5 w-3.5 text-primary" /> Active Pipeline
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                <TrendingUp className="h-3 w-3" /> +28% this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold border border-primary/25">Applied (18)</span>
              <span className="text-muted-foreground/60 text-xs">→</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-xs font-semibold border border-amber-500/25">Interview (6)</span>
              <span className="text-muted-foreground/60 text-xs">→</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/25">Hired (4)</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero drag lag</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Keyboard triage [A]/[R]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Enterprise RBAC</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-muted-foreground/70 flex justify-between">
          <span>&copy; {new Date().getFullYear()} HireTrack Systems Inc.</span>
          <span>Security & Compliance Guaranteed</span>
        </div>
      </div>

      {/* Right side: Form Card */}
      <div className="flex flex-col justify-between p-4 sm:p-6 lg:p-8 h-full overflow-y-auto no-scrollbar relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden flex items-center gap-2 group">
            <BrandLogo className="h-7 w-7 text-xs group-hover:scale-105 transition-transform" />
            <span className="font-bold text-base">HireTrack</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-2">
          <div className="p-6 sm:p-7 rounded-2xl glass-card border border-border/80 shadow-xl">
            <LoginForm />
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground pb-2">
          By continuing, you agree to HireTrack&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
