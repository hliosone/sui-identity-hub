import { Header } from "@/components/Header";
import { TradingDemo } from "@/components/TradingView";

export default function DemoPage() {
    const userCredentials = [
        {
            id: 'cred1',
            name: 'KYC Level 1',
            issuer: 'Trusted KYC Provider',
            credentialSubject: { kyc: 'level1' },
            status: 'active',
            type: 'KYC',
            issuanceDate: new Date().toISOString(),
            subject: '0xdaf9b523e60ab5a8c42c566c0c5a743e6a654e657a39801dced6cae88be4e0ab',
            proof: { type: 'ProofType', created: new Date().toISOString(), proofPurpose: 'assertionMethod', verificationMethod: 'method1', jws: 'signature1', signature: 'signature1' },
        },
        {
            id: 'cred2',
            name: 'Accredited Investor',
            issuer: 'Securities Regulator',
            credentialSubject: { accreditedInvestor: true },
            status: 'active',
            type: 'AccreditedInvestor',
            issuanceDate: new Date().toISOString(),
            subject: '0xdaf9b523e60ab5a8c42c566c0c5a743e6a654e657a39801dced6cae88be4e0ab',
            proof: { type: 'ProofType', created: new Date().toISOString(), proofPurpose: 'assertionMethod', verificationMethod: 'method2', jws: 'signature2', signature: 'signature2' },
        },
    ];
    return (
        <>
            <Header />
            <TradingDemo userCredentials={userCredentials} />
        </>
    );
}
