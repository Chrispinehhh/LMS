// driver-app/src/hooks/useApi.ts
import useSWR from 'swr';
import apiClient from '../lib/api';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export function useApi<T>(path: string | null) {
  // We add refreshInterval to poll for new jobs every 30 seconds
  const { data, error, isLoading, mutate } = useSWR<T>(path, fetcher, { refreshInterval: 30000 });

  return {
    data: data || null,
    error,
    isLoading,
    mutate,
  };
}