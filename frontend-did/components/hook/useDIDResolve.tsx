import { useState, useEffect, useCallback } from 'react';

// Type definition based on your return data
export interface DIDData {
    cid: string;
    created_at: string;
    did: string;
    revoked: boolean;
    subject_address: string;
    updated_at: string;
    version: string;
    id: string;
}

export interface UseDIDResolveResult {
    data: DIDData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseDIDResolveOptions {
    enabled?: boolean; // Whether to auto-fetch on mount
    onSuccess?: (data: DIDData) => void;
    onError?: (error: string) => void;
}

export function useDIDResolve(
    userAddress?: string,
    options: UseDIDResolveOptions = {}
): UseDIDResolveResult {
    const { enabled = true, onSuccess, onError } = options;
    
    const [data, setData] = useState<DIDData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDID = useCallback(async () => {
        if (!userAddress) {
        setError('User address is required');
        return;
        }

        setLoading(true);
        setError(null);

        try {
        const response = await fetch(`/api/did/resolve?didresolve=${encodeURIComponent(userAddress)}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Check if it's an error response
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Check if no object was found
        if (result.message) {
            setData(null);
            setError(result.message);
            onError?.(result.message);
            return;
        }

        setData(result);
        onSuccess?.(result);
        } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        setData(null);
        } finally {
        setLoading(false);
        }
    }, [userAddress, onSuccess, onError]);

    // Auto-fetch on mount and when userAddress changes (if enabled)
    useEffect(() => {
        if (enabled && userAddress) {
        fetchDID();
        }
    }, [enabled, userAddress, fetchDID]);

    // Reset states when userAddress changes
    useEffect(() => {
        if (!userAddress) {
        setData(null);
        setError(null);
        setLoading(false);
        }
    }, [userAddress]);

    return {
        data,
        loading,
        error,
        refetch: fetchDID,
    };
    }

    // Optional: Hook for manual fetching only
    export function useDIDResolveLazy(): [
    (userAddress: string) => Promise<DIDData | null>,
    UseDIDResolveResult
    ] {
    const [data, setData] = useState<DIDData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDID = useCallback(async (userAddress: string): Promise<DIDData | null> => {
        setLoading(true);
        setError(null);

        try {
        const response = await fetch(`/api/did/resolve?didresolve=${encodeURIComponent(userAddress)}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        if (result.message) {
            setData(null);
            setError(result.message);
            return null;
        }

        setData(result);
        return result;
        } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setData(null);
        return null;
        } finally {
        setLoading(false);
        }
    }, []);

    return [
        fetchDID,
        {
        data,
        loading,
        error,
        refetch: () => Promise.resolve(), // Not applicable for lazy hook
        },
    ];
}