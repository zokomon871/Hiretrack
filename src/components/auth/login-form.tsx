'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { OAuthButtons } from './oauth-buttons';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      className="w-full h-10 text-sm font-semibold transition-all shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:brightness-110" 
      type="submit" 
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in...
        </span>
      ) : (
        'Sign in to HireTrack'
      )}
    </Button>
  );
}

export function LoginForm() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter your credentials to access your hiring workspace
        </p>
      </div>

      <div className="space-y-3.5">
        <OAuthButtons />

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/80" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-card px-2.5 text-muted-foreground font-medium">
              Or with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Work Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex@company.com"
              className="h-10 px-3 bg-muted/20 focus-visible:ring-primary text-sm"
              required
              autoComplete="email"
            />
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
                className="h-10 px-3 pr-10 bg-muted/20 focus-visible:ring-primary text-sm"
                required
                autoComplete="current-password"
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

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <SubmitButton />

          <p className="text-center text-xs text-muted-foreground pt-1">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary underline underline-offset-4 hover:opacity-80">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

