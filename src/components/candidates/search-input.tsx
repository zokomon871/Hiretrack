'use client';

import { useDebounce } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(defaultValue);
  const [query] = useDebounce(text, 300);

  useEffect(() => {
    const currentQuery = searchParams.get('search') || '';
    if (query !== currentQuery) {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      router.push(`?${params.toString()}`);
    }
  }, [query, router, searchParams]);

  return (
    <Input
      name="search"
      placeholder="Search candidates..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-64"
    />
  );
}
