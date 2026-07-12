'use client';

import { useActionState } from 'react';
import { inviteUser } from '@/lib/actions/invite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send Invite'}
    </Button>
  );
}

export function InviteForm() {
  const [state, formAction] = useActionState(
    inviteUser,
    { error: '', success: '' },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Member</CardTitle>
        <CardDescription>
          Invite a new member to your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="grid gap-2 w-40">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="VIEWER">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SubmitButton />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500 mt-2">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 mt-2">{state.success}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
