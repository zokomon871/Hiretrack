import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { ShieldCheck, Zap, Sparkles, Building2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side: Premium Branding & Workspace Onboarding Info */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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

        {/* Center Content */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-zinc-300 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Setup in under 60 seconds</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Build your modern hiring engine today.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Equip your interviewers and hiring managers with a unified hiring workstation, real-time stage transitions, and bias-free scorecards.
            </p>
          </div>

          {/* Benefit Cards */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Candidate Review Workstation</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Triage hundreds of applicants with split-screen review and instant keyboard hotkeys.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Structured Scorecards & Roles</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Granular Admin, Member, and Viewer permissions with standardized rating rubrics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Multi-Job Pipeline Control</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Manage engineering, design, and sales roles with dedicated stage funnels.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-zinc-500 flex justify-between">
          <span>No credit card required • Free workspace trial</span>
          <span>HireTrack 2026</span>
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
            href="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? <span className="text-primary underline">Sign in</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <SignupForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to HireTrack&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
