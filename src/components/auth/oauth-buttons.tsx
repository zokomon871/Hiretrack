'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('OAuth error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button 
        variant="outline" 
        type="button" 
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading !== null}
        className="w-full"
      >
        {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
      </Button>
      <Button 
        variant="outline" 
        type="button" 
        onClick={() => handleOAuthSignIn('github')}
        disabled={isLoading !== null}
        className="w-full"
      >
        {isLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
      </Button>
    </div>
  );
}
