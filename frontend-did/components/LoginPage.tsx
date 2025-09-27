import React, { useState } from 'react';
import { Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { SuiLogoIcon } from './icons/SuiLogoIcon';

interface LoginPageProps {
    onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleLogin = async () => {
        setIsConnecting(true);
        
        // Simulate connection process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        onLogin();
    };

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
                <Button 
                onClick={handleLogin}
                className="w-full h-12 text-lg sui-gradient hover:opacity-90 text-white shadow-md"
                disabled={isConnecting}
                >
                {isConnecting ? (
                    <>
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Connecting...
                    </>
                ) : (
                    <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                )}
                </Button>

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