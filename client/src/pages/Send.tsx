/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Send as SendIcon, User } from "lucide-react";
import { DEFAULT_TOKENS } from "../utils/constants";
import type { TokenInfo } from "../types";
import { parseAmount, formatAmount, formatAddress } from "../utils/format";
import { useWallet } from "../hooks/useWallet";

// Simple recipient resolver: supports 0x... addresses and placeholder for .apt (ANS)
const isHexAddress = (v: string) => /^0x[a-fA-F0-9]{1,}$/i.test(v.trim());

async function resolveRecipient(input: string): Promise<string> {
  const trimmed = input.trim();
  if (isHexAddress(trimmed)) return trimmed.toLowerCase();

  if (trimmed.endsWith(".apt")) {
    // TODO: Integrate actual ANS resolution here (contracts vary per network)
    // For now, inform the caller we can't resolve and ask for an address
    throw new Error(
      "ANS (.apt) resolution isn't configured yet on this network. Please enter a wallet address."
    );
  }

  throw new Error("Enter a valid Aptos address (0x...) or a .apt name");
}

export const Send: React.FC = () => {
  const { isConnected, getBalance, signAndSubmitTransaction, aptos, address } =
    useWallet();

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(
    DEFAULT_TOKENS[0]
  );
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  const canSend = useMemo(() => {
    const num = parseFloat(amount || "0");
    return isConnected && recipient && !isNaN(num) && num > 0;
  }, [isConnected, recipient, amount]);

  const refreshBalances = React.useCallback(async () => {
    if (!isConnected || loadingBalances) return;
    setLoadingBalances(true);
    try {
      const next: Record<string, number> = {};
      for (const token of DEFAULT_TOKENS) {
        let tokenAddr: string | undefined = token.address;
        // APT uses the standard coin balance API; treat metadata address 0xa as APT
        if (token.address === "0xa") tokenAddr = undefined; // use default APT
        const bal = await getBalance(tokenAddr);
        next[token.address] = Number(bal || 0);
      }
      setBalances(next);
    } catch (e) {
      // noop
    } finally {
      setLoadingBalances(false);
    }
  }, [getBalance, isConnected, loadingBalances]);

  useEffect(() => {
    if (isConnected && !loadingBalances) {
      const t = setTimeout(() => refreshBalances(), 50);
      return () => clearTimeout(t);
    }
  }, [isConnected]);

  const handleAmountChange = (v: string) => {
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(v) && v !== "") return;
    if (v.startsWith("0") && v.length > 1 && v[1] !== ".") return;
    setAmount(v);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signAndSubmitTransaction) return;

    try {
      setSending(true);
      setError(null);
      setTxHash(null);

      // Resolve recipient to address
      const toAddress = await resolveRecipient(recipient);

      // Check balance
      const required = parseAmount(amount, selectedToken.decimals);
      const currentBal = balances[selectedToken.address] || 0;
      if (currentBal < required) {
        throw new Error("Insufficient balance for this transfer");
      }

      // Build transaction depending on token type
      let tx: any;
      if (selectedToken.address === "0xa") {
        // Use coin::transfer<APT>(to, amount)
        tx = {
          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [toAddress, required],
          },
        };
      } else {
        // Use primary_fungible_store::transfer(metadata, to, amount)
        tx = {
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [selectedToken.address, toAddress, required],
          },
        };
      }

      const resp = await signAndSubmitTransaction(tx);
      await aptos.waitForTransaction({ transactionHash: resp.hash });
      setTxHash(resp.hash);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSending(false);
    }
  };

  const tokenBalance = balances[selectedToken.address] || 0;
  const explorerUrl = (hash: string) =>
    `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`;

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            You need to connect an Aptos wallet to send tokens.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Send (P2P)</h1>
        <p className="text-gray-600 mt-2">
          Send APT or supported tokens to an Aptos address or .apt name.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSend} className="p-6 space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient (.apt or 0x address)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="alice.apt or 0xabc..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Sending from {address ? formatAddress(address) : "your wallet"}
            </div>
          </div>

          {/* Token & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <div className="relative">
                <select
                  value={selectedToken.address}
                  onChange={(e) => {
                    const t = DEFAULT_TOKENS.find(
                      (x) => x.address === e.target.value
                    );
                    if (t) setSelectedToken(t);
                  }}
                  className="w-full px-4 py-3 border rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {DEFAULT_TOKENS.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} — {token.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={refreshBalances}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700"
                >
                  {loadingBalances ? "Loading..." : "Refresh"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Balance: {formatAmount(tokenBalance, selectedToken.decimals)} {" "}
                {selectedToken.symbol}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Memo (optional, informational only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Memo (optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="For lunch 🍔"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Note: Memo is not recorded on-chain for native transfers.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {txHash ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-medium mb-1">
                Transfer Successful
              </div>
              <a
                href={explorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline text-sm"
              >
                View on Aptos Explorer
              </a>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSend || sending}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5 mr-2" /> Send {selectedToken.symbol}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Send;
