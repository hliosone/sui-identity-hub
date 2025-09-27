/*
/// Module: identityhub
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module identityhub::did {
    use sui::package::{Self}; //use publisher later ?
    use std::string::String;
    use std::string;
    use std::vector; 
    use sui::clock::Clock;
    use sui::address;

    //think about errors names come on x)
    const EDIDError: u64 = 0;
    const EDIDRevoked: u64 = 1;
    const EDIDAlreadyRevoked: u64 = 2;
    const EDIDAlreadyActive: u64 = 3;
    const EDIDNoController: u64 = 4;

	const DAY_MS: u64 = 86_400_000;

    public struct ServiceEndpoint has store {
        id: String,
        stype: String,
        serviceEndpoint: String
    }

    public struct AuthenticationMethod has store {
        id: String,
        atype: String,
        controller: address,
        publicKeyMultibase: String
    }

    public struct DID has key {
        id: UID,
        did: String,
        subject_address: address,
        authentication_methods: vector<AuthenticationMethod>,
        controllers: vector<address>, // NEED AT LEAST 1 Controller at creation
        service_endpoints: vector<ServiceEndpoint>, 
        cid: option::Option<String>, // function done to update
        version: u64,
        created_at: u64,
        updated_at: u64,
        revoked: bool, // functions done to revoke/reactivate
        // credentials (DynamicFieldTable) (on-chain attached credentials using DynamicFieldTable)
    }

    public fun create(auth_methods: vector<AuthenticationMethod>, controllers_did: vector<address>, endpoints: vector<ServiceEndpoint>,  
    _cid: option::Option<String>, clock: &Clock, ctx: &mut TxContext) : DID {

        assert!(vector::length(&controllers_did) > 0, EDIDNoController);

        let mut didstring = string::utf8(b"did:sui:");
        let identifier : UID = object::new(ctx);
        let address: address = sui::object::uid_to_address(&identifier);
        let dididentifier: String = sui::address::to_string(address);
        string::append(&mut didstring, dididentifier);

        let did_object = DID { 
            id: identifier,
            did: dididentifier,
            subject_address: ctx.sender(),
            authentication_methods: auth_methods,
            controllers: controllers_did,
            service_endpoints: endpoints,
            cid: _cid,
            version: 1,
            created_at: clock.timestamp_ms(),
            updated_at: clock.timestamp_ms(),
            revoked: false,
        };
        
        did_object
    }

    // Controllers

    public fun add_controller(did: &mut DID, new_controller: address, clock: &Clock) {
        assert!(!did.revoked, EDIDRevoked);
        vector::push_back(&mut did.controllers, new_controller);
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }


    // CID

    public fun update_cid(did: &mut DID, new_cid: String, clock: &Clock) {
        assert!(!did.revoked, EDIDRevoked);
        did.cid = option::some(new_cid);
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }


    // Revoke

    public fun revoke(did: &mut DID, clock: &Clock) {
        assert!(!did.revoked, EDIDAlreadyRevoked);
        did.revoked = true;
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }

    public fun reactivate(did: &mut DID, clock: &Clock) {
        assert!(did.revoked, EDIDAlreadyActive);
        did.revoked = false;
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }
}



