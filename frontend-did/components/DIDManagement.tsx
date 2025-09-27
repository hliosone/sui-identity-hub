"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, Waves, Edit, Save,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SNSLogo } from "./icons/SNSLogo";
import { useRouter } from "next/navigation";
import {
    useUserUpdateRequest,
    useDynamicContext,
} from "@dynamic-labs/sdk-react-core";

export function DIDManagement() {
    const router = useRouter();
    const { user } = useDynamicContext();                     // ✅ current Dynamic user
    const primaryWallet = useDynamicContext();       // ✅ check primary wallet
    const { updateUser } = useUserUpdateRequest();  // ✅ update profile

    const [isEditing, setIsEditing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainStatus, setDomainStatus] = useState<"available" | "taken" | "invalid" | null>(null);
    const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        nickname: user?.username || "",
        suiNameServiceDomain: user?.username || "",
    });

    // 🔎 Simulated username availability check
    const checkUsernameAvailability = async (username: string): Promise<"available" | "taken" | "invalid"> => {
        await new Promise((r) => setTimeout(r, 800));
        if (!username || username.length < 4 || !/^@[a-z0-9_]+$/i.test(username)) return "invalid";
        const taken = ["@john", "@admin", "@test", "@user", "@demo", "@sui"];
        return taken.includes(username.toLowerCase()) ? "taken" : "available";
    };

    const generateUsernameSuggestions = (nickname: string): string[] => {
        if (!nickname) return [];
        const clean = nickname.toLowerCase().replace(/[^a-z0-9]/g, "");
        return [
        `@${clean}`,
        `@${clean}${Math.floor(Math.random() * 100)}`,
        `@sui_${clean}`,
        ];
    };

    const formatUsername = (input: string): string => {
        const clean = input.toLowerCase().replace(/[^a-z0-9_]/g, "");
        return clean ? (clean.startsWith("@") ? clean : `@${clean}`) : "";
    };

    // Suggest usernames when nickname changes
    useEffect(() => {
        if (formData.nickname && isEditing) {
        const suggestions = generateUsernameSuggestions(formData.nickname);
        setSuggestedDomains(suggestions);
        if (!formData.suiNameServiceDomain && suggestions.length > 0) {
            setFormData((prev) => ({ ...prev, suiNameServiceDomain: suggestions[0] }));
        }
        }
    }, [formData.nickname, isEditing]);

    // Check username availability
    useEffect(() => {
        const checkUsername = async () => {
        if (formData.suiNameServiceDomain && isEditing) {
            const formatted = formatUsername(formData.suiNameServiceDomain);
            if (formatted !== formData.suiNameServiceDomain) {
            setFormData((prev) => ({ ...prev, suiNameServiceDomain: formatted }));
            return;
            }
            setIsCheckingDomain(true);
            setDomainStatus(null);
            const status = await checkUsernameAvailability(formatted);
            setDomainStatus(status);
            setIsCheckingDomain(false);
        } else {
            setDomainStatus(null);
        }
        };
        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.suiNameServiceDomain, isEditing]);

    // ✅ Save username to Dynamic
    const handleSave = async () => {
        if (domainStatus === "taken") {
        alert("Please choose an available username before saving.");
        return;
        }
        if (domainStatus === "invalid") {
        alert("Please enter a valid username format before saving.");
        return;
        }
        if (!primaryWallet) {
        alert("Please connect a primary wallet first.");
        return;
        }

        setIsSaving(true);
        try {
        await updateUser({
            username: formData.suiNameServiceDomain,
        });
        setIsEditing(false);
        alert("Username updated successfully in Dynamic!");
        } catch (err) {
        console.error("Dynamic update failed:", err);
        alert("Failed to update profile. Please try again.");
        } finally {
        setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
        nickname: user?.username || "",
        suiNameServiceDomain: user?.username || "",
        });
        setIsEditing(false);
    };

    const handleUseSuggestedUsername = (username: string) => {
        setFormData((prev) => ({ ...prev, suiNameServiceDomain: username }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
            {user && (
                <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
                </Button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg">
                <Waves className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Manage Dynamic Username
                </span>
            </h1>
            </div>

            {/* Profile Form */}
            <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Nickname */}
                <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData((p) => ({ ...p, nickname: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your nickname"
                />
                </div>

                {/* Username */}
                <div className="space-y-2">
                <Label htmlFor="suiNameServiceDomain">
                    <SNSLogo size={16} /> Dynamic Username
                </Label>
                <Input
                    id="suiNameServiceDomain"
                    value={formData.suiNameServiceDomain}
                    onChange={(e) => setFormData((p) => ({ ...p, suiNameServiceDomain: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="@yourname"
                    className={
                    domainStatus === "available"
                        ? "border-green-300 bg-green-50"
                        : domainStatus === "taken"
                        ? "border-red-300 bg-red-50"
                        : domainStatus === "invalid"
                        ? "border-orange-300 bg-orange-50"
                        : ""
                    }
                />
                {domainStatus && (
                    <p
                    className={`text-xs ${
                        domainStatus === "available"
                        ? "text-green-600"
                        : domainStatus === "taken"
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                    >
                    {domainStatus === "available" && "Username is available!"}
                    {domainStatus === "taken" && "Username is already taken"}
                    {domainStatus === "invalid" && "Invalid username format"}
                    </p>
                )}
                {isEditing && suggestedDomains.length > 0 && domainStatus !== "available" && (
                    <div className="flex flex-wrap gap-2 pt-2">
                    {suggestedDomains.map((u) => (
                        <button
                        key={u}
                        type="button"
                        onClick={() => handleUseSuggestedUsername(u)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full"
                        >
                        {u}
                        </button>
                    ))}
                    </div>
                )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                <div className="flex gap-3 pt-4">
                    <Button
                    onClick={handleSave}
                    disabled={
                        isSaving ||
                        isCheckingDomain ||
                        (domainStatus !== null && domainStatus !== "available")
                    }
                    className="flex-1 bg-blue-600 text-white hover:opacity-90"
                    >
                    {isSaving ? (
                        <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving...
                        </>
                    ) : (
                        <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                        </>
                    )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                    </Button>
                </div>
                )}
            </CardContent>
            </Card>
        </div>
        </div>
    );
}
