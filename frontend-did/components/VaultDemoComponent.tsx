"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Vault, Shield, Lock, Unlock, AlertTriangle, CheckCircle, TrendingUp, Clock, User, Award, Zap, Eye, EyeOff, Home, Info, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useRouter } from "next/navigation";

export function VaultDemo() {
    const [isBackButtonCollapsed, setIsBackButtonCollapsed] = useState(true);
    const [accessingVault, setAccessingVault] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [fundsVisible, setFundsVisible] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    type Transaction = {
        id: number;
        type: string;
        amount: number;
        timestamp: string;
        status: string;
    };
    const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

    const router = useRouter();

    // Mock user credentials
    const userCredentials = [
        {
        id: 'cred-1',
        type: 'KYC Level 2 Verification',
        status: 'active',
        issuanceDate: '2024-03-20T14:45:00Z',
        credentialSubject: {
            kyc: 'level2',
            verified: true
        }
        },
        {
        id: 'cred-2',
        type: 'Trading License',
        status: 'active',
        issuanceDate: '2024-03-25T09:15:00Z',
        credentialSubject: {
            trading: 'authorized',
            license: 'professional'
        }
        }
    ];

    // Single SUI vault
    const vault = {
        id: 'sui-vault',
        name: 'SUI Staking Vault',
        description: 'Secure SUI token staking with automated rewards',
        balance: 12500.00,
        currency: 'SUI',
        apy: 7.5,
        maxWithdrawal: 5000,
        requiredCredentials: ['kyc', 'trading'],
        requiredLevel: 'level2',
        color: 'from-blue-500 to-cyan-600',
        lightColor: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200'
    };

    const checkAccess = () => {
        const hasKYC = userCredentials.some(c => 
        c.credentialSubject.kyc === 'level2'
        );
        
        const hasTrading = userCredentials.some(c => 
        c.credentialSubject.trading === 'authorized'
        );

        return hasKYC && hasTrading;
    };

    const handleVaultAccess = async () => {
        setAccessingVault(true);
        setAccessGranted(false);

        // Simulate credential verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        const hasAccess = checkAccess();
        setAccessGranted(hasAccess);
        setAccessingVault(false);

        if (hasAccess) {
        // Generate mock transaction history
        const mockHistory = [
            {
            id: 1,
            type: 'stake',
            amount: 5000,
            timestamp: '2024-09-15T10:30:00Z',
            status: 'completed'
            },
            {
            id: 2,
            type: 'reward',
            amount: 125.5,
            timestamp: '2024-09-20T00:00:00Z',
            status: 'completed'
            },
            {
            id: 3,
            type: 'unstake',
            amount: 1500,
            timestamp: '2024-09-25T14:15:00Z',
            status: 'completed'
            }
        ];
        setTransactionHistory(mockHistory);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
        
        setWithdrawing(true);
        
        // Simulate withdrawal processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Add to transaction history
        const newTransaction = {
        id: transactionHistory.length + 1,
        type: 'unstake',
        amount: parseFloat(withdrawAmount),
        timestamp: new Date().toISOString(),
        status: 'completed'
        };
        
        setTransactionHistory(prev => [newTransaction, ...prev]);
        setWithdrawAmount('');
        setWithdrawing(false);
    };

    type ButtonVariant = "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined;
    const CollapsibleBackButton: React.FC<{ variant?: ButtonVariant; className?: string }> = ({ variant = "ghost", className = "" }) => {
        return (
        <div 
            className="flex items-center"
            onMouseEnter={() => setIsBackButtonCollapsed(false)}
            onMouseLeave={() => setIsBackButtonCollapsed(true)}
        >
            <Button 
            variant={variant} 
            onClick={() => router.push('/dashboard')} 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${className} ${
                isBackButtonCollapsed ? 'w-10 px-0' : 'w-auto px-4'
            }`}
            >
            <div className="flex items-center whitespace-nowrap">
                {isBackButtonCollapsed ? (
                <Home className="h-4 w-4" />
                ) : (
                <>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span className="transition-opacity duration-300">Back to Dashboard</span>
                </>
                )}
            </div>
            </Button>
        </div>
        );
    };

    if (accessGranted) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <CollapsibleBackButton variant="ghost" className="sui-border hover:sui-bg-light" />
                <Button 
                variant="outline"
                onClick={() => {
                    setAccessGranted(false);
                    setFundsVisible(false);
                    setTransactionHistory([]);
                }}
                className="sui-border"
                >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
                </Button>
                <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${vault.color} rounded-lg flex items-center justify-center`}>
                    <Vault className="h-6 w-6 text-white" />
                    </div>
                    {vault.name}
                </h1>
                <p className="text-slate-600 mt-2">{vault.description}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Vault Overview */}
                <div className="lg:col-span-2">
                <Card className="sui-shadow">
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 sui-text" />
                        Staked Balance
                        </div>
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFundsVisible(!fundsVisible)}
                        className="text-slate-500 hover:text-slate-700"
                        >
                        {fundsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-slate-800 mb-2">
                        {fundsVisible 
                            ? `${vault.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                            : '••••••••'
                        }
                        </div>
                        <div className="text-lg text-blue-600 font-semibold">{vault.currency}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{vault.apy}%</div>
                        <div className="text-sm text-blue-600">APY</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {vault.maxWithdrawal.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Max Unstake</div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Withdrawal Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                        <Unlock className="h-5 w-5 sui-text" />
                        <h3 className="text-lg font-semibold">Unstake SUI</h3>
                        </div>
                        
                        <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount"
                            max={vault.maxWithdrawal}
                            className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <Button
                            onClick={handleWithdraw}
                            disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                            className="sui-gradient text-white px-6"
                        >
                            {withdrawing ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Processing...
                            </>
                            ) : (
                            'Unstake'
                            )}
                        </Button>
                        </div>
                        
                        <div className="text-sm text-slate-500">
                        Maximum unstake: {vault.maxWithdrawal.toLocaleString()} SUI per transaction
                        </div>
                    </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card className="sui-shadow mt-6">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 sui-text" />
                        Transaction History
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-3">
                        {transactionHistory.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === 'stake' ? 'bg-blue-100 text-blue-600' :
                                tx.type === 'unstake' ? 'bg-red-100 text-red-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                {tx.type === 'stake' ? '+' : tx.type === 'unstake' ? '-' : '%'}
                            </div>
                            <div>
                                <div className="font-medium capitalize">{tx.type}</div>
                                <div className="text-sm text-slate-500">
                                {new Date(tx.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            </div>
                            <div className="text-right">
                            <div className={`font-semibold ${
                                tx.type === 'stake' || tx.type === 'reward' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {tx.type === 'stake' || tx.type === 'reward' ? '+' : '-'}
                                {tx.amount.toLocaleString()} SUI
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {tx.status}
                            </Badge>
                            </div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                </div>

                {/* Access Verification Sidebar */}
                <div className="space-y-6">
                <Card className="sui-shadow">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Access Verified
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                        <CheckCircle className="h-4 w-4" />
                        Credentials Verified
                        </div>
                        <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            <span>KYC Level 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            <span>Trading License</span>
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                <Card className="sui-shadow">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 sui-text" />
                        Your Credentials
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {userCredentials.map((cred) => (
                        <div key={cred.id} className="p-3 sui-bg-light rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">{cred.type}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                            Issued: {new Date(cred.issuanceDate).toLocaleDateString()}
                        </div>
                        <Badge className="mt-2 text-xs bg-green-100 text-green-700 border-green-200">
                            {cred.status}
                        </Badge>
                        </div>
                    ))}
                    </CardContent>
                </Card>

                <Card className="sui-shadow">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Vault Details
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Currency:</span>
                        <span className="font-medium text-blue-600">SUI</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Staking APY:</span>
                        <span className="font-medium text-green-600">{vault.apy}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Max Unstake:</span>
                        <span className="font-medium">{vault.maxWithdrawal.toLocaleString()} SUI</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Network:</span>
                        <span className="font-medium">Sui Blockchain</span>
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
            <CollapsibleBackButton variant="ghost" className="sui-border hover:sui-bg-light" />
            <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-10 h-10 sui-gradient rounded-lg flex items-center justify-center">
                    <Vault className="h-6 w-6 text-white" />
                </div>
                SUI Staking Vault Demo
                </h1>
                <p className="text-slate-600 mt-2">Access SUI staking vault based on your verified credentials</p>
            </div>
            </div>

            {/* Access in Progress */}
            {accessingVault && (
            <Card className="max-w-2xl mx-auto sui-shadow">
                <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
                    <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-4">Verifying Credentials...</h2>
                <p className="text-slate-600 mb-6">
                    Checking your credentials against vault requirements
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Validating KYC Level 2...</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Checking trading credentials...</span>
                    </div>
                </div>
                </CardContent>
            </Card>
            )}

            {/* Main Vault Card */}
            {!accessingVault && (
            <>
                {/* Your Credentials Summary */}
                <Card className="sui-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 sui-text" />
                    Your Credentials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCredentials.map((cred) => (
                        <div key={cred.id} className="p-4 sui-bg-light rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">{cred.type}</span>
                        </div>
                        <div className="text-xs text-slate-600 mb-2">
                            Issued: {new Date(cred.issuanceDate).toLocaleDateString()}
                        </div>
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                            {cred.status}
                        </Badge>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>

                {/* SUI Vault */}
                <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl sui-shadow hover:scale-105">
                <CardContent className="p-6">
                    <div className={`w-full h-40 bg-gradient-to-r ${vault.color} rounded-lg mb-6 flex items-center justify-center`}>
                    <div className="text-center text-white">
                        <Vault className="h-12 w-12 mx-auto mb-3" />
                        <div className="text-3xl font-bold">{vault.apy}%</div>
                        <div className="text-sm opacity-90">Staking APY</div>
                    </div>
                    </div>

                    <div className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-semibold">{vault.name}</h3>
                        <p className="text-slate-600 mt-1">{vault.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                        <span className="text-slate-600">Total Staked:</span>
                        <span className="font-semibold">{vault.balance.toLocaleString()} SUI</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-slate-600">Max Unstake:</span>
                        <span className="font-medium">{vault.maxWithdrawal.toLocaleString()} SUI</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-600">Required Credentials:</div>
                        <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-700">KYC Level 2 Verification</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-700">Trading License</span>
                        </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleVaultAccess}
                        className="w-full sui-gradient text-white"
                    >
                        <Unlock className="h-4 w-4 mr-2" />
                        Access SUI Staking Vault
                    </Button>
                    </div>
                </CardContent>
                </Card>

                {/* Demo Information */}
                <Card className="sui-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Demo Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>
                    This demo shows how verifiable credentials can be used to gate access to financial services. 
                    The vault requires both KYC Level 2 verification and a valid trading license.
                    </p>
                    <p>
                    In a real implementation, the credentials would be verified on-chain and the vault would interact 
                    with actual SUI staking mechanisms.
                    </p>
                </CardContent>
                </Card>
            </>
            )}
        </div>
        </div>
    );
}