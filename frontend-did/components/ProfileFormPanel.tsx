"use client";

import { useDynamicContext, useUserUpdateRequest } from "@dynamic-labs/sdk-react-core";
import { Label } from "./ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { Edit, Save, ArrowLeft, Waves } from "lucide-react";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DIDInformation } from "./DIDInformations";
import { SNSLogo } from "./icons/SNSLogo";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";

// Split into separate component for Profile Form
function ProfileFormPanel() {
    const { user, primaryWallet } = useDynamicContext();
    const { updateUser } = useUserUpdateRequest();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainStatus, setDomainStatus] = useState<"available" | "taken" | "invalid" | null>(null);
    const [suggestedDomains, setSuggestedDomains] = useState<string[]>([]);
    const [snsDomains, setSnsDomains] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        nickname: user?.username || "",
        suiNameServiceDomain: "",
    });

    const formatSnsDisplay = (domain: string) => {
        if (!domain) return "";
        return `@${domain.replace(/\.sui$/i, "")}`;
    };

    // --- Format username ---
    const formatUsername = (input: string) => input.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // --- Check availability (dummy for now) ---
    const checkUsernameAvailability = async (username: string): Promise<"available" | "taken" | "invalid"> => {
        await new Promise((r) => setTimeout(r, 800));
        if (!username || username.length < 3 || username.length > 20 || !/^[a-z0-9_-]+$/i.test(username))
            return "invalid";
        const taken = ["john", "admin", "test", "user", "demo", "sui"];
        return taken.includes(username.toLowerCase()) ? "taken" : "available";
    };

    const generateUsernameSuggestions = (nickname: string): string[] => {
        if (!nickname) return [];
        const clean = nickname.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        return [`${clean}`, `${clean}${Math.floor(Math.random() * 100)}`, `sui_${clean}`];
    };

    const handleUseSuggestedUsername = (username: string) => {
        setFormData((prev) => ({ ...prev, suiNameServiceDomain: username }));
    };

    // --- Suggest usernames ---
    useEffect(() => {
        if (formData.nickname && isEditing) {
            const suggestions = generateUsernameSuggestions(formData.nickname);
            setSuggestedDomains(suggestions);
            if (!formData.suiNameServiceDomain && suggestions.length > 0) {
                setFormData((prev) => ({ ...prev, suiNameServiceDomain: suggestions[0] }));
            }
        }
    }, [formData.nickname, isEditing]);

    // --- Check username availability ---
    useEffect(() => {
        const checkUsername = async () => {
            if (formData.suiNameServiceDomain && isEditing && snsDomains.length === 0) {
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
    }, [formData.suiNameServiceDomain, isEditing, snsDomains]);

    // --- Fetch SNS domains ---
    useEffect(() => {
        const fetchSnsDomains = async () => {
            if (!primaryWallet) return;
            try {
                const res = await fetch(`/api/sns/lookup?address=${primaryWallet.address}`);
                const data = await res.json();
                if (data?.result?.data) {
                    setSnsDomains(data.result.data);
                    if (!formData.suiNameServiceDomain && data.result.data.length > 0) {
                        setFormData((prev) => ({ ...prev, suiNameServiceDomain: data.result.data[0] }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch SNS domains:", err);
            }
        };
        fetchSnsDomains();
    }, [primaryWallet]);

    // --- Save username ---
    const handleSave = async () => {
        if (domainStatus === "taken") {
            alert("Please choose an available username before saving.");
            return;
        }
        if (domainStatus === "invalid") {
            alert("Please enter a valid username (3–20 letters, numbers, _ or -).");
            return;
        }
        if (!primaryWallet) {
            alert("Please connect a primary wallet first.");
            return;
        }

        if (!formData.nickname) {
            console.log("Nickname cannot be empty.");
            return;
        }

        setIsSaving(true);
        try {
            await updateUser({
                username: formData.nickname,
            });
            setIsEditing(false);
            router.refresh();
        } catch (err) {
            console.error("Dynamic update failed:", err);
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

    return (
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

                {/* Username / SNS DID */}
                <div className="space-y-2">
                    <Label htmlFor="suiNameServiceDomain">
                        <SNSLogo size={16} /> Sui Name Service Domain
                        <Badge variant="secondary" className="text-xs ml-2">Optional</Badge>
                    </Label>

                    {snsDomains.length > 0 ? (
                        <Select
                            value={formData.suiNameServiceDomain}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, suiNameServiceDomain: value }))
                            }
                            disabled={!isEditing}
                        >
                            <SelectTrigger className="w-full border rounded px-2 py-1" />
                            <SelectContent className="text-black">
                                {snsDomains.map((domain) => (
                                    <SelectItem key={domain} value={domain} className="text-black">
                                        {formatSnsDisplay(domain)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id="suiNameServiceDomain"
                            value={formData.suiNameServiceDomain}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, suiNameServiceDomain: e.target.value }))
                            }
                            disabled={!isEditing}
                            placeholder="yourname"
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
                    )}

                    {domainStatus && snsDomains.length === 0 && (
                        <p
                            className={`text-xs ${domainStatus === "available"
                                ? "text-green-600"
                                : domainStatus === "taken"
                                    ? "text-red-600"
                                    : "text-orange-600"
                                }`}
                        >
                            {domainStatus === "available" && "Username is available!"}
                            {domainStatus === "taken" && "Username is already taken"}
                            {domainStatus === "invalid" &&
                                "Invalid username format (3–20 letters, numbers, _ or -)"}
                        </p>
                    )}

                    {isEditing && suggestedDomains.length > 0 && domainStatus !== "available" && snsDomains.length === 0 && (
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
    );
}

// Main DIDManagement component
export function DIDManagement() {
    const router = useRouter();
    const { primaryWallet } = useDynamicContext();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {primaryWallet && (
                        <Button variant="ghost" onClick={() => router.back()} className="sui-border hover:sui-bg-light">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </Button>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 sui-gradient rounded-lg">
                                <Waves className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                {primaryWallet ? "SUI DiD Passport" : "Create SUI DiD"}
                            </span>
                        </h1>
                        <p className="text-slate-600 mt-2 text-sm md:text-base">
                            {primaryWallet
                                ? "Your official decentralized identity passport on Sui Network"
                                : "Create your decentralized identity passport to get started on Sui Network"}
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - DID Information */}
                    <div className="order-2 lg:order-1">
                        <DIDInformation />
                    </div>

                    {/* Right Column - Profile Form */}
                    <div className="order-1 lg:order-2">
                        <ProfileFormPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}