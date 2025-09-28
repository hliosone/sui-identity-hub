/*
/// Module: identityhub
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module identityhub::diddycredentials {
    use identityhub::types::{Self, DID};
    use std::string::String;
    use sui::clock::Clock;

    public fun issue_and_transfer_credential(
    issuer_did: &DID,
    subject_did: String,
    subject_address: address,
    ctype: vector<String>,
    scopes: vector<String>,
    scopes_values: vector<String>,
    expires_at: u64,
    schema: String,
    vc_cid: String,
    vc_hash: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let credential = types::new_credential(
        issuer_did,
        subject_did,
        subject_address,
        ctype,
        scopes,
        scopes_values,
        expires_at,
        schema,
        vc_cid,
        vc_hash,
        clock,
        ctx
    );
    transfer::public_transfer(credential, subject_address);
}

}
