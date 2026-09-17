import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { ShieldCheck, Zap, Sparkles, Building2 } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function SignupPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden grid lg:grid-cols-2 bg-background text-foreground relative">
      {/* Left side: Premium Branding & Workspace Onboarding Info */}
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

        {/* Center Content */}
        <div className="relative z-10 max-w-md space-y-5 my-auto">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 backdrop-blur-md text-xs font-medium text-primary border border-primary/20 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Setup in under 60 seconds</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
              Build your modern <span className="text-gradient">hiring engine.</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Equip your interviewers and hiring managers with a unified hiring workstation, real-time stage transitions, and bias-free scorecards.
            </p>
          </div>

          {/* Benefit Cards */}
          <div className="grid gap-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl glass-card border-border/80 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Candidate Review Workstation</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Triage applicants with split-screen review and instant keyboard hotkeys.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl glass-card border-border/80 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Structured Scorecards & Roles</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Granular Admin, Member, and Viewer permissions with standardized rubrics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl glass-card border-border/80 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Collaborative Workspaces</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Seamless team invites, shared pipelines, and unified activity tracking.</p>
              </div>
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

        <div className="w-full max-w-md mx-auto my-auto py-1">
          <div className="p-6 sm:p-7 rounded-2xl glass-card border border-border/80 shadow-xl">
            <SignupForm />
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground pb-2">
          By signing up, you agree to HireTrack&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
