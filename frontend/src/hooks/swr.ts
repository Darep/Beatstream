import type { SWRConfiguration } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { fetcher } from 'utils/api';

import { useApi } from './useApi';

export const useSession = (opts?: RequestInit, swrOpts?: SWRConfiguration) => {
  const { data, error, isLoading } = useApi<{
    token: string;
    username: string;
  }>('/api/session', opts, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    ...swrOpts,
  });

  const unauthenticated = error && error.status === 401;

  return {
    error,
    isAuthenticated: !unauthenticated && !!data,
    isLoading,
    user: data ? { username: data.username } : undefined,
  };
};

export const useSongs = ({ skip }: { skip?: boolean } = {}) => useSWRImmutable(skip ? null : '/api/songs', fetcher);
