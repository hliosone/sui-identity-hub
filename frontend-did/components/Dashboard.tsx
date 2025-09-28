"use client";

import React, { use } from 'react';
import { Download, X, WifiOff, Award, Zap, Lock, Database, UserCheck, Clock, TrendingUp, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SuiLogoIcon } from './icons/SuiLogoIcon';
import { SNSLogo } from './icons/SNSLogo';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useSNSLookup } from './hook/useSNSLookup';

export function Dashboard() {
    // Mock hardcoded data
    const { user, primaryWallet } = useDynamicContext();
    const { domain, isLoading, error, refetch } = useSNSLookup(primaryWallet?.address ?? null);

    const userDID = {
        id: `did:sui:${primaryWallet?.address}`,
        created: '2025-09-28',
        metadata: {
            suiNameServiceDomain: domain,        
        }
    };

    const userCredentials = [
        {
            id: 'cred-1',
            type: 'KYC Level 2 Verification',
            status: 'active',
            issuanceDate: '2024-03-20T14:45:00Z',
            credentialSubject: {
                kyc: 'level2'
            }
        },
        {
            id: 'cred-2',
            type: 'Trading License',
            status: 'active',
            issuanceDate: '2024-03-25T09:15:00Z',
            credentialSubject: {
                license: 'trading'
            }
        },
        {
            id: 'cred-3',
            type: 'Identity Verification',
            status: 'expired',
            issuanceDate: '2024-01-10T16:20:00Z',
            credentialSubject: {
                identity: 'verified'
            }
        }
    ];

    const mockClaimableCredentials = [
        { id: 'claim-1', type: 'Professional Certification' },
        { id: 'claim-2', type: 'Community Badge' }
    ];

    const isOnline = user ? true : false;

    // Mock handlers
    const handleInstallPWA = () => console.log('Installing PWA...');
    const handleDismissInstallPrompt = () => console.log('Dismissing install prompt...');
    const handlePageChange = (page: string) => console.log(`Navigating to ${page}...`);

    return (
        <div className="p-4 md:p-6 space-y-6">
        {/* PWA Install Banner */}
        
        {/* Offline Banner */}
        {!isOnline && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-orange-600" />
                <div>
                <h3 className="font-medium text-orange-900">You're offline</h3>
                <p className="text-sm text-orange-700">Some features may be limited until you reconnect</p>
                </div>
            </div>
            </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SUI Identity Hub
            </h1>
            <p className="text-slate-600 mt-2 text-sm md:text-base">Manage your decentralized identity and credentials on Sui Network</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* SUI DiD Status Card */}
            <Card className="sui-shadow-lg bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 border-2 sui-border hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 sui-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <SuiLogoIcon size={16} className="text-white md:hidden" />
                    <SuiLogoIcon size={20} className="text-white hidden md:block" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base">SUI DiD Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${userDID ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                        <span className={`text-xs md:text-sm font-medium ${userDID ? 'text-green-600' : 'text-slate-500'}`}>
                        {userDID ? 'Active' : 'Not Created'}
                        </span>
                    </div>
                    </div>
                </div>
                </div>
                <div className="space-y-2">
                <div className="text-xs text-slate-600 uppercase tracking-wide">Created</div>
                <div className="font-mono text-xs md:text-sm text-slate-800">
                    {userDID ? new Date(userDID.created).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                    }) : '--/--/----'}
                </div>
                {userDID?.metadata.suiNameServiceDomain && (
                    <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                    <SNSLogo size={16} />
                    <div className="font-mono text-xs text-slate-700">
                        {userDID.metadata.suiNameServiceDomain}
                    </div>
                    </div>
                )}
                </div>
            </CardContent>
            </Card>

            {/* Credentials Card */}
            <Card className="sui-shadow-lg bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 border-2 border-cyan-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base">Credentials</h3>
                    <div className="text-xl md:text-2xl font-bold text-cyan-600 mt-1">
                        {userCredentials.length}
                    </div>
                    </div>
                </div>
                </div>
                <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                    <span>Active: {userCredentials.filter(c => c.status === 'active').length}</span>
                    <span>Expired: {userCredentials.filter(c => c.status === 'expired').length}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                        width: userCredentials.length > 0 
                        ? `${(userCredentials.filter(c => c.status === 'active').length / userCredentials.length) * 100}%` 
                        : '0%' 
                    }}
                    ></div>
                </div>
                </div>
            </CardContent>
            </Card>

            {/* Claimable Credentials Card */}
            <Card className="sui-shadow-lg bg-gradient-to-br from-yellow-50/50 via-white to-orange-50/30 border-2 border-yellow-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base">Claimable</h3>
                    <div className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
                        {mockClaimableCredentials.length}
                    </div>
                    </div>
                </div>
                </div>
                <div className="space-y-2">
                <div className="text-xs text-slate-600 uppercase tracking-wide">Available to Claim</div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs text-yellow-600 font-medium">Ready</span>
                </div>
                </div>
            </CardContent>
            </Card>

            {/* Access Level Card */}
            <Card className="sui-shadow-lg bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base">Access Level</h3>
                    <div className="text-xl md:text-2xl font-bold text-purple-600 mt-1">
                        {userCredentials.some(c => c.credentialSubject.kyc === 'level2') ? 'Level 2' : 
                        userCredentials.some(c => c.credentialSubject.kyc === 'level1') ? 'Level 1' : 'None'}
                    </div>
                    </div>
                </div>
                </div>
                <div className="space-y-2">
                <div className="text-xs text-slate-600 uppercase tracking-wide">KYC Verification</div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full">
                    <div 
                        className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ 
                        width: userCredentials.some(c => c.credentialSubject.kyc === 'level2') ? '100%' :
                                userCredentials.some(c => c.credentialSubject.kyc === 'level1') ? '50%' : '0%'
                        }}
                    ></div>
                    </div>
                    <Badge 
                    className={`text-xs ${
                        userCredentials.some(c => c.credentialSubject.kyc === 'level2') 
                        ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        userCredentials.some(c => c.credentialSubject.kyc === 'level1')
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    >
                    {userCredentials.some(c => c.credentialSubject.kyc === 'level2') ? 'Complete' :
                    userCredentials.some(c => c.credentialSubject.kyc === 'level1') ? 'Basic' : 'None'}
                    </Badge>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="sui-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 sui-text" />
                Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button 
                onClick={() => handlePageChange('did-management')} 
                className="w-full justify-start sui-gradient text-white hover:opacity-90"
                >
                <SuiLogoIcon size={16} className="mr-2" />
                {userDID ? 'Manage SUI DiD' : 'Create SUI DiD'}
                </Button>
                <Button 
                onClick={() => handlePageChange('credentials')} 
                className="w-full justify-start"
                variant="outline"
                >
                <Award className="h-4 w-4 mr-2" />
                Manage Credentials
                </Button>
                <Button 
                onClick={() => handlePageChange('issuance')} 
                className="w-full justify-start"
                variant="outline"
                >
                <FileText className="h-4 w-4 mr-2" />
                Issue Credentials
                </Button>
                <Button 
                onClick={() => handlePageChange('demo')} 
                className="w-full justify-start"
                variant="outline"
                >
                <TrendingUp className="h-4 w-4 mr-2" />
                SUI Trading Demo
                </Button>
            </CardContent>
            </Card>

            <Card className="sui-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 sui-text" />
                Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 sui-bg-light rounded-lg">
                    <SuiLogoIcon size={16} />
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">SUI DiD Created</p>
                    <p className="text-xs text-slate-600">Your decentralized identity was established on Sui Network</p>
                    </div>
                    <Badge variant="secondary" className="sui-border">
                    <Clock className="h-3 w-3 mr-1" />
                    {userDID ? new Date(userDID.created).toLocaleDateString() : 'N/A'}
                    </Badge>
                </div>
                
                {userCredentials.slice(0, 2).map((cred, index) => (
                    <div key={cred.id} className="flex items-center gap-3 p-3 sui-bg-light rounded-lg">
                    <Award className="h-4 w-4 text-cyan-600" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Credential Issued</p>
                        <p className="text-xs text-slate-600">{cred.type}</p>
                    </div>
                    <Badge variant="secondary" className="sui-border">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(cred.issuanceDate).toLocaleDateString()}
                    </Badge>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}