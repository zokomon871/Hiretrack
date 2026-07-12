import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Workflow, Users, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">HireTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-24 text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          The modern applicant tracking system.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Manage jobs, streamline candidate pipelines, and coordinate interviews effortlessly. Built for speed and designed for teams that demand excellence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 text-lg font-medium group">
              Start for free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Workflow className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Visual Kanban Pipeline</h3>
            <p className="text-muted-foreground leading-relaxed">
              Drag and drop candidates across stages instantly. Optimistic UI updates mean you never wait for a loading spinner.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Team Collaboration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Invite your hiring managers and interviewers with strict Role-Based Access Control (Admin, Member, Viewer).
            </p>
          </div>
          {/* Feature 3 */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">Structured Scorecards</h3>
            <p className="text-muted-foreground leading-relaxed">
              Collect standardized feedback from your team. Enforce required notes and precise ratings to make unbiased decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to upgrade your hiring workflow?</h2>
          <p className="text-muted-foreground mb-8">Join the modern teams already using HireTrack.</p>
          <Link href="/signup">
            <Button size="lg">Create your workspace</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
