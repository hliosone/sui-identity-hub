import { useState, useCallback } from "react";

interface UploadResult {
    fileId: string;
    fileName: string;
    uploadId: string;
    status: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    mimeType: string;
    vaultId: string;
    blobId: string;
    quiltId: string;
    blobObjectId: string;
    ref: string | null;
    network: string;
    storedEpoch: number;
}

export function useTuskyUpload() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<UploadResult | null>(null);

    const uploadFile = useCallback(async (file: File, fileName: string) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
        // ✅ Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // ✅ Call Next.js API route
        const res = await fetch("/api/tusky/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            fileContent: base64,
            fileName: fileName,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
        }

        const json = await res.json();
        setData(json);
        return json as UploadResult;
        } catch (err: any) {
        setError(err.message || "Something went wrong");
        throw err;
        } finally {
        setLoading(false);
        }
    }, []);

    return { uploadFile, loading, error, data };
}
