import { NextResponse } from "next/server";
import { Tusky } from "@tusky-io/ts-sdk";

// Initialize Tusky client
const tusky = new Tusky({ apiKey: process.env.TUSKY_API_KEY! });
// Replace with your actual vaultId
const VAULT_ID = process.env.TUSKY_VAULT_ID!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileContent, fileName } = body;

        if (!fileContent || !fileName) {
        return NextResponse.json(
            { error: "fileContent and fileName are required" },
            { status: 400 }
        );
        }

        // Convert file content to a Blob
        const blob = new Blob([fileContent], { type: "text/plain" });

        // Upload the file to Tusky
        const uploadId = await tusky.file.upload(VAULT_ID, blob, {
        name: fileName,
        mimeType: "text/plain",
        });

        // Retrieve file metadata
        const fileMetadata = await tusky.file.get(uploadId);

        // retrieve file ID
        return NextResponse.json({
        fileId: fileMetadata.id,
        fileName: fileMetadata.name,
        uploadId: uploadId,
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
