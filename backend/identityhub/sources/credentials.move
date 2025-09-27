/*
/// Module: identityhub
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module identityhub::credentials {
    use sui::package::{Self}; //use publisher later ?
    use sui::table::{Self, Table};
    use std::string::String;
    use std::string;
    use std::vector; 
    use sui::clock::Clock;
    use sui::address;

    //think about errors names come on x)
    const ECredentialError: u64 = 0;

    public struct Credential has key, store {
        id: UID,
        issuer_did: String,
        subject_did: String,
        ctype: vector<String>,
        scope: Table<String,String>,
        revoked: bool,
        issued_at: u64,
        expires_at: u64,
        version: u64,
        schema: option::Option<String>,
        vc_cid: option::Option<String>,
        vc_hash: String,
    }

    public fun create(_issuer_did: String, _subject_did: String, _ctype: vector<String>,
    scope: vector<String, String>, _expires_at: u64, schema: option::Option<String>, _vc_cid: option::Option<String>,
    _vc_hash: String, clock: &Clock, ctx: &mut TxContext) : Credential {

        let mut scope_table = Table::new<String,String>(ctx);

        let credential = Credential { 
            id: object::new(ctx),
            issuer_did: _issuer_did,
            subject_did: _subject_did,
            ctype: _ctype,
            scope: scope_table,
            revoked: false,
            issued_at: clock.timestamp_ms(),
            expires_at: _expires_at,
            version: 1,
            schema: schema,
            vc_cid: _vc_cid,
            vc_hash: _vc_hash,
        };
        
        did_object
    }

    public fun add_scopes(table: &mut Table<String, String>, scopes: vector<(String, String)>) {
        let len = vector::length(&scopes);
        let mut i = 0;
        while (i < len) {
            let (key, value) = *vector::borrow(&scopes, i);
            Table::insert(table, key, value);
            i = i + 1;
        }
    }

}



