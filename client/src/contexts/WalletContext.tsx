import React from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

// Note: In production, you would import actual wallet adapters

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({
  children,
}) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
      }}
      onError={(error) => {
        console.error("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
