import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Sparkles, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side: Premium Branding & Feature Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 font-black text-lg">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-white">HireTrack</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              v2.0
            </span>
          </Link>
        </div>

        {/* Center Showcase */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-zinc-300 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Engineered for modern high-growth hiring teams</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Recruit at the speed of thought. Ditch the slow drag-and-drop.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              HireTrack replaces clunky Kanban boards with a high-velocity Candidate Review Cockpit, one-click stage progression, and structured interview scorecards.
            </p>
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-2 font-medium text-zinc-200">
                <Users className="h-4 w-4 text-primary" /> Active Pipeline
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> +28% this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary text-xs font-semibold">Applied (18)</span>
              <span className="text-zinc-600">→</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold">Interview (6)</span>
              <span className="text-zinc-600">→</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold">Hired (4)</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero drag-and-drop lag</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Keyboard triage [A] / [R]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Enterprise RBAC</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-zinc-500 flex justify-between">
          <span>&copy; {new Date().getFullYear()} HireTrack Systems Inc.</span>
          <span>Security & Compliance Guaranteed</span>
        </div>
      </div>

      {/* Right side: Form Card */}
      <div className="flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 overflow-y-auto">
        <div className="flex justify-between items-center lg:justify-end">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <span className="font-bold text-lg">HireTrack</span>
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Need an account? <span className="text-primary underline">Sign up</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <LoginForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to HireTrack&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
