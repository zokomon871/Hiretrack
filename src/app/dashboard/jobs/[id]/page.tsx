import { JobForm } from '@/components/jobs/job-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const resolvedParams = await params;
  const job = await prisma.job.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/jobs">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Job</h2>
          <p className="text-muted-foreground">
            Update the details for {job.title}.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
