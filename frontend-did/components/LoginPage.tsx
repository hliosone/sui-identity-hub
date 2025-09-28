"use client";

import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { SuiLogoIcon } from './icons/SuiLogoIcon';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/navigation';

export function LoginPage() {
    const router = useRouter();
    const { user, primaryWallet } = useDynamicContext();

    useEffect(() => {
        router.push(user && primaryWallet ? '/dashboard' : '/');
    }, [user, primaryWallet]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            {/* Centered Login Card */}
            <Card className="w-full sui-shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6">
                <div className="mx-auto w-fit">
                <SuiLogoIcon size={80} />
                </div>
                <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    SUI Identity Hub
                </h1>
                <p className="text-slate-600 mt-2">
                    Your gateway to decentralized identity on Sui Network
                </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <DynamicWidget />
                </div>

                <div className="text-center space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 justify-center">
                    <CheckCircle className="h-4 w-4 sui-text" />
                    <span>Create your decentralized identity</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 justify-center">
                    <CheckCircle className="h-4 w-4 sui-text" />
                    <span>Manage verifiable credentials</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 justify-center">
                    <CheckCircle className="h-4 w-4 sui-text" />
                    <span>Access protected resources</span>
                    </div>
                </div>
                </div>

                <div className="border-t pt-4">
                <p className="text-xs text-slate-500 text-center">
                    Secure and fast transactions powered by Sui Network
                </p>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}