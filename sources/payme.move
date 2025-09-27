/// Aptos PayMe: On-chain payment requests for real-world P2P transactions.
///
/// This module enables users to create shareable, time-bound payment requests
/// denominated in any fungible asset on Aptos. Requests are fulfilled via direct
/// token transfers, with no escrow or custody — ensuring simplicity, security,
/// and low fees. Ideal for splitting bills, collecting payments, or invoicing.
///
/// Key features:
/// - One-click payment via shareable links (off-chain UX)
/// - Automatic expiry for stale requests
/// - Full auditability via on-chain events
/// - Support for cancellation before payment
module aptos_payme::payme {
    use std::error;
    use std::option;
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::fungible_asset::{Metadata};

    // =============
    // Error Codes
    // =============

    const EEXPIRED: u64 = 1;
    const EALREADY_PAID: u64 = 2;
    const EINVALID_AMOUNT: u64 = 3;
    const ENOT_PAYEE: u64 = 4;
    const ETRANSFER_FAILED: u64 = 5;
    const EINVALID_DURATION: u64 = 6;

    // =============
    // Constants (for optional NFT-like UX)
    // =============

    const PAYMENT_COLLECTION_NAME: vector<u8> = b"APTOS_PAYME_COLLECTION";
    const PAYMENT_COLLECTION_DESCRIPTION: vector<u8> = b"Aptos PayMe request collection";
    const PAYMENT_COLLECTION_URI: vector<u8> = b"https://aptospay.me  ";
    const PAYMENT_SEED_PREFIX: vector<u8> = b"PAYMENT_REQUEST_SEED";

    // =============
    // On-Chain Data Structures
    // =============

    /// Represents a single payment request.
    /// Stored as an object owned by the payee until fulfilled or cancelled.
    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct PaymentRequest has key, drop {
        payee: address,
        token: Object<Metadata>,
        amount: u64,
        memo: String,
        created_at: u64,
        expires_at: u64,
        paid: bool,
        payer: option::Option<address>  // Address of the payer (if paid)
    }

    // =============
    // Events (for off-chain indexing)
    // =============

    /// Emitted when a new payment request is created.
    /// Enables frontends/bots to generate shareable links like `payme.apt/r/<object_id>`.
    #[event]
    struct PaymentRequestCreated has drop, store {
        request: Object<PaymentRequest>
    }

    /// Emitted when a request is successfully paid.
    /// Used for notifications, analytics, and UI updates.
    #[event]
    struct PaymentPaid has drop, store {
        request: Object<PaymentRequest>,
        payer: address,
        amount: u64
    }

    /// Emitted when a request is cancelled by the payee.
    #[event]
    struct PaymentCancelled has drop, store {
        request: Object<PaymentRequest>,
        cancelled_by: address
    }

    // =============
    // Module Initialization (Optional)
    // =============

    /// Initializes module-level state (e.g., NFT collection for UX).
    /// Currently a no-op to avoid dependencies; can be extended later.
    fun init_module(_creator: &signer) {
        return;
    }

    // =============
    // Core Entry Functions
    // =============

    /// Creates a new payment request.
    ///
    /// The caller becomes the `payee`. The request is stored as an object
    /// and can be paid by anyone before it expires.
    ///
    /// Emits `PaymentRequestCreated` for off-chain discovery.
    entry public fun create_payment_request(
        payee_signer: &signer,
        token: Object<Metadata>,
        amount: u64,
        memo: String,
        expires_in_seconds: u64
    ) {
        assert!(amount > 0, error::invalid_argument(EINVALID_AMOUNT));
        assert!(expires_in_seconds > 0, error::invalid_argument(EINVALID_DURATION));

        let now = timestamp::now_seconds();
        let expires_at = now + expires_in_seconds;

        let request = PaymentRequest {
            payee: signer::address_of(payee_signer),
            token,
            amount,
            memo,
            created_at: now,
            expires_at,
            paid: false,
            payer: option::none()
        };

        // Generate a unique seed to ensure deterministic object address
        let seed = vector::empty<u8>();
        vector::append(&mut seed, PAYMENT_SEED_PREFIX);
        vector::append(&mut seed, b"::");
        vector::append(&mut seed, u64_to_bytes(now));

        let ctor_ref = object::create_named_object(payee_signer, seed);
        let request_signer = object::generate_signer(&ctor_ref);
        move_to(&request_signer, request);

        let created_object = object::object_from_constructor_ref<PaymentRequest>(&ctor_ref);
        event::emit(PaymentRequestCreated { request: created_object });
    }

    /// Fulfills a payment request.
    ///
    /// Transfers `amount` of `token` from the `payer` to the `payee`,
    /// marks the request as paid, and emits a `PaymentPaid` event.
    ///
    /// Fails if:
    /// - Request is already paid
    /// - Request has expired
    entry public fun pay_request(payer: &signer, request_obj: Object<PaymentRequest>) acquires PaymentRequest {
        let request_addr = object::object_address(&request_obj);
        let r = &mut PaymentRequest[request_addr];

        assert!(!r.paid, error::invalid_state(EALREADY_PAID));
        assert!(timestamp::now_seconds() <= r.expires_at, error::unavailable(EEXPIRED));

        primary_fungible_store::transfer(payer, r.token, r.payee, r.amount);

        r.paid = true;
        r.payer = option::some(signer::address_of(payer));

        let paid_obj = object::address_to_object(request_addr);
        event::emit(PaymentPaid {
            request: paid_obj,
            payer: signer::address_of(payer),
            amount: r.amount
        });
    }

    /// Cancels an unpaid payment request.
    ///
    /// Only the original `payee` may cancel. The request object is deleted
    /// from global storage, freeing resources.
    entry public fun cancel_request(payee: &signer, request_obj: Object<PaymentRequest>) acquires PaymentRequest {
        let request_addr = object::object_address(&request_obj);
        let r = &PaymentRequest[request_addr];

        assert!(signer::address_of(payee) == r.payee, error::permission_denied(ENOT_PAYEE));
        assert!(!r.paid, error::invalid_state(EALREADY_PAID));

        move_from<PaymentRequest>(request_addr);

        let cancelled_obj = object::address_to_object(request_addr);
        event::emit(PaymentCancelled {
            request: cancelled_obj,
            cancelled_by: signer::address_of(payee)
        });
    }

    // =============
    // View Functions (for frontend queries)
    // =============

    /// Reconstructs a `PaymentRequest` object from a seed.
    /// Primarily for debugging or deterministic address generation.
    #[view]
    public fun get_request_object(seed: vector<u8>): Object<PaymentRequest> {
        let request_address = object::create_object_address(&@aptos_payme, seed);
        object::address_to_object(request_address)
    }

    /// Returns the full state of a payment request.
    /// Used by frontends to display status, memo, payer, etc.
    #[view]
    public fun get_request(request_obj: Object<PaymentRequest>): PaymentRequest acquires PaymentRequest {
        let request_addr = object::object_address(&request_obj);
        let r = &PaymentRequest[request_addr];

        PaymentRequest {
            payee: r.payee,
            token: r.token,
            amount: r.amount,
            memo: r.memo,
            created_at: r.created_at,
            expires_at: r.expires_at,
            paid: r.paid,
            payer: r.payer
        }
    }

    // =============
    // Helper Functions
    // =============

    /// Converts a u64 to its ASCII decimal representation as `vector<u8>`.
    /// Used to ensure unique seeds when creating payment request objects.
    fun u64_to_bytes(n: u64): vector<u8> {
        if (n == 0) {
            return vector[48u8]; // '0'
        };

        let rev = vector[];
        let tmp = n;
        while (tmp > 0) {
            let digit = (tmp % 10) as u8;
            vector::push_back(&mut rev, 48u8 + digit);
            tmp = tmp / 10;
        }

        let parts = vector[];
        let i = rev.length() as u64;
        while (i > 0) {
            i = i - 1;
            vector::push_back(&mut parts, *rev.borrow(i));
        }
        parts
    }

    // =============
    // Unit Tests
    // =============

    /// End-to-end test: payee creates request → payer fulfills it.
    #[test(aptos_framework = @std, payee = @aptos_payme, payer = @0x1234)]
    fun test_payment_happy_path(aptos_framework: &signer, payee: &signer, payer: &signer) acquires PaymentRequest {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test_secs(1000);

        // Create and mint test stablecoin
        let ctor_ref = object::create_sticky_object(signer::address_of(payee));
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &ctor_ref,
            option::none(),
            string::utf8(b"USDt"),
            string::utf8(b"USDT"),
            0,
            string::utf8(b"icon"),
            string::utf8(b"proj")
        );
        let metadata = object::object_from_constructor_ref<Metadata>(&ctor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(&ctor_ref);

        let payer_store = primary_fungible_store::ensure_primary_store_exists(signer::address_of(payer), metadata);
        fungible_asset::mint_to(&mint_ref, payer_store, 100);

        // Create and pay request
        let memo = string::utf8(b"for coffee");
        create_payment_request(payee, metadata, 25, memo, 600);

        let req = event::emitted_events<PaymentRequestCreated>().borrow(0).request;
        pay_request(payer, req);

        // Validate state
        assert!(primary_fungible_store::balance(signer::address_of(payer), metadata) == 75, 1);
        let pr = get_request(req);
        assert!(pr.paid, 1);
        assert!(option::is_some(&pr.payer), 1);
    }
}