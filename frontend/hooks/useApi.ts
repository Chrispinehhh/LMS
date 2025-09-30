// frontend/hooks/useApi.ts
import useSWR from 'swr'; // Removed { MutatorOptions }
import apiClient from '@/lib/api';
import { AxiosResponse } from 'axios';

// The "fetcher" function is what SWR will use to get the data.
const fetcher = <T>(url: string): Promise<T> => 
  apiClient.get<T>(url).then((res: AxiosResponse<T>) => res.data);

/**
 * A custom hook to simplify data fetching with SWR and our apiClient.
 * @template T The expected type of the data to be returned from the API.
 * @param {string | null} path The API endpoint path (e.g., '/users/1'). 
 * If null, fetching is disabled.
 * @returns An object containing data, error, loading state, and the SWR mutate function.
 */
export function useApi<T>(path: string | null) {
  // useSWR is called unconditionally. When 'path' is null, it disables fetching.
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<T>(path, fetcher);

  // Now we handle the conditional return *after* the hook call.
  if (!path) {
    return {
      // Use the values returned by SWR when path is null (data and error are undefined)
      // and ensure the type is T | null.
      data: (data as T | null) ?? null, 
      error: error || null,
      isLoading: false, 
      // The mutate function returned by SWR when key is null is a safe no-op,
      // and its type is correctly inferred from useSWR<T>.
      mutate: mutate, 
    };
  }

  return {
    data: data || null,
    error,
    isLoading,
    mutate,
  };
}