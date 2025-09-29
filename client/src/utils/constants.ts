import aptosLogo from "../assets/aptos.png";
import usdcLogo from "../assets/usdc.png";
// Contract addresses from Move.toml
export const CONTRACT_ADDRESS =
  "0x8e1ae3070ec91bb532197041d01efa308b5eb02dda9c746c3ba43af7df730f4e";

// Default tokens (will be expanded with real Aptos tokens)
export const DEFAULT_TOKENS = [
  {
    address: "0xa", // APT metadata object address (commonly 0xa on testnet)
    name: "Aptos",
    symbol: "APT",
    decimals: 8,
    icon: aptosLogo,
  },
  {
    address:
      "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    icon: usdcLogo,
  },
];

// Payment link base URL (will be configurable)
export const PAYMENT_BASE_URL = "https://payme.apt";

// Default expiry options (in seconds)
export const EXPIRY_OPTIONS = [{ label: "24 hours", value: 86400 }];

// Network configuration
export const NETWORK = "testnet"; // or "mainnet", "devnet"

// App metadata
export const APP_NAME = "Aptos PayMe";
export const APP_DESCRIPTION = "PayPal.Me, But On-Chain";
