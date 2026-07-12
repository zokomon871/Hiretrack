'use client';

import { useActionState } from 'react';
import { submitScorecard } from '@/lib/actions/scorecards';
import { Button } from '@/components/ui/button';
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="mt-6 w-full">
      {pending ? 'Submitting...' : 'Submit Scorecard'}
    </Button>
  );
}

export function ScorecardForm({ 
  interviewId, 
  initialData 
}: { 
  interviewId: string, 
  initialData?: any 
}) {
  const [state, formAction] = useActionState(
    submitScorecard,
    { error: '', issues: [] }
  );

  const getFieldError = (fieldName: string) => {
    return state?.issues?.find((i: any) => i.path[0] === fieldName)?.message;
  };

  const RatingSelect = ({ name, label }: { name: string; label: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label} (1-5)</Label>
      <Select name={name} required defaultValue={initialData?.[name]?.toString()}>
        <SelectTrigger>
          <SelectValue placeholder="Rate 1-5" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map(num => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? '(Poor)' : num === 5 ? '(Excellent)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {getFieldError(name) && <p className="text-sm text-red-500">{getFieldError(name)}</p>}
    </div>
  );

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      <input type="hidden" name="interviewId" value={interviewId} />
      
      <div className="grid grid-cols-2 gap-4">
        <RatingSelect name="technicalSkill" label="Technical Skill" />
        <RatingSelect name="cultureFit" label="Culture Fit" />
        <RatingSelect name="communication" label="Communication" />
        <RatingSelect name="overallRating" label="Overall Recommendation" />
      </div>

      <div className="grid gap-2 mt-4">
        <Label htmlFor="notes">Interview Notes & Feedback</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Detailed observations about the candidate's performance..."
          className="min-h-[150px]"
          defaultValue={initialData?.notes || ''}
        />
        {getFieldError('notes') && <p className="text-sm text-red-500">{getFieldError('notes')}</p>}
      </div>

      {state?.error && !state?.issues && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
