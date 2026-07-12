'use client';

import { useActionState } from 'react';
import { scheduleInterview } from '@/lib/actions/interviews';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
    <Button type="submit" disabled={pending} className="mt-4">
      {pending ? 'Scheduling...' : 'Schedule Interview'}
    </Button>
  );
}

interface ScheduleFormProps {
  candidateId: string;
  interviewers: { id: string; name: string | null }[];
}

export function ScheduleForm({ candidateId, interviewers }: ScheduleFormProps) {
  const [state, formAction] = useActionState(
    scheduleInterview,
    { error: '', success: '' }
  );

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      <input type="hidden" name="candidateId" value={candidateId} />
      
      <div className="grid gap-2">
        <Label htmlFor="interviewerId">Interviewer</Label>
        <Select name="interviewerId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select interviewer" />
          </SelectTrigger>
          <SelectContent>
            {interviewers.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="scheduledAt">Date & Time</Label>
        <Input
          type="datetime-local"
          id="scheduledAt"
          name="scheduledAt"
          required
        />
      </div>

      <SubmitButton />

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
    </form>
  );
}
