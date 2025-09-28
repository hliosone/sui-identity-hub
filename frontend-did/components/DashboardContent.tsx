'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Gift } from 'lucide-react';

interface DashboardContentProps {
    userDID: string | null;
    userCredentials: Array<{ id: string; name: string; issuer: string }> | null;
    claimableCredentials: Array<{ id: string; name: string; description: string }> | null;
    isOnline: boolean;
}

export function DashboardContent({
    userDID,
    userCredentials,
    claimableCredentials,
    isOnline,
}: DashboardContentProps) {
    return (
        <div className="p-4 md:p-6 space-y-6">
        {/* DID Section */}
        <Card>
            <CardHeader>
            <CardTitle>Your Decentralized ID</CardTitle>
            </CardHeader>
            <CardContent>
            {userDID ? (
                <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm break-all">{userDID}</Badge>
                <CheckCircle className="text-green-600 h-5 w-5" />
                </div>
            ) : (
                <p className="text-slate-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                No DID found. Connect your wallet or create a DID.
                </p>
            )}
            </CardContent>
        </Card>

        {/* Credentials Section */}
        <Card>
            <CardHeader>
            <CardTitle>Your Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
            {userCredentials && userCredentials.length > 0 ? (
                userCredentials.map((cred) => (
                <div
                    key={cred.id}
                    className="flex justify-between items-center border rounded-md p-3 hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium">{cred.name}</p>
                    <p className="text-xs text-slate-500">Issued by {cred.issuer}</p>
                    </div>
                    <Badge variant="secondary">Verified</Badge>
                </div>
                ))
            ) : (
                <p className="text-slate-600 text-sm">No credentials yet.</p>
            )}
            </CardContent>
        </Card>

        {/* Claimable Section */}
        <Card>
            <CardHeader>
            <CardTitle>Claimable Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
            {claimableCredentials && claimableCredentials.length > 0 ? (
                claimableCredentials.map((cred) => (
                <div
                    key={cred.id}
                    className="flex justify-between items-center border rounded-md p-3 hover:bg-slate-50"
                >
                    <div>
                    <p className="font-medium flex items-center gap-2">
                        <Gift className="h-4 w-4 text-blue-500" />
                        {cred.name}
                    </p>
                    <p className="text-xs text-slate-500">{cred.description}</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 text-white hover:opacity-90">
                    Claim
                    </Button>
                </div>
                ))
            ) : (
                <p className="text-slate-600 text-sm">No claimable credentials available.</p>
            )}
            </CardContent>
        </Card>

        {/* Network Status */}
        {!isOnline && (
            <p className="text-red-600 text-center text-sm mt-4">
            You appear to be offline. Some data may be outdated.
            </p>
        )}
        </div>
    );
}
