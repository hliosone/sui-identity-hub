"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Award, Shield, Clock, CheckCircle, XCircle, Download, Eye, Plus, AlertTriangle, FileText, Star, Zap, Lock, Users, Calendar, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { SuiLogoIcon } from './icons/SuiLogoIcon';
import { SuiLogoIconWhite } from './icons/SuiIconWhite';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface Credential {
    id: string;
    type: string;
    status: string;
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: Record<string, any>;
    subject: string;
    proof: {
        type: string;
        verificationMethod: string;
        signature: string;
    };
}

interface ClaimableCredential {
    id: string;
    type: string;
    description: string;
    issuer: string;
    requirements: string[];
    scopes: Record<string, string>;
}

export function CredentialsManagement() {
    const { primaryWallet } = useDynamicContext();
    const [userCredentials, setUserCredentials] = useState<Credential[]>([]);
    const [claimableCredentials, setClaimableCredentials] = useState<ClaimableCredential[]>([]);
    const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
    const [claiming, setClaiming] = useState<string | null>(null);

    // Fetch credentials for this wallet
    useEffect(() => {
        if (!primaryWallet) return;

        const fetchCredentials = async () => {
        try {
            const res = await fetch(`/api/credentials?address=${primaryWallet.address}`);
            const data = await res.json();
            setUserCredentials(data.userCredentials || []);
            setClaimableCredentials(data.claimableCredentials || []);
        } catch (err) {
            console.error("Failed to fetch credentials:", err);
        }
        };

        fetchCredentials();
    }, [primaryWallet]);

    // Claim a credential
    const handleClaim = async (credentialId: string) => {
        setClaiming(credentialId);
        await new Promise(resolve => setTimeout(resolve, 2000)); // simulate transaction
        const claimed = claimableCredentials.find(c => c.id === credentialId);
        if (claimed) {
        setUserCredentials(prev => [
            ...prev,
            {
                ...claimed,
                status: 'active',
                issuanceDate: new Date().toISOString(),
                subject: primaryWallet?.address || '',
                credentialSubject: {},
                proof: {
                    type: 'None',
                    verificationMethod: '',
                    signature: '',
                },
            } as Credential
        ]);
        setClaimableCredentials(prev => prev.filter(c => c.id !== credentialId));
        }
        setClaiming(null);
    };

    // --- Helper functions ---
    const getStatusIcon = (status: string) => {
        switch (status) {
        case 'active': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
        case 'expired': return <Clock className="h-4 w-4 text-amber-600" />;
        case 'revoked': return <XCircle className="h-4 w-4 text-red-600" />;
        default: return <Shield className="h-4 w-4 text-slate-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
        case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'expired': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'revoked': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getCredentialTypeIcon = (type: string) => {
        if (type.includes('KYC')) return Users;
        if (type.includes('Accredited')) return Star;
        return FileText;
    };

    const getCredentialPriority = (type: string) => {
        if (type.includes('KYCLevel2') || type.includes('Accredited')) return 'high';
        if (type.includes('KYCLevel1')) return 'medium';
        return 'low';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
        case 'high': return 'from-purple-500 to-pink-500';
        case 'medium': return 'from-blue-500 to-cyan-500';
        default: return 'from-slate-400 to-slate-500';
        }
    };

    const isCredentialAvailable = (claimable: ClaimableCredential) => {
        const hasCredential = userCredentials.some(c => c.type === claimable.type && c.status === 'active');
        if (claimable.id === 'kyc-level-2') {
        const hasLevel1 = userCredentials.some(c => c.type === 'KYCLevel1Credential' && c.status === 'active');
        return !hasCredential && hasLevel1;
        }
        if (claimable.id === 'accredited-investor') {
        const hasLevel2 = userCredentials.some(c => c.type === 'KYCLevel2Credential' && c.status === 'active');
        return !hasCredential && hasLevel2;
        }
        return !hasCredential;
    };

    const progressPercentage = Math.round((userCredentials.filter(c => c.status === 'active').length / 3) * 100);

    // --- Render ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()} className="sui-border hover:sui-bg-light">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 sui-gradient rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-blue-50" />
                </div>
                Credentials Management
                </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                <div className="text-sm text-slate-600">Credential Progress</div>
                <div className="text-lg font-semibold sui-text">{progressPercentage}% Complete</div>
                </div>
                <div className="w-20">
                <Progress value={progressPercentage} className="h-2" />
                </div>
            </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="sui-shadow border-0">
                <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg">
                    <Award className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                    </div>
                    <div>
                    <div className="text-lg md:text-2xl font-bold text-emerald-600">{userCredentials.length}</div>
                    <p className="text-xs md:text-sm text-slate-600">Total</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="sui-shadow border-0">
                <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-cyan-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-cyan-600" />
                    </div>
                    <div>
                    <div className="text-lg md:text-2xl font-bold text-cyan-600">
                        {userCredentials.filter(c => c.status === 'active').length}
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">Active</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="sui-shadow border-0">
                <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-yellow-100 rounded-lg">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                    </div>
                    <div>
                    <div className="text-lg md:text-2xl font-bold text-yellow-600">
                        {claimableCredentials.filter(c => isCredentialAvailable(c)).length}
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">Available</p>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="sui-shadow border-0">
                <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 sui-bg-light rounded-lg">
                    <Lock className="h-4 w-4 md:h-5 md:w-5 sui-text" />
                    </div>
                    <div>
                    <div className="text-lg md:text-2xl font-bold sui-text">
                        {userCredentials.some(c => c.credentialSubject.kyc === 'level2') ? 'L2' : 
                        userCredentials.some(c => c.credentialSubject.kyc === 'level1') ? 'L1' : 'L0'}
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">Access Level</p>
                    </div>
                </div>
                </CardContent>
            </Card>
            </div>

            {/* Tabs */}
            <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-1 space-y-4">
                <Card className="sui-shadow border-0">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <SuiLogoIcon size={16} className="md:hidden" />
                    <SuiLogoIcon size={20} className="hidden md:block" />
                    Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button 
                    className="w-full justify-start sui-gradient text-white hover:opacity-90 text-sm md:text-base"
                    onClick={() => {/* Handle quick claim */}}
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Claim KYC Level 1
                    </Button>
                    <Button variant="outline" className="w-full justify-start sui-border hover:sui-bg-light text-sm md:text-base">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm md:text-base">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify On-chain
                    </Button>
                </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3">
                <Tabs defaultValue="owned" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sui-bg-light">
                    <TabsTrigger value="owned" className="data-[state=active]:sui-gradient data-[state=active]:text-white">
                    My Credentials ({userCredentials.length})
                    </TabsTrigger>
                    <TabsTrigger value="claimable" className="data-[state=active]:sui-gradient data-[state=active]:text-white">
                    Available to Claim ({claimableCredentials.length})
                    </TabsTrigger>
                </TabsList>

                {/* Owned Credentials */}
                <TabsContent value="owned" className="space-y-4 mt-6">
                    {userCredentials.length === 0 ? (
                    <Card className="sui-shadow border-0">
                        <CardContent className="text-center py-12">
                        <div className="mx-auto mb-4 w-16 h-16 sui-bg-light rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 sui-text" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Credentials Yet</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            You haven't been issued any credentials yet. Start by claiming your first credential to unlock SUI ecosystem features.
                        </p>
                        <Button className="sui-gradient text-white hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Claim Your First Credential
                        </Button>
                        </CardContent>
                    </Card>
                    ) : (
                    <div className="grid gap-4">
                        {userCredentials.map((credential) => {
                        const priority = getCredentialPriority(credential.type);
                        const IconComponent = getCredentialTypeIcon(credential.type);

                        return (
                            <Card key={credential.id} className="sui-shadow border-0 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className={`h-1 bg-gradient-to-r ${getPriorityColor(priority)}`}></div>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 bg-gradient-to-r ${getPriorityColor(priority)} rounded-xl`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-semibold text-slate-900">{credential.type}</h3>
                                        <Badge className={`${getStatusColor(credential.status)} border`}>
                                            {getStatusIcon(credential.status)}
                                            <span className="ml-1 capitalize">{credential.status}</span>
                                        </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                        Issued by {credential.issuer.split(':').pop()?.substring(0, 20)}...
                                        </p>
                                    </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-6">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedCredential(credential)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                                </div>
                            </CardContent>
                            </Card>
                        );
                        })}
                    </div>
                    )}
                </TabsContent>

                {/* Claimable Credentials */}
                <TabsContent value="claimable" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                    {claimableCredentials.map((claimable) => {
                        const available = isCredentialAvailable(claimable);
                        const isClaimingThis = claiming === claimable.id;
                        const priority = getCredentialPriority(claimable.type);
                        const IconComponent = getCredentialTypeIcon(claimable.type);

                        return (
                        <Card key={claimable.id} className={`sui-shadow border-0 transition-all duration-300 overflow-hidden ${available ? 'hover:shadow-xl' : 'opacity-60'}`}>
                            <div className={`h-1 bg-gradient-to-r ${available ? getPriorityColor(priority) : 'from-slate-300 to-slate-400'}`}></div>
                            <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 ${available ? `bg-gradient-to-r ${getPriorityColor(priority)}` : 'bg-slate-200'} rounded-xl`}>
                                    <IconComponent className={`h-6 w-6 ${available ? 'text-white' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-semibold text-slate-900">{claimable.type}</h3>
                                        {!available && (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Requirements not met
                                        </Badge>
                                        )}
                                        {available && (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <Zap className="h-3 w-3 mr-1" />
                                            Ready to claim
                                        </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-600">{claimable.description}</p>
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <Button 
                                    onClick={() => handleClaim(claimable.id)}
                                    disabled={!available || isClaimingThis}
                                    className={`min-w-[120px] ${available ? 'sui-gradient text-white hover:opacity-90' : ''}`}
                                    size="lg"
                                    >
                                    {isClaimingThis ? (
                                        <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Claiming...
                                        </>
                                    ) : (
                                        <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Claim Now
                                        </>
                                    )}
                                    </Button>
                                </div>
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                    </div>
                </TabsContent>
                </Tabs>
            </div>
            </div>
        </div>

        {/* Credential Modal */}
        {selectedCredential && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden sui-shadow-lg border-0">
                <CardHeader className="sui-gradient text-white">
                <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                    <SuiLogoIconWhite size={24} />
                    <span>Credential Details</span>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedCredential(null)} className="text-white hover:bg-white/20">
                    ×
                    </Button>
                </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Display details of selectedCredential as in your original code */}
                </CardContent>
            </Card>
            </div>
        )}
        </div>
    );
}
