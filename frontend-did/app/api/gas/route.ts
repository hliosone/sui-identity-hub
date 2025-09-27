import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { NextRequest, NextResponse } from "next/server";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";

// Connect to Sui testnet
const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export async function POST(request: NextRequest) {
    try {
        // Extract transaction data and sender address from request
        const body = await request.json();
        const { tx, senderAddress } = body;

        // Validate required parameters
        if (!tx || !senderAddress) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
        }

        // Get the fee payer's private key from environment variables
        const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY;
        if (!feePayerPrivateKey) {
        console.error("FEE_PAYER_PRIVATE_KEY not set in environment variables");
        return NextResponse.json(
            { error: "Sponsor wallet not configured" },
            { status: 500 }
        );
        }

        // Create the fee payer keypair from the private key
        // This supports different key formats (ED25519, Secp256r1, Secp256k1)
        let feePayerKeypair;
        try {
        const { scheme, secretKey } = decodeSuiPrivateKey(feePayerPrivateKey);

        switch (scheme) {
            case "ED25519":
            feePayerKeypair = Ed25519Keypair.fromSecretKey(secretKey);
            break;
            case "Secp256r1":
            feePayerKeypair = Secp256r1Keypair.fromSecretKey(secretKey);
            break;
            case "Secp256k1":
            feePayerKeypair = Secp256k1Keypair.fromSecretKey(secretKey);
            break;
            default:
            throw new Error(`Unsupported key pair scheme: ${scheme}`);
        }
        } catch (keyError) {
        console.error("Error processing private key:", keyError);
        return NextResponse.json(
            { error: "Invalid sponsor private key format" },
            { status: 500 }
        );
        }

        // Get the fee payer's address from the keypair
        const feePayerAddress = feePayerKeypair.getPublicKey().toSuiAddress();

        // Check if the fee payer has SUI coins to pay for gas
        const sponsorCoins = await client.getCoins({
        owner: feePayerAddress,
        coinType: "0x2::sui::SUI",
        });

        if (sponsorCoins.data.length === 0) {
        return NextResponse.json(
            { error: "Sponsor has no SUI coins for gas payment" },
            { status: 500 }
        );
        }

        // Prepare the gas payment using the first available SUI coin
        const payment = sponsorCoins.data.slice(0, 1).map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
        }));

        // Convert the transaction bytes and create a sponsored transaction
        const txBytes =
        tx instanceof Uint8Array ? tx : new Uint8Array(Object.values(tx));
        const sponsoredTx = Transaction.fromKind(txBytes);

        // Set up the sponsored transaction:
        // - sender: the user who initiated the transaction
        // - gasOwner: the fee payer who will pay for gas
        // - gasPayment: the SUI coins that will be used for gas
        sponsoredTx.setSender(senderAddress);
        sponsoredTx.setGasOwner(feePayerAddress);
        sponsoredTx.setGasPayment(payment);

        // Build the complete transaction with gas estimation
        const builtTx = await sponsoredTx.build({ client: client as any });

        // Sign the transaction with the fee payer's key
        const signedTx = await feePayerKeypair.signTransaction(builtTx);

        // Return the sponsored transaction data to the frontend
        return NextResponse.json({
        sponsoredBytes: builtTx,
        sponsorSignature: signedTx.signature,
        feePayerAddress,
        });
    } catch (error) {
        console.error("Error creating sponsored transaction:", error);
        return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
        );
    }
}