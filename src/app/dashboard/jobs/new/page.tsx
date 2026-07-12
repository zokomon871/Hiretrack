import { JobForm } from '@/components/jobs/job-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/jobs">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Job</h2>
          <p className="text-muted-foreground">
            Fill out the details below to open a new role.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <JobForm />
      </div>
    </div>
  );
}
