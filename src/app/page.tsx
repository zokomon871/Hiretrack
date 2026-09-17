import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand-logo';
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Calendar,
  Layers,
  Check,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] ambient-hero pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="border-b border-border/70 bg-background/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo className="h-8 w-8 text-xs group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight">HireTrack</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:brightness-110 transition-all">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-16 text-center max-w-4xl relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-8 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>Next-Generation ATS • Say Goodbye to Clunky Drag-and-Drop</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Recruiting at the <span className="text-gradient">speed of thought.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Triage candidates in a high-velocity split-view workstation, advance hiring stages with 1-click or keyboard shortcuts, and coordinate team scorecards effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-sm font-semibold shadow-xl shadow-primary/25 bg-primary text-primary-foreground hover:brightness-110 group transition-all">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold border-border/80 bg-card/60 backdrop-blur-md hover:bg-muted/80">
              Live Workspace Demo
            </Button>
          </Link>
        </div>

        {/* UI Mockup Showcase: The Candidate Review Workstation */}
        <div className="rounded-2xl border border-border/80 glass-card p-3.5 glow-box overflow-hidden text-left max-w-3xl mx-auto transition-all">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-sm shadow-rose-500/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/50" />
                <span className="text-xs font-semibold text-muted-foreground ml-2">
                  HireTrack Workstation Cockpit
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono shadow-xs">[A] Advance</kbd>
                <kbd className="px-1.5 py-0.5 bg-card border border-border rounded font-mono shadow-xs">[R] Reject</kbd>
              </div>
            </div>

            {/* Mock Stepper */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-lg bg-card/80 text-muted-foreground border border-border/60 flex items-center justify-center gap-1 font-medium">
                <Check className="h-3 w-3 text-emerald-400" /> Applied
              </div>
              <div className="p-2 rounded-lg bg-card/80 text-muted-foreground border border-border/60 flex items-center justify-center gap-1 font-medium">
                <Check className="h-3 w-3 text-emerald-400" /> Screening
              </div>
              <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold ring-2 ring-primary/20 shadow-sm shadow-primary/20">
                ● Interview
              </div>
              <div className="p-2 rounded-lg bg-card/40 text-muted-foreground/70 border border-border/40">
                Offer
              </div>
              <div className="p-2 rounded-lg bg-card/40 text-muted-foreground/70 border border-border/40">
                Hired
              </div>
            </div>

            {/* Candidate Summary Row */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-card/90 border border-border/80 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-foreground">Jane Doe</div>
                  <div className="text-[11px] text-muted-foreground">Senior Full Stack Engineer</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Score: 4.8 / 5
                </span>
                <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold shadow-xs shadow-primary/30">
                  Advance to Offer ➔
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-border/70 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for speed. Designed for excellence.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Eliminate recruiting friction with modern tooling that keeps your hiring panel aligned.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card space-y-3.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Candidate Review Workstation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Review resumes side-by-side with candidate profiles. Advance stages in a single click or with keyboard hotkeys. No dragging required.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Structured Scorecards</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Collect quantitative ratings on technical skill, culture fit, and communication with required reviewer notes to eliminate hiring bias.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-3.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Role-Based Team Access</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Invite hiring managers, interviewers, and recruiters with strict permissions (Admin, Member, Viewer) and isolated workspaces.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="mt-auto border-t border-border/70 bg-card/30 backdrop-blur-lg py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        <div className="container mx-auto px-6 max-w-xl space-y-4 relative z-10">
          <h3 className="text-2xl font-bold tracking-tight">
            Ready to modernize your hiring workflow?
          </h3>
          <p className="text-xs text-muted-foreground">
            Join the forward-thinking teams using HireTrack to hire top talent faster.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button size="lg" className="h-11 px-7 text-xs font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:brightness-110">
                Create Free Workspace
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-12 text-xs text-muted-foreground flex items-center justify-center gap-4 relative z-10">
          <span>&copy; {new Date().getFullYear()} HireTrack</span>
          <span>•</span>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Login
          </Link>
          <span>•</span>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Signup
          </Link>
        </div>
      </section>
    </div>
  );
}
