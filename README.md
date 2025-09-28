# 🌊 Sui Identity Hub
The Missing Digital Identity Layer for Web3

Sui Identity Hub is building the missing digital identity piece for the Sui platform.

To date, Sui only works with accounts. Not even Sui Name Service, which boasts the slogan "own your identity", is technically anything more than an account alias no true identity. This is exactly the problem that we are solving by bringing Decentralized Identifiers (DIDs) natively to Sui, being fully W3C DID standard compliant.

With did:sui, individuals now have a native on-chain identity that is interoperable between services. Credentials can be issued, stored, and verified natively on-chain, but with off-chain representations for enhanced interoperability.

This approach unlocks several key features:

Authentic identity ownership: Users' DIDs are decoupled from accounts, so identity can be recovered even if a wallet is lost due to DID controllers.
Credential binding: Verifiable Credentials (VCs) are directly bound to DID objects, enabling KYC, access control, and other trust models.
Service interoperability: Institutions are now able to deploy compliant on-chain services without needing users themselves to handle compliance. Institutions can issue and authenticate credentials against the DID method.
Asset recovery: Assets (ex:in a vault) can be linked to a DID rather than a single account. Even if the initial account is lost, the DID owner can recover from another wallet.
In short, Sui Identity Hub bridges the gap between Sui accounts and actual identities. It is the foundation for compliant, interoperable, and user-owned digital identity making it possible for both individuals and institutions to build real-world use cases on-chain.

