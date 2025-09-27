// app/api/sns/lookup/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
        return new Response(JSON.stringify({ error: "Missing address param" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
        });
    }

    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_resolveNameServiceNames",
        params: [address],
    };

    // Replace with your Sui node's JSON-RPC endpoint
    const endpoint = "https://fullnode.testnet.sui.io:443";

    try {
        const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        });

        // If the node returns an error status, capture the text
        if (!response.ok) {
        const text = await response.text();
        return new Response(JSON.stringify({ error: `RPC error: ${text}` }), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
        }

        // Try parsing JSON safely
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
