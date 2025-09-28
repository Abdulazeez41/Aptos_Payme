import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useMemo } from "react";

export const useWallet = () => {
  const wallet = useAptosWallet();

  const aptos = useMemo(() => {
    const config = new AptosConfig({ network: Network.TESTNET });
    return new Aptos(config);
  }, []);

  const isConnected = wallet.connected && wallet.account;

  const getBalance = async (tokenAddress?: string) => {
    if (!wallet.account) return null;

    try {
      if (!tokenAddress || tokenAddress === "0x1::aptos_coin::AptosCoin") {
        // Get APT balance
        const balance = await aptos.getAccountAPTAmount({
          accountAddress: wallet.account.address.toString(),
        });
        return balance;
      } else {
        // Get fungible asset balance
        const balance = await aptos.getCurrentFungibleAssetBalances({
          options: {
            where: {
              owner_address: { _eq: wallet.account.address.toString() },
              asset_type: { _eq: tokenAddress },
            },
          },
        });
        return balance[0]?.amount || null;
      }
    } catch (error) {
      console.error("Error getting balance:", error);
      return null;
    }
  };

  return {
    ...wallet,
    aptos,
    isConnected,
    getBalance,
    address: wallet.account?.address?.toString(),
  };
};
