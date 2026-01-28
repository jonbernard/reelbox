'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Author, AuthorsResponse } from '@/app/lib/types';

export function useAuthors(followingOnly = true) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (followingOnly) params.set('following', 'true');

      const response = await fetch(`/api/authors?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch authors');
      }

      const data = (await response.json()) as AuthorsResponse;
      setAuthors(data.authors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setIsLoading(false);
    }
  }, [followingOnly]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  return {
    authors,
    isLoading,
    error,
    refresh: fetchAuthors,
  };
}
