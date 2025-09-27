// ✅ Force Node.js runtime so Buffer is available
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Tusky } from "@tusky-io/ts-sdk";

// ✅ Initialize Tusky client
const tusky = new Tusky({
    apiKey: process.env.TUSKY_API_KEY!,
});

// ✅ Your Tusky Vault ID
const VAULT_ID = process.env.TUSKY_ID_VAULT!;

export async function POST(request: Request) {
    try {
        // ✅ Parse JSON body
        const { fileContent, fileName } = await request.json();

        // ✅ Validate input
        if (!fileContent || !fileName) {
        return NextResponse.json(
            { error: "fileContent and fileName are required" },
            { status: 400 }
        );
        }

        // ✅ Convert base64 string → Buffer → Blob
        const buffer = Buffer.from(fileContent, "base64");
        const blob = new Blob([buffer], { type: "text/plain" });

        // ✅ Upload file to Tusky
        const uploadId = await tusky.file.upload(VAULT_ID, blob, {
        name: fileName,
        mimeType: "text/plain",
        });

        // ✅ Retrieve file metadata
        const fileMetadata = await tusky.file.get(uploadId);

        // ✅ Return metadata to client
        return NextResponse.json({
        fileId: fileMetadata.id,
        fileName: fileMetadata.name,
        uploadId,
        status: fileMetadata.status,
        size: fileMetadata.size,
        createdAt: fileMetadata.createdAt,
        updatedAt: fileMetadata.updatedAt,
        mimeType: fileMetadata.mimeType,
        vaultId: fileMetadata.vaultId,
        blobId: fileMetadata.blobId,
        quiltId: fileMetadata.quiltId,
        blobObjectId: fileMetadata.blobObjectId,
        ref: fileMetadata.ref,
        network: fileMetadata.network,
        storedEpoch: fileMetadata.storedEpoch,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: 500 }
        );
    }
}
