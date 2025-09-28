"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Lock, Shield, AlertTriangle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

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

interface TradingDemoProps {
    userCredentials: Credential[];
    onBack: () => void;
}

interface MarketData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
}

export function TradingDemo({ userCredentials }: { userCredentials: Credential[] }) {
    const [marketData, setMarketData] = useState<MarketData[]>([
        { symbol: 'BTC/USD', price: 113250.00, change: 1250.00, changePercent: 2.98, volume: '$2.1B' },
        { symbol: 'ETH/USD', price: 3650.50, change: -45.25, changePercent: -1.68, volume: '$1.8B' },
        { symbol: 'SOL/USD', price: 190.75, change: 3.20, changePercent: 3.46, volume: '$450M' },
        { symbol: 'SUI/USD', price: 3.95, change: 0.12, changePercent: 6.95, volume: '$280M' },
    ]);

    const router = useRouter();

    const [accessChecked, setAccessChecked] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [accessLevel, setAccessLevel] = useState<'none' | 'level1' | 'level2' | 'accredited'>('none');

    useEffect(() => {
        // Simulate access verification
        const timer = setTimeout(() => {
            verifyAccess();
            setAccessChecked(true); // Fixed: should be true to indicate verification is complete
        }, 1000); // Increased timeout to make loading visible

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Simulate real-time price updates
        const interval = setInterval(() => {
            setMarketData(prev => prev.map(item => ({
                ...item,
                price: item.price + (Math.random() - 0.5) * item.price * 0.001,
                change: item.change + (Math.random() - 0.5) * 10,
                changePercent: item.changePercent + (Math.random() - 0.5) * 0.5
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const verifyAccess = () => {
        // Check user credentials for access levels
        const hasKYCLevel1 = userCredentials.some(c => 
            c.credentialSubject.kyc === 'level1' && c.status === 'active'
        );
        const hasKYCLevel2 = userCredentials.some(c => 
            c.credentialSubject.kyc === 'level2' && c.status === 'active'
        );
        const hasAccreditedInvestor = userCredentials.some(c => 
            c.credentialSubject.accreditedInvestor === true && c.status === 'active'
        );

        if (hasAccreditedInvestor) {
            setAccessLevel('accredited');
            setHasAccess(true);
        } else if (hasKYCLevel2) {
            setAccessLevel('level2');
            setHasAccess(true);
        } else if (hasKYCLevel1) {
            setAccessLevel('level1');
            setHasAccess(false); // Level 1 is not enough for this demo
        } else {
            setAccessLevel('none');
            setHasAccess(false);
        }
    };

    const getAccessLevelInfo = () => {
        switch (accessLevel) {
            case 'accredited':
                return {
                    title: 'Accredited Investor Access',
                    description: 'Full access to all trading features including premium assets',
                    color: 'bg-purple-100 text-purple-800',
                    icon: Shield
                };
            case 'level2':
                return {
                    title: 'KYC Level 2 Access',
                    description: 'Access to standard trading with higher limits',
                    color: 'bg-green-100 text-green-800',
                    icon: CheckCircle
                };
            case 'level1':
                return {
                    title: 'KYC Level 1 Access',
                    description: 'Basic access with limited trading capabilities',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: AlertTriangle
                };
            default:
                return {
                    title: 'No Access',
                    description: 'KYC verification required to access trading',
                    color: 'bg-red-100 text-red-800',
                    icon: Lock
                };
        }
    };

    const accessInfo = getAccessLevelInfo();
    const IconComponent = accessInfo.icon;

    if (!accessChecked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="sui-border hover:sui-bg-light">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Trading Demo
                                </span>
                            </h1>
                        </div>
                    </div>

                    <Card className="sui-shadow">
                        <CardContent className="text-center py-12">
                            <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                            <h2 className="text-xl font-semibold mb-2">Verifying Access...</h2>
                            <p className="text-gray-600">
                                Checking your credentials for trading access permissions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="sui-border hover:sui-bg-light">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Trading Demo
                                </span>
                            </h1>
                        </div>
                    </div>

                    <Card className="sui-shadow">
                        <CardContent className="text-center py-12">
                            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                            <p className="text-gray-600 mb-6">
                                You need KYC Level 2 verification or higher to access this trading platform.
                            </p>
                            
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${accessInfo.color}`}>
                                <IconComponent className="h-5 w-5" />
                                <span className="font-medium">{accessInfo.title}</span>
                            </div>
                            
                            <div className="space-y-4 max-w-md mx-auto">
                                <div className="text-left bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">To gain access:</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Complete KYC Level 2 verification</li>
                                        <li>• Provide income verification</li>
                                        <li>• Submit source of funds documentation</li>
                                        <li>• Wait for approval (usually 24-48 hours)</li>
                                    </ul>
                                </div>

                                <Button onClick={() => router.push('/credentials')} className="w-full sui-gradient text-white">
                                    Go to Credentials Management
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="sui-border hover:sui-bg-light">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Trading Demo Platform
                            </span>
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm md:text-base">
                            Professional trading interface with credential-based access control
                        </p>
                    </div>
                    
                    <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg ${accessInfo.color}`}>
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{accessInfo.title}</span>
                    </div>
                    
                    {/* Mobile Access Badge */}
                    <div className={`md:hidden flex items-center gap-2 px-2 py-1 rounded text-xs ${accessInfo.color}`}>
                        <IconComponent className="h-3 w-3" />
                        <span className="font-medium">
                            {accessLevel === 'accredited' ? 'Accredited' : 
                             accessLevel === 'level2' ? 'L2' : 
                             accessLevel === 'level1' ? 'L1' : 'None'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {/* Portfolio Summary */}
                    <Card className="sui-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs md:text-sm font-medium">Portfolio Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg md:text-2xl font-bold">$125,430.50</div>
                            <div className="flex items-center gap-1 text-xs md:text-sm text-green-600">
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                                +$2,340.25 (1.9%)
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="sui-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs md:text-sm font-medium">Available Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg md:text-2xl font-bold">$45,680.00</div>
                            <div className="text-xs md:text-sm text-gray-600">Ready for trading</div>
                        </CardContent>
                    </Card>

                    <Card className="sui-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs md:text-sm font-medium">Today's P&L</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg md:text-2xl font-bold text-green-600">+$1,250.75</div>
                            <div className="text-xs md:text-sm text-gray-600">12 trades executed</div>
                        </CardContent>
                    </Card>

                    <Card className="sui-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs md:text-sm font-medium">Active Positions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg md:text-2xl font-bold">8</div>
                            <div className="text-xs md:text-sm text-gray-600">Across 5 assets</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Market Data */}
                <Card className="sui-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                            Market Data
                            <Badge variant="secondary" className="ml-auto">
                                <Activity className="h-3 w-3 mr-1" />
                                Live
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 font-medium text-sm">Symbol</th>
                                        <th className="pb-3 font-medium text-right text-sm">Price</th>
                                        <th className="pb-3 font-medium text-right text-sm hidden md:table-cell">Change</th>
                                        <th className="pb-3 font-medium text-right text-sm">%</th>
                                        <th className="pb-3 font-medium text-right text-sm hidden lg:table-cell">Volume</th>
                                        <th className="pb-3 font-medium text-right text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketData.map((item, index) => (
                                        <tr key={item.symbol} className="border-b">
                                            <td className="py-3 font-medium text-sm">{item.symbol}</td>
                                            <td className="py-3 text-right font-mono text-sm">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className={`py-3 text-right font-mono text-sm hidden md:table-cell ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
                                            </td>
                                            <td className={`py-3 text-right text-sm ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {item.changePercent >= 0 ? 
                                                        <TrendingUp className="h-3 w-3" /> : 
                                                        <TrendingDown className="h-3 w-3" />
                                                    }
                                                    {Math.abs(item.changePercent).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="py-3 text-right text-gray-600 text-sm hidden lg:table-cell">{item.volume}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex gap-1 md:gap-2 justify-end">
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 text-xs md:text-sm px-2 md:px-3">
                                                        Buy
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs md:text-sm px-2 md:px-3">
                                                        Sell
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Access Level Benefits */}
                <Card className="sui-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <Shield className="h-4 w-4 md:h-5 md:w-5" />
                            Your Access Level Benefits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-sm md:text-base">Unlimited Trading</h4>
                                    <p className="text-xs md:text-sm text-gray-600">No daily or monthly limits</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-sm md:text-base">Advanced Order Types</h4>
                                    <p className="text-xs md:text-sm text-gray-600">Stop-loss, limit, and conditional orders</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-sm md:text-base">Real-time Data</h4>
                                    <p className="text-xs md:text-sm text-gray-600">Live market feeds and analytics</p>
                                </div>
                            </div>
                            {accessLevel === 'accredited' && (
                                <>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm md:text-base">Premium Assets</h4>
                                            <p className="text-xs md:text-sm text-gray-600">Access to exclusive investment opportunities</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm md:text-base">Higher Leverage</h4>
                                            <p className="text-xs md:text-sm text-gray-600">Up to 10x leverage on select assets</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm md:text-base">Dedicated Support</h4>
                                            <p className="text-xs md:text-sm text-gray-600">Priority customer service</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}