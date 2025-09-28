/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { usePayments } from "../hooks/usePayments";
import { DEFAULT_TOKENS, EXPIRY_OPTIONS } from "../utils/constants";
import { parseAmount, formatAmount } from "../utils/format";
import { ShareModal } from "../components/ShareModal";
import type { TokenInfo } from "../types";

export const CreateRequest: React.FC = () => {
  const { isConnected, getBalance, address } = useWallet();
  const { createPaymentRequest, loading, error } = usePayments();

  const [selectedToken, setSelectedToken] = useState<TokenInfo>(
    DEFAULT_TOKENS[0]
  );
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(86400); // 24 hours default
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const loadBalances = React.useCallback(async () => {
    if (!isConnected || loadingBalances) {
      // console.log("Not connected or already loading, skipping balance load");
      return;
    }

    setLoadingBalances(true);
    // console.log("Loading balances for connected wallet...");

    try {
      const newBalances: { [key: string]: number } = {};

      // Load balances for all tokens
      for (const token of DEFAULT_TOKENS) {
        let tokenAddressForBalance: string | undefined = token.address;

        // For APT token, use undefined to get APT balance (as per useWallet implementation)
        if (token.symbol === "APT") {
          tokenAddressForBalance = undefined; // Let getBalance default to APT
        }

        // console.log(
        //   `Loading balance for ${token.symbol} (${tokenAddressForBalance || "APT default"})`
        // );
        const bal = await getBalance(tokenAddressForBalance);
        // console.log(
        //   `Balance for ${token.symbol}: ${bal} (type: ${typeof bal})`
        // );
        newBalances[token.address] = Number(bal) || 0;
      }

      // console.log("All balances loaded:", newBalances);
      setBalances(newBalances);
    } catch (error) {
      console.error("Error loading balances:", error);
    } finally {
      setLoadingBalances(false);
    }
  }, [getBalance, isConnected]);

  useEffect(() => {
    if (isConnected && !loadingBalances) {
      // Add a small delay to prevent rapid re-renders
      const timer = setTimeout(() => {
        loadBalances();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isConnected]); // Remove loadBalances from dependencies to prevent infinite loops

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") {
      // Allow "0." for decimal input but prevent multiple leading zeros like "00" or "01"
      if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
        return;
      }
      setAmount(value);
    }
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return amount !== "" && numAmount > 0 && !isNaN(numAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount() || !memo) return;

    try {
      const amountInBaseUnits = parseAmount(amount, selectedToken.decimals);

      const result = await createPaymentRequest({
        token: selectedToken.address,
        amount: amountInBaseUnits,
        memo,
        expires_in_seconds: expirySeconds,
      });

      // Use the request object address if available, otherwise use transaction hash
      const rawId =
        (result as any).requestObject || (result as any).transactionHash;
      const requestId =
        typeof rawId === "string"
          ? rawId
          : rawId?.address || rawId?.addr || rawId?.id || String(rawId);

      // console.log("Create request result:", result);
      // console.log("Raw ID:", rawId);
      // console.log("Final request ID:", requestId);

      setCreatedRequest(requestId);
      setShowShareModal(true);
    } catch (err) {
      console.error("Failed to create payment request:", err);
    }
  };

  const handleNewRequest = () => {
    setCreatedRequest(null);
    setAmount("");
    setMemo("");
    setShowShareModal(false);
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            You need to connect an Aptos wallet to create payment requests.
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
        <h1 className="text-3xl font-bold text-gray-900">
          Create Payment Request
        </h1>
        <p className="text-gray-600 mt-2">
          Generate a shareable payment link that anyone can pay instantly.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Token Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Token
              </label>
              <button
                type="button"
                onClick={loadBalances}
                disabled={loadingBalances}
                className="text-xs text-primary-600 hover:text-primary-700 disabled:text-gray-400"
              >
                {loadingBalances ? "Loading..." : "Refresh Balances"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_TOKENS.map((token) => {
                const balance = balances[token.address] || 0;
                return (
                  <button
                    key={token.address}
                    type="button"
                    onClick={() => setSelectedToken(token)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedToken.address === token.address
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {token.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {loadingBalances ? (
                            "Loading balance..."
                          ) : (
                            <>
                              Balance: {formatAmount(balance, token.decimals)}{" "}
                              {token.symbol}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* {balances[selectedToken.address] &&
              balances[selectedToken.address] > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Balance:{" "}
                  {formatAmount(
                    balances[selectedToken.address],
                    selectedToken.decimals
                  )}{" "}
                  {selectedToken.symbol}
                </div>
              )} */}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {selectedToken.symbol}
                </span>
              </div>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`block w-full pl-16 pr-12 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg ${
                  amount && !isValidAmount()
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="0.00"
                required
              />
              {amount && !isValidAmount() && (
                <div className="mt-1 text-sm text-red-600">
                  Please enter a valid amount greater than 0
                </div>
              )}
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's this for?
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Lunch, coffee, freelance work..."
                required
                maxLength={100}
              />
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {memo.length}/100 characters
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires in
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={expirySeconds}
                onChange={(e) => setExpirySeconds(parseInt(e.target.value))}
                className="block w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                title="Select expiry time"
              >
                {EXPIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isValidAmount() || !memo}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Request...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create Payment Request
              </>
            )}
          </button>
        </form>
      </div>

      {/* Share Modal */}
      {showShareModal && createdRequest && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          requestId={createdRequest}
          amount={amount}
          token={selectedToken.symbol}
          memo={memo}
          payee={address}
          expiresAt={Math.floor(Date.now() / 1000) + expirySeconds}
          onNewRequest={handleNewRequest}
        />
      )}
    </div>
  );
};
