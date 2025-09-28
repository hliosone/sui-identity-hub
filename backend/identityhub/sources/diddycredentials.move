/*
/// Module: identityhub
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module identityhub::diddycredentials {
    use sui::package::{Self}; //use publisher later ?
    use identityhub::superdiddy::{Self, DID};
    use sui::table::{Self, Table};
    use std::string::String;
    use std::string;
    use std::vector; 
    use sui::clock::Clock;
    use sui::address;

    //think about errors names come on x)
    const ECredentialError: u64 = 0;

    public struct ClaimPool has key, store {
        id: UID,
        pool: Table<String, vector<Credential>>,
    }

    fun init(ctx: &mut TxContext) {
        let claim_pool = ClaimPool {
            id: object::new(ctx),
            pool: table::new(ctx),
        };
        transfer::share_object(claim_pool);
    }

    public struct Credential has key, store {
        id: UID,
        issuer_did: String,
        subject_did: String,
        ctype: vector<String>,
        //scope: Table<String,String>,
        revoked: bool,
        issued_at: u64,
        expires_at: u64,
        version: u64,
        schema: String,
        vc_cid: String,
        vc_hash: String,
    }

    // change it later to get the didobject.did field but it says drop ability ?
    public fun create(claim_pool: &mut ClaimPool, _issuer_did: String, _subject_did: String, _subject_address: address, _ctype: vector<String>,
     _expires_at: u64, schema: String, _vc_cid: String,
    _vc_hash: String, clock: &Clock, ctx: &mut TxContext) {

        //let mut scope_table = Table::new<String,String>(ctx);

        let credential = Credential { 
            id: object::new(ctx),
            issuer_did: _issuer_did,
            subject_did: _subject_did,
            ctype: _ctype,
            //scope: scope_table,
            revoked: false,
            issued_at: clock.timestamp_ms(),
            expires_at: _expires_at,
            version: 1,
            schema: schema,
            vc_cid: _vc_cid,
            vc_hash: _vc_hash,
        };
        
        let mut creds_mut = creds;
        vector::push_back(&mut creds_mut, credential);
        table::add(&mut claim_pool.pool, _subject_did, creds_mut);
    }

    // public fun get_credentials_by_subject(claim_pool: &mut ClaimPool, subject_did: String): vector<Credential> {
    //     if (table::contains(&claim_pool.pool, subject_did)) {
    //         let new_vector : vector<Credential> = table::remove(&mut claim_pool.pool, subject_did);
    //         return new_vector;
    //     } else {
    //         let new_vector = vector::empty<Credential>();
    //         return new_vector;
    //     }
    // }
    public fun get_credentials_by_subject(
        claim_pool: &mut ClaimPool, 
        subject_did: String, 
        subject_address: address
    ) {
        if (table::contains(&claim_pool.pool, subject_did)) {
            let mut creds: vector<Credential> = table::remove(&mut claim_pool.pool, subject_did);
            let len = vector::length(&creds);
            let mut i = 0;
            while (i < len) {
                // Always remove from the back for efficiency
                let cred = vector::pop_back(&mut creds);
                transfer::public_transfer(cred, subject_address);
                i = i + 1;
            }
        }
    }

    public fun second_get_credentials_by_subject(claim_pool: &mut ClaimPool, subject_did: String): vector<Credential> {
        if (table::contains(&claim_pool.pool, subject_did)) {
            table::remove(&mut claim_pool.pool, subject_did)
        } else {
            vector::empty<Credential>()
        }
    }
}
