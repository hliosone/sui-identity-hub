// /api/did/resolve/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const user_address = searchParams.get("didresolve");

    if (!user_address) {
        return new Response(JSON.stringify({ error: "Missing did-object param" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getOwnedObjects",
        params: [
            user_address,
            {
                filter: {
                    Package:
                        process.env.DID_PACKAGE_OBJECT_ID || "<DID_PACKAGE_OBJECT_ID>",
                },
                options: { showType: true },
            },
            null,
            10,
        ],
    };

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

        const ownedResult = await response.json();

        const firstId: string | undefined =
            ownedResult?.result?.data?.[0]?.data?.objectId;

        if (!firstId) {
            return new Response(
                JSON.stringify({ message: "No objectId found for that owner/package." }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }

        const getObjectBody = {
            jsonrpc: "2.0",
            id: 1,
            method: "sui_getObject",
            params: [firstId, { showType: true, showContent: true }],
        };

        const response2 = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getObjectBody),
        });

        if (!response2.ok) {
            const text = await response2.text();
            return new Response(
                JSON.stringify({ error: `RPC error (getObject): ${text}` }),
                { status: response2.status, headers: { "Content-Type": "application/json" } },
            );
        }

        const objectResult = await response2.json();

        const content = objectResult?.result?.data?.content;
        if (!content || content.dataType !== "moveObject") {
            return new Response(
                JSON.stringify({ error: "Object content is not a Move object" }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }

        const fields = content.fields ?? {};

        const flatId =
            fields?.id && typeof fields.id === "object" ? fields.id.id : fields.id;

        const { id: _omitNestedId, ...rest } = fields as Record<string, any>;
        const flattened = { ...rest, id: flatId };

        return new Response(JSON.stringify(flattened, null, 2), {
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
