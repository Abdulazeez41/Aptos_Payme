module test_token::test_token {

    use aptos_framework::fungible_asset;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    use std::option;
    use std::signer;
    use std::string;

    entry fun mint_test_token(owner: &signer) {
        let ctor_ref = object::create_sticky_object(signer::address_of(owner));

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &ctor_ref,
            option::none<u128>(),
            string::utf8(b"TestUSD"),
            string::utf8(b"TUSD"),
            6,
            string::utf8(b"https://example.com/icon.png"),
            string::utf8(b"https://example.com"),
        );

        // Mint 10,000 tokens (in base units: 10,000 * 10^6 = 10,000,000,000)
        let mint_ref = fungible_asset::generate_mint_ref(&ctor_ref);
        let owner_store = primary_fungible_store::ensure_primary_store_exists(
            signer::address_of(owner),
            object::object_from_constructor_ref<aptos_framework::fungible_asset::Metadata>(
                &ctor_ref,
            ),
        );
        fungible_asset::mint_to(&mint_ref, owner_store, 10000000000);

        // Also mint to another test account (e.g., payer)
        let payer = @0x29ca0533ee5dcfce17590e12173507a6da7492d3222ad814dac5e684023ac579;
        let payer_store = primary_fungible_store::ensure_primary_store_exists(
            payer,
            object::object_from_constructor_ref<aptos_framework::fungible_asset::Metadata>(
                &ctor_ref,
            ),
        );
        fungible_asset::mint_to(&mint_ref, payer_store, 10000000000);
    }

        entry public fun mint_test_token_with_payer(
        owner: &signer,
        payer: address
    ) {
        let ctor_ref = object::create_sticky_object(signer::address_of(owner));

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &ctor_ref,
            option::none<u128>(),
            string::utf8(b"TestUSD"),
            string::utf8(b"TUSD"),
            6,
            string::utf8(b"https://example.com/icon.png"),
            string::utf8(b"https://example.com")
        );

        let mint_ref = fungible_asset::generate_mint_ref(&ctor_ref);
        let metadata = object::object_from_constructor_ref<aptos_framework::fungible_asset::Metadata>(&ctor_ref);

        let owner_store = primary_fungible_store::ensure_primary_store_exists(signer::address_of(owner), metadata);
        fungible_asset::mint_to(&mint_ref, owner_store, 10000000000);

        let payer_store = primary_fungible_store::ensure_primary_store_exists(payer, metadata);
        fungible_asset::mint_to(&mint_ref, payer_store, 10000000000);
    }
}
