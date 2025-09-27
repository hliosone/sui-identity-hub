// /api/sns/resolve/route.ts

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
        return new Response(JSON.stringify({ error: "Missing domain param" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_resolveNameServiceAddress",
        params: [domain],
    };

    // Replace with your Sui node's JSON-RPC endpoint
    const endpoint = "https://fullnode.testnet.sui.io:443";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();
            return new Response(JSON.stringify({ error: `RPC error: ${text}` }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            const text = await response.text();
            return new Response(
                JSON.stringify({
                    error: "Failed to parse JSON",
                    rawResponse: text,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
