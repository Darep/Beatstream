import useSWR, { type SWRConfiguration } from 'swr';

import { fetcher } from 'utils/api';

export const useApi = <Data = any>(
  url: string,
  opts?: RequestInit,
  swrOpts?: SWRConfiguration<Data>,
) => {
  const { data, error, isLoading } = useSWR<Data>(
    url,
    () => fetcher(url, opts),
    swrOpts,
  );
  return { data, error, isLoading };
};
