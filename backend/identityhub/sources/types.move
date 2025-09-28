module identityhub::types {
    use sui::package::{Self}; 
    use std::string::String;
    use std::string;
    use sui::clock::Clock;
    use sui::address;
    //use suins::suins_registration::SuinsRegistration;
    use sui::table::{Self, Table};

    const EDIDError: u64 = 0;
    const EDIDRevoked: u64 = 1;
    const EDIDAlreadyRevoked: u64 = 2;
    const EDIDAlreadyActive: u64 = 3;
    const EDIDNoController: u64 = 4;
    const EDIDNoAController: u64 = 5;
    const ECredentialError: u64 = 6;

    public struct Registry has key, store {
        id: UID,
        pool: Table<address,String>,
    }

    fun init(ctx: &mut TxContext) {
        let did_registry = Registry {
            id: object::new(ctx),
            pool: table::new(ctx),
        };
        transfer::share_object(did_registry);
    }

    public struct DID has key {
        id: UID,
        did: String,
        subject_address: address,
        // authentication_methods: vector<AuthenticationMethod>,
        controllers: vector<address>, // NEED AT LEAST 1 Controller at creation
        // service_endpoints: vector<ServiceEndpoint>, 
        cid: String, // function done to update
        version: u64,
        created_at: u64,
        updated_at: u64,
        revoked: bool, // functions done to revoke/reactivate
        credentials: vector<Credential>,
    }

        public fun create(did_registry: &mut Registry, _controllers: vector<address>, _cid: String, clock: &Clock, ctx: &mut TxContext) {

        // assert!(vector::length(&controllers_did) > 0, EDIDNoController);

            let mut didstring = string::utf8(b"did:sui:");
            let identifier : UID = object::new(ctx);
            let dididentifier: String = sui::address::to_string(sui::object::uid_to_address(&identifier));
            string::append(&mut didstring, dididentifier);

            let sender = ctx.sender();
            assert!(!table::contains(&did_registry.pool, sender), EDIDAlreadyActive);
            table::add(&mut did_registry.pool, sender, dididentifier);

            let did_object = DID { 
                id: identifier,
                did: didstring,
                subject_address: ctx.sender(),
                controllers: _controllers,
                cid: _cid,
                version: 1,
                created_at: clock.timestamp_ms(),
                updated_at: clock.timestamp_ms(),
                revoked: false,
                credentials: vector::empty<Credential>(),
                //sui_nameservices: vector::empty<SuinsRegistration>(),
            };

        transfer::share_object(did_object);
    }

    public fun get_did_string(did_registry: &mut Registry, addr: address): String {
        if (table::contains(&did_registry.pool, addr)) {
            *table::borrow(&did_registry.pool, addr)
        } else {
            string::utf8(b"")
        }
    }


    // public fun add_sui_nameservice(did: &mut DID, new_service: SuinsRegistration, clock: &Clock) {
    //     assert!(!did.revoked, EDIDRevoked);
    //     vector::push_back(&mut did.sui_nameservices, new_service);
    //     did.version = did.version + 1;
    //     did.updated_at = clock.timestamp_ms();
    // }

    public fun add_controller(did: &mut DID, new_controller: address, clock: &Clock) {
         assert!(!did.revoked, EDIDRevoked);
         vector::push_back(&mut did.controllers, new_controller);
         did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }

    public fun remove_controller(did: &mut DID, controller_to_remove: address, clock: &Clock) {
        assert!(!did.revoked, EDIDRevoked);

        let len = vector::length(&did.controllers);
        let mut found = false;
        let mut i = 0;

        while (i < len) {
            if (vector::borrow(&did.controllers, i) == &controller_to_remove) {
                vector::swap_remove(&mut did.controllers, i);
                found = true;
                break;
            };
            i = i + 1;
        };

        assert!(found, EDIDNoController);
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }

    public entry fun transfer_did(did: &mut DID, new_owner: address, clock: &Clock, ctx: &TxContext) {
        assert_is_controller(did, ctx); 
        // assert(!table::contains(&did_registry.pool, did.subject_address), EDIDAlreadyActive);
        // table::remove(&mut claim_pool.pool, did.subject_address);
        // let dididentifier: String = sui::address::to_string(sui::object::uid_to_address(did.id));
        // table::add(&mut did_registry.pool, new_owner, dididentifier);
        did.subject_address = new_owner;
        did.version = did.version + 1;
        did.updated_at = clock.timestamp_ms();
    }

        // Helper function to check if the sender is a controller of a DID
    public entry fun assert_is_controller(did: &mut DID, ctx: &TxContext) {
        let sender = ctx.sender();
        if (did.subject_address != sender) {
        let mut is_controller = false;
        let len = vector::length(&did.controllers);
        let mut i = 0;
        while (i < len) {
            if (*vector::borrow(&did.controllers, i) == sender) {
                is_controller = true;
                break;
            };
            i = i + 1;
        };
        assert!(is_controller, EDIDNoAController);
        }
    }

    /// Assert that the caller (TxContext sender) is the subject of the DID
    public fun assert_is_subject(did: &DID, ctx: &TxContext) {
        let sender = ctx.sender();
        assert!(sender == did.subject_address, 0); // Replace 0 with your error code, e.g., EDIDNotSubject
    }

    public fun get_did(did_obj: &DID): String {
        did_obj.did
    }

    public fun get_subject_address(did_obj: &DID): address {
        did_obj.subject_address
    }

    public fun set_updated_at(did_obj: &mut DID, clock: &Clock) {
        did_obj.updated_at = clock.timestamp_ms();
    }

    public fun get_revoked(did_obj: &DID): bool {
        did_obj.revoked
    }

    public fun set_status(did_obj: &mut DID, status: bool, clock: &Clock) {
        did_obj.revoked = status;
        did_obj.version = did_obj.version + 1;
        did_obj.updated_at = clock.timestamp_ms();
    }

    // CREEEEEEEEEEEEEEEEEEEEEEEEDENTIAAAAAAAAAAAAAAAAAAAAAAAAAAAALS


    public struct Credential has key, store {
        id: UID,
        issuer_did: String,
        subject_did: String,
        ctype: vector<String>,
        scopes: vector<String>,
        scopes_values: vector<String>,
        revoked: bool,
        issued_at: u64,
        expires_at: u64,
        version: u64,
        schema: String,
        vc_cid: String,
        vc_hash: String,
    }

        public fun new_credential(
        _issuer_did: &DID,
        _subject_did: String,
        _subject_address: address,
        _ctype: vector<String>,
        _scopes: vector<String>,
        _scopes_values: vector<String>,
        _expires_at: u64,
        _schema: String,
        _vc_cid: String,
        _vc_hash: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) : Credential {

        assert!(_scopes.length() == _scopes_values.length(), ECredentialError);

        Credential {
            id: object::new(ctx),
            issuer_did: get_did(_issuer_did),
            subject_did: _subject_did,
            ctype: _ctype,
            scopes: _scopes,
            scopes_values: _scopes_values,
            revoked: false,
            issued_at: clock.timestamp_ms(),
            expires_at: _expires_at,
            version: 1,
            schema: _schema,
            vc_cid: _vc_cid,
            vc_hash: _vc_hash,
        }
    }



}