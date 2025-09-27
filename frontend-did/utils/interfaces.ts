export interface DIDObject {
    id: string;
    subject: string;
    publicKey: string;
    created: string;
    updated: string;
    metadata: {
        nickname?: string;
        suiNameServiceDomain?: string;
    };
}