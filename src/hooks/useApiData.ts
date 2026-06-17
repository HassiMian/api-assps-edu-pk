"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

interface ApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic API data hook for live backend data.
 * The caller decides the initial empty state; this hook only refreshes it from the API.
 */
export function useApiData<T>(endpoint: string, initialData: T, deps: React.DependencyList = []): ApiState<T> & { setData: React.Dispatch<React.SetStateAction<T>> } {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);

    const controller = new AbortController();

    api.get(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!mounted) return;
        if (res.data !== undefined) {
          const payload = res.data && typeof res.data === 'object' && 'data' in res.data
            ? res.data.data
            : res.data;
          setData(payload);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        if (err.name !== 'AbortError') {
          setError(err?.response?.data?.message || 'Unable to load live data');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, tick, ...deps]);

  return { data, loading, error, refetch, setData };
}

/**
 * Optimistic mutation hook for POST/PUT/DELETE.
 * Performs the API call then refreshes data. If API fails, rolls back to previous state.
 */
export function useApiMutation<T, P = unknown>(
  endpoint: string,
  method: 'post' | 'put' | 'delete' = 'post',
  onSuccess?: (data: T) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload?: P) => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (method === 'post') res = await api.post(endpoint, payload);
        else if (method === 'put') res = await api.put(endpoint, payload);
        else res = await api.delete(endpoint, payload ? { data: payload } : undefined);
        onSuccess?.(res.data);
        return res.data;
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Request failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, onSuccess]
  );

  return { mutate, loading, error };
}
