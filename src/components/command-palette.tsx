'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<{ candidates: any[], jobs: any[] }>({ candidates: [], jobs: [] });
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults({ candidates: [], jobs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={query} 
        onValueChange={setQuery} 
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {results.candidates.length > 0 && (
          <CommandGroup heading="Candidates">
            {results.candidates.map((c) => (
              <CommandItem key={c.id} onSelect={() => onSelect(`/dashboard/candidates/${c.id}`)}>
                {c.name} ({c.email})
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        {results.jobs.length > 0 && (
          <CommandGroup heading="Jobs">
            {results.jobs.map((j) => (
              <CommandItem key={j.id} onSelect={() => onSelect(`/dashboard/jobs/${j.id}`)}>
                {j.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
