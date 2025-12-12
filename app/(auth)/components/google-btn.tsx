'use client';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useGoogleAuth } from '@/lib/use-google';

export const GoogleBtn = ({isAuthType, setError}: {isAuthType: 'login' | 'register', setError: Dispatch<SetStateAction<string>>}) => {
    const { startGoogleAuth, loading, error } = useGoogleAuth();
    useEffect(() => {
        if (error) {
            setError(error);
        }
    }, [error]);
    return (
        <>
        <button className="mt-2 w-full flex items-center justify-center gap-2 font-medium p-2 border border-black rounded-lg hover:bg-gray-100 transition-colors" disabled={loading} onClick={startGoogleAuth}>
            <img src="/devicon_google.png" alt="google" />
            {loading ? 'Redirecting...' : `Sign ${isAuthType === 'login' ? 'in' : 'up'} with Google`}
        </button>
        </>
    );
};
