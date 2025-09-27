// This route resolves a DID (Decentralized Identifier) to its associated document.

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const did = searchParams.get("did");
    
    if (!did) {
        return new Response(JSON.stringify({ error: "Missing did param" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Simulated DID Document for demonstration purposes
    const didDocument = {
        "@context": "https://www.w3.org/ns/did/v1",
        id: did,
        verificationMethod: [
            {
                id: `${did}#keys-1`,
                type: "Ed25519VerificationKey2018",
                controller: did,
                publicKeyBase58: "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV",
            },
        ],
        authentication: [`${did}#keys-1`],
        assertionMethod: [`${did}#keys-1`],
    };
    
    return new Response(JSON.stringify(didDocument), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}