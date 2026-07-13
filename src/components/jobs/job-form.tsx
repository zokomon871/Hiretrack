'use client';

import { useActionState } from 'react';
import { createJob, updateJob } from '@/lib/actions/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormStatus } from 'react-dom';
import type { Job } from '@prisma/client';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
    </Button>
  );
}

export function JobForm({ job }: { job?: Job }) {
  const action = job ? updateJob.bind(null, job.id) : createJob;
  const [state, formAction] = useActionState(action, { error: '' });

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={job?.title}
            placeholder="e.g. Senior Frontend Engineer"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="department">Department</Label>
          <Select name="department" defaultValue={job?.department || 'ENGINEERING'}>
            <SelectTrigger>
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENGINEERING">Engineering</SelectItem>
              <SelectItem value="SALES">Sales</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="DESIGN">Design</SelectItem>
              <SelectItem value="PRODUCT">Product</SelectItem>
              <SelectItem value="OPERATIONS">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={job?.status || 'DRAFT'}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (Markdown supported)</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={job?.description || ''}
            placeholder="Write the job description..."
            className="min-h-[200px]"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <div className="flex gap-4">
          <SubmitButton isEditing={!!job} />
        </div>
      </div>
    </form>
  );
}
