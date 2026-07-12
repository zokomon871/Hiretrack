'use client';

import { useState, useTransition } from 'react';
import { CandidateStage } from '@prisma/client';
import { updateCandidateStage } from '@/lib/actions/candidates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StageChanger({ 
  candidateId, 
  currentStage 
}: { 
  candidateId: string, 
  currentStage: CandidateStage 
}) {
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<CandidateStage>(currentStage);

  const stages = Object.values(CandidateStage);

  const handleValueChange = (val: CandidateStage) => {
    const newStage = val;
    setStage(newStage);
    startTransition(async () => {
      await updateCandidateStage(candidateId, newStage);
    });
  };

  return (
    <Select 
      value={currentStage} 
      onValueChange={(val) => {
        if (val) handleValueChange(val as CandidateStage);
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px] h-8 text-xs font-semibold">
        <SelectValue placeholder="Select Stage" />
      </SelectTrigger>
      <SelectContent>
        {stages.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
