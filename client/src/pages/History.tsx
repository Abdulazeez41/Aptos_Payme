/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Search,
  Calendar,
  DollarSign,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { usePayments } from "../hooks/usePayments";
import type { PaymentHistory } from "../types";
import { formatAmount, formatDate } from "../utils/format";
import { DEFAULT_TOKENS } from "../utils/constants";

export const History: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { getPaymentHistory } = usePayments();
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "expired"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "sent" | "received">(
    "all"
  );
  const [tokenFilter, setTokenFilter] = useState<"all" | "APT" | "USDC">("all");
  const [exportingCSV, setExportingCSV] = useState(false);

  // Helper function to normalize and match token addresses
  const findTokenInfo = (tokenAddress: any) => {
    // Extract the actual address string from the object structure
    let actualAddress: string;
    if (typeof tokenAddress === "string") {
      actualAddress = tokenAddress;
    } else if (tokenAddress && tokenAddress.inner) {
      actualAddress = tokenAddress.inner;
    } else if (tokenAddress && tokenAddress.address) {
      actualAddress = tokenAddress.address;
    } else {
      return DEFAULT_TOKENS[0];
    }

    // Direct match first
    let tokenInfo = DEFAULT_TOKENS.find(
      (token) => token.address === actualAddress
    );
    if (tokenInfo) {
      return tokenInfo;
    }

    // Special case matching
    if (
      actualAddress === "0xa" ||
      actualAddress === "0x1::aptos_coin::AptosCoin"
    ) {
      tokenInfo = DEFAULT_TOKENS.find((t) => t.symbol === "APT");
      return tokenInfo || DEFAULT_TOKENS[0];
    }

    if (
      actualAddress ===
      "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832"
    ) {
      tokenInfo = DEFAULT_TOKENS.find((t) => t.symbol === "USDC");
      return tokenInfo || DEFAULT_TOKENS[1];
    }

    return DEFAULT_TOKENS[0];
  };

  useEffect(() => {
    if (isConnected && address) {
      loadHistory();
    }
  }, [isConnected, address]);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, statusFilter, typeFilter, tokenFilter]);

  const loadHistory = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const blockchainHistory = await getPaymentHistory(address);

      // Transform blockchain data to our PaymentHistory format
      const formattedHistory: PaymentHistory[] = blockchainHistory.map(
        (item: any) => {
          const tokenInfo = findTokenInfo(item.token);

          // Determine status based on current time and payment status
          let status: "pending" | "completed" | "expired" | "cancelled" =
            "pending";
          if (item.paid) {
            status = "completed";
          } else if (item.expires_at < Date.now() / 1000) {
            status = "expired";
          }

          return {
            id: item.id,
            type: item.type,
            amount: item.amount,
            token: tokenInfo,
            memo: item.memo,
            date: item.date,
            status,
            counterparty:
              item.type === "sent" ? "Unknown" : item.payer || "Unknown",
            transactionHash: item.transactionHash,
          };
        }
      );

      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading history:", error);
      // Fallback to empty array on error
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.counterparty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    if (tokenFilter !== "all") {
      filtered = filtered.filter((item) => {
        const tokenSymbol = item.token.symbol;
        return tokenSymbol === tokenFilter;
      });
    }

    setFilteredHistory(filtered);
  };

  const exportToCSV = async () => {
    // console.log("Exporting CSV with data:", filteredHistory);

    if (filteredHistory.length === 0) {
      alert(
        "No transaction history to export. Please connect your wallet and ensure you have transactions."
      );
      return;
    }

    setExportingCSV(true);

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      const csvContent = [
        [
          "Date",
          "Type",
          "Amount",
          "Token",
          "Memo",
          "Status",
          "Transaction Hash",
        ].join(","),
        ...filteredHistory.map((item) =>
          [
            item.date.toISOString(),
            item.type,
            formatAmount(item.amount, item.token.decimals),
            item.token.symbol,
            `"${item.memo.replace(/"/g, '""')}"`, // Escape quotes in memo
            item.status,
            item.transactionHash || "",
          ].join(",")
        ),
      ].join("\n");

      // console.log("CSV Content:", csvContent);

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aptos-payme-history-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // console.log("CSV export completed successfully");

      // Show success feedback
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in";
      successMessage.textContent = "CSV exported successfully!";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExportingCSV(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "pending":
        return "⏳";
      case "expired":
        return "❌";
      default:
        return "❓";
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md lg:h-screen lg:flex lg:items-center lg:justify-center mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            You need to connect an Aptos wallet to view your payment history.
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="text-gray-600 mt-2">
              Track all your sent and received payment requests
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={exportingCSV}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {exportingCSV ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search memo or address..."
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              title="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Token Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value as any)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              title="Filter by token"
            >
              <option value="all">All Tokens</option>
              <option value="APT">APT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTypeFilter("all");
              setTokenFilter("all");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            {/* Fancy Loading Spinner */}
            <div className="flex flex-col items-center space-y-8 animate-fade-in">
              {/* Multi-layer Spinner */}
              <div className="relative">
                {/* Outer slow ring */}
                <div className="w-20 h-20 border-2 border-primary-100 rounded-full animate-spin-slow opacity-60"></div>

                {/* Middle ring */}
                <div className="absolute inset-2 w-16 h-16 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>

                {/* Inner fast ring */}
                <div
                  className="absolute inset-4 w-12 h-12 border-2 border-transparent border-t-primary-600 border-r-primary-600 rounded-full animate-spin"
                  style={{ animationDuration: "0.8s" }}
                ></div>

                {/* Center pulsing core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse shadow-lg"></div>
                </div>

                {/* Glowing effect */}
                <div className="absolute inset-0 w-20 h-20 bg-primary-500 rounded-full opacity-10 animate-pulse"></div>
              </div>

              {/* Enhanced Loading dots */}
              <div className="flex space-x-2">
                <div
                  className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "200ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full animate-bounce shadow-sm"
                  style={{ animationDelay: "400ms" }}
                ></div>
              </div>

              {/* Shimmer text effect */}
              <div className="space-y-3">
                <div className="text-xl font-semibold text-gray-900 relative">
                  <span className="relative z-10">Loading Payment History</span>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-200 to-transparent animate-shimmer opacity-30"
                    style={{
                      backgroundSize: "200% 100%",
                      backgroundImage:
                        "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.3), transparent)",
                    }}
                  ></div>
                </div>

                <div className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                  <span>Fetching your transactions from the blockchain</span>
                  <div className="flex space-x-1">
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-shimmer"
                  style={{
                    width: "40%",
                    backgroundSize: "200% 100%",
                    backgroundImage:
                      "linear-gradient(90deg, #b896ff, #7B2CBF, #6b25a8, #7B2CBF, #b896ff)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 mb-2">
              {history.length === 0
                ? "No payment history yet"
                : "No results found"}
            </div>
            <div className="text-gray-500 text-sm">
              {history.length === 0
                ? "Create your first payment request to get started"
                : "Try adjusting your search or filter criteria"}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <img
                            src={item.token.icon || DEFAULT_TOKENS[0].icon}
                            alt={item.token.name || DEFAULT_TOKENS[0].name}
                            className="w-6 h-6 rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.type === "sent"
                                    ? "bg-primary-100 text-primary-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.type === "sent"
                                  ? "↗️ Sent"
                                  : "↙️ Received"}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {getStatusIcon(item.status)} {item.status}
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mt-1">
                              {formatAmount(item.amount, item.token.decimals)}{" "}
                              {item.token.symbol}
                            </div>
                          </div>
                        </div>

                        <div className="text-gray-600 mb-2">{item.memo}</div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(item.date.getTime() / 1000)}
                            </span>
                          </div>
                          {/* <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{formatAddress(item.counterparty)}</span>
                      </div> */}
                        </div>
                      </div>

                      {item.transactionHash && (
                        <div className="ml-4">
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${item.transactionHash}?network=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Scroll indicator gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && filteredHistory.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredHistory.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {
                filteredHistory.filter((item) => item.status === "completed")
                  .length
              }
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {
                filteredHistory.filter((item) => item.status === "pending")
                  .length
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
