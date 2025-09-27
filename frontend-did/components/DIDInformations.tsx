"use client";

import { useState } from "react";
import { Globe, Copy, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function DIDInformation() {
    const [copied, setCopied] = useState<string | null>(null);
    const { primaryWallet, user } = useDynamicContext();

    // Sample data if no userDID is provided
    const defaultDID = {
        id: "did:sui:0x1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef123456",
        publicKey: "0x2f8a9b1c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef",
        created: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
        updated: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
    };

    const didData = primaryWallet?.address
        ? {
            id: "did:sui:" + primaryWallet.address,
            publicKey: primaryWallet.address,
            created: Date.now() ? new Date().toISOString() : defaultDID.created,
            updated: Date.now() ? new Date().toISOString() : defaultDID.updated
        }
        : defaultDID;

    const handleCopy = async (text: string, type: string) => {
        try {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        } catch (err) {
        console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        {/* DiD Information */}
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-blue-200">
            <Globe className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-slate-800">DiD Information</h4>
            </div>
            
            <div className="space-y-3">
            <div>
                <Label className="text-xs uppercase tracking-wide text-slate-500">Decentralized Identifier</Label>
                <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-2 bg-slate-100 rounded-md font-mono text-xs break-all border">
                    {primaryWallet?.address ? "did:sui:" + primaryWallet.address : undefined}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(didData.id, 'id')}
                    className="h-8 w-8 p-0 hover:bg-slate-200"
                >
                    {copied === 'id' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
                </div>
            </div>

            <div>
                <Label className="text-xs uppercase tracking-wide text-slate-500">Public Key</Label>
                <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 p-2 bg-slate-100 rounded-md font-mono text-xs break-all border">
                    {primaryWallet?.address || undefined}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(primaryWallet?.address || '', 'key')}
                    className="h-8 w-8 p-0 hover:bg-slate-200"
                >
                    {copied === 'key' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
                </div>
            </div>
            </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-blue-200">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-slate-800">Issue Information</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-slate-500">Date of Issue</Label>
                <p className="font-mono text-sm text-slate-700">
                {new Date(didData.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                })}
                </p>
                <p className="text-xs text-slate-500">
                {new Date(didData.created).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </p>
            </div>
            <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-slate-500">Last Updated</Label>
                <p className="font-mono text-sm text-slate-700">
                {new Date(didData.updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                })}
                </p>
                <p className="text-xs text-slate-500">
                {new Date(didData.updated).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </p>
            </div>
            </div>
        </div>

        {/* Success message when copying */}
        {copied && (
            <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="text-sm">
                {copied === 'id' ? 'DID copied to clipboard!' : 'Public key copied to clipboard!'}
            </span>
            </div>
        )}
        </div>
    );
}