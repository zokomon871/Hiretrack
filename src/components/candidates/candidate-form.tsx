'use client';

import { useActionState } from 'react';
import { createCandidate } from '@/lib/actions/candidates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Candidate'}
    </Button>
  );
}

export function CandidateForm({ jobs }: { jobs: { id: string; title: string }[] }) {
  const [state, formAction] = useActionState(createCandidate, { error: '' } as any);

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="jobId">Job</Label>
          <Select name="jobId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="resumeUrl">Resume/LinkedIn URL (Optional)</Label>
          <Input
            id="resumeUrl"
            name="resumeUrl"
            type="url"
            placeholder="https://linkedin.com/in/janedoe"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <div className="flex gap-4">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
