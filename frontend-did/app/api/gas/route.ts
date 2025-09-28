// app/api/gas/route.ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";
import { NextRequest, NextResponse } from "next/server";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export async function POST(req: NextRequest) {
    try {
        const { txBytes, senderAddress } = await req.json();

        if (!txBytes || !senderAddress) {
        return NextResponse.json({ error: "Missing txBytes or senderAddress" }, { status: 400 });
        }

        // Load sponsor keypair
        const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY!;
        const { scheme, secretKey } = decodeSuiPrivateKey(feePayerPrivateKey);

        const feePayerKeypair =
        scheme === "ED25519"
            ? Ed25519Keypair.fromSecretKey(secretKey)
            : scheme === "Secp256r1"
            ? Secp256r1Keypair.fromSecretKey(secretKey)
            : Secp256k1Keypair.fromSecretKey(secretKey);

        const feePayerAddress = feePayerKeypair.getPublicKey().toSuiAddress();

        // Check sponsor has coins
        const coins = await client.getCoins({ owner: feePayerAddress, coinType: "0x2::sui::SUI" });
        if (!coins.data.length) {
        return NextResponse.json({ error: "Sponsor has no SUI for gas" }, { status: 500 });
        }

        const payment = coins.data.slice(0, 1).map((c) => ({
        objectId: c.coinObjectId,
        version: c.version,
        digest: c.digest,
        }));

        // Rebuild transaction and sponsor
        const tx = Transaction.fromKind(new Uint8Array(Object.values(txBytes)));
        tx.setSender(senderAddress);
        tx.setGasOwner(feePayerAddress);
        tx.setGasPayment(payment);

        const built = await tx.build({ client: client as any });
        const signed = await feePayerKeypair.signTransaction(built);

        return NextResponse.json({
        sponsoredBytes: built,
        sponsorSignature: signed.signature,
        feePayerAddress,
        });
    } catch (err: any) {
        console.error("Gas tank error:", err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
