import { useState, useEffect, useCallback } from 'react';

interface SNSLookupResult {
  domain: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface SNSApiResponse {
  jsonrpc: string;
  id: number;
  result?: {
    data: string[];
    nextCursor: string | null;
    hasNextPage: boolean;
  } | null;
  error?: {
    code: number;
    message: string;
  };
}

interface SNSApiError {
  error: string;
  rawResponse?: string;
}

export function useSNSLookup(address: string | null): SNSLookupResult {
  const [domain, setDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSNSName = useCallback(async (walletAddress: string) => {
    if (!walletAddress || !walletAddress.trim()) {
      setDomain(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sns/lookup?address=${encodeURIComponent(walletAddress)}`);
      
      if (!response.ok) {
        const errorData: SNSApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: SNSApiResponse = await response.json();

      // Handle RPC-level errors
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message} (Code: ${data.error.code})`);
      }

      // Extract the first domain name from the result data array
      if (data.result && data.result.data && Array.isArray(data.result.data) && data.result.data.length > 0) {
        setDomain(data.result.data[0]);
      } else {
        // No domain found for this address
        setDomain(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (address) {
      fetchSNSName(address);
    }
  }, [address, fetchSNSName]);

  useEffect(() => {
    if (address) {
      fetchSNSName(address);
    } else {
      // Reset state when address is null/empty
      setDomain(null);
      setError(null);
      setIsLoading(false);
    }
  }, [address, fetchSNSName]);

  return {
    domain,
    isLoading,
    error,
    refetch,
  };
}

// Optional: Hook with caching to avoid repeated requests for the same address
export function useSNSLookupWithCache(address: string | null): SNSLookupResult {
  const [cache, setCache] = useState<Map<string, { domain: string | null; timestamp: number }>>(new Map());
  const [domain, setDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchSNSName = useCallback(async (walletAddress: string) => {
    if (!walletAddress || !walletAddress.trim()) {
      setDomain(null);
      setError(null);
      return;
    }

    // Check cache first
    const cached = cache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setDomain(cached.domain);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sns/lookup?address=${encodeURIComponent(walletAddress)}`);
      
      if (!response.ok) {
        const errorData: SNSApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: SNSApiResponse = await response.json();

      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message} (Code: ${data.error.code})`);
      }

      const resolvedDomain = data.result && data.result.data && Array.isArray(data.result.data) && data.result.data.length > 0 
        ? data.result.data[0] 
        : null;

      // Update cache
      setCache(prev => new Map(prev).set(walletAddress, {
        domain: resolvedDomain,
        timestamp: Date.now()
      }));

      setDomain(resolvedDomain);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, [cache, CACHE_DURATION]);

  const refetch = useCallback(() => {
    if (address) {
      // Clear cache for this address to force refresh
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(address);
        return newCache;
      });
      fetchSNSName(address);
    }
  }, [address, fetchSNSName]);

  useEffect(() => {
    if (address) {
      fetchSNSName(address);
    } else {
      setDomain(null);
      setError(null);
      setIsLoading(false);
    }
  }, [address, fetchSNSName]);

  return {
    domain,
    isLoading,
    error,
    refetch,
  };
}
