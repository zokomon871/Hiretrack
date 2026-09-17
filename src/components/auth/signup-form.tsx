'use client';

import { useActionState, useState } from 'react';
import { signup } from '@/lib/actions/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { OAuthButtons } from './oauth-buttons';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      className="w-full h-11 text-sm font-semibold transition-all shadow-sm hover:shadow-md" 
      type="submit" 
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating workspace...
        </span>
      ) : (
        'Create account & workspace'
      )}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, { error: '' });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Start hiring the best talent with your team in minutes
        </p>
      </div>

      <div className="space-y-4">
        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              Or with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="workspaceName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace / Company <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span>
            </Label>
            <Input
              id="workspaceName"
              name="workspaceName"
              placeholder="Acme Recruiting"
              className="h-10 px-3 bg-muted/20 focus-visible:ring-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                className="h-10 px-3 bg-muted/20 focus-visible:ring-primary text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Work Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@company.com"
                className="h-10 px-3 bg-muted/20 focus-visible:ring-primary text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-10 px-3 pr-10 bg-muted/20 focus-visible:ring-primary text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <SubmitButton />
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  );
}

