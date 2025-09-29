/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { usePayments } from "../hooks/usePayments";
import { WalletSelector } from "../components/WalletSelector";
import type { PaymentRequest } from "../types";
import {
  formatAmount,
  formatAddress,
  getTimeRemaining,
  isExpired,
  parseAmount,
} from "../utils/format";
import { DEFAULT_TOKENS } from "../utils/constants";

export const PaymentPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isConnected, address, getBalance, aptos } = useWallet();
  const { payRequest, getPaymentRequest, loading } = usePayments();

  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [payerBalance, setPayerBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [actualRequestId, setActualRequestId] = useState<string>("");
  const [paymentTransactionHash, setPaymentTransactionHash] =
    useState<string>("");

  useEffect(() => {
    if (requestId) {
      loadPaymentRequest();
    }
  }, [requestId]);

  useEffect(() => {
    if (isConnected && request) {
      loadPayerBalance();
    }
  }, [isConnected, request]);

  const clearUrlParameters = () => {
    // Clear all URL parameters while keeping the base path
    const newUrl = window.location.pathname;
    navigate(newUrl, { replace: true });
    // console.log("Cleared URL parameters for security");
  };

  const resolveActualObjectAddress = async (
    requestIdOrHash: string
  ): Promise<string | null> => {
    try {
      // First try to use it directly as an object address
      try {
        const result = await getPaymentRequest(requestIdOrHash);
        if (result) {
          return requestIdOrHash; // It's already a valid object address
        }
      } catch (error) {
        console.error("Error resolving object address:", error);
        // console.log(
        //   "Not a direct object address, trying to extract from transaction"
        // );
      }

      // If it looks like a transaction hash, try to extract the object address from events
      if (requestIdOrHash.startsWith("0x") && requestIdOrHash.length > 20) {
        try {
          const transactionDetails = await aptos.getTransactionByHash({
            transactionHash: requestIdOrHash,
          });

          // console.log("Transaction for object resolution:", transactionDetails);

          if (
            "success" in transactionDetails &&
            transactionDetails.success &&
            "events" in transactionDetails
          ) {
            const events = transactionDetails.events || [];
            const createdEvent = events.find((event: any) =>
              event.type.includes("PaymentRequestCreated")
            );

            if (createdEvent) {
              const rawRequest = createdEvent.data?.request;
              if (typeof rawRequest === "string") {
                return rawRequest;
              } else if (rawRequest?.inner) {
                return rawRequest.inner;
              } else if (rawRequest?.address) {
                return rawRequest.address;
              }
            }
          }
        } catch (error) {
          console.error("Error extracting from transaction:", error);
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving object address:", error);
      return null;
    }
  };

  const loadPaymentRequest = async () => {
    if (!requestId) return;

    setLoadingRequest(true);
    try {
      // Check if we have URL parameters with request data
      const urlAmount = searchParams.get("amount");
      const urlToken = searchParams.get("token");
      const urlMemo = searchParams.get("memo");
      const urlPayee = searchParams.get("payee");
      const urlExpiresAt = searchParams.get("expires_at");

      if (urlAmount && urlToken && urlMemo) {
        // Use URL parameters to create request object, but we still need to resolve the actual object address
        const tokenInfo =
          DEFAULT_TOKENS.find(
            (t) => t.symbol === urlToken || t.address === urlToken
          ) || DEFAULT_TOKENS[0];

        const requestFromUrl: PaymentRequest = {
          payee: urlPayee || "0x1234567890abcdef1234567890abcdef12345678",
          token: tokenInfo.address,
          amount: parseAmount(urlAmount, tokenInfo.decimals),
          memo: urlMemo,
          created_at: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
          expires_at: urlExpiresAt
            ? parseInt(urlExpiresAt)
            : Math.floor(Date.now() / 1000) + 86400,
          paid: false,
          payer: undefined,
        };

        setRequest(requestFromUrl);

        // Even with URL parameters, we need to resolve the actual object address for payments
        // console.log(
        //   "URL parameters found, but resolving actual object address for:",
        //   requestId
        // );
        try {
          const actualObjectAddress = await resolveActualObjectAddress(
            requestId
          );
          if (actualObjectAddress) {
            setActualRequestId(actualObjectAddress);
            // console.log("Resolved actual object address:", actualObjectAddress);

            // Check if this request has been paid and update the UI accordingly
            const actualRequest = await getPaymentRequest(actualObjectAddress);
            if (actualRequest) {
              setRequest(actualRequest);
              // If request is paid, try to find the payment transaction hash
              if (actualRequest.paid) {
                const txHash = await findPaymentTransactionHash(
                  actualObjectAddress,
                  actualRequest.payer
                );
                if (txHash) {
                  setPaymentTransactionHash(txHash);
                }
              }
            }
          } else {
            setActualRequestId(requestId);
            // console.log(
            //   "Could not resolve object address, using original:",
            //   requestId
            // );
          }
        } catch (error: any) {
          console.error("Error resolving object address:", error);
          setActualRequestId(requestId);
        }
      } else {
        // Fallback to fetching from blockchain
        // console.log("Fetching from blockchain for requestId:", requestId);
        const req = await getPaymentRequest(requestId);
        setRequest(req);
        if (req) {
          setActualRequestId(requestId);
          // console.log(
          //   "After blockchain fetch, actualRequestId set to:",
          //   requestId
          // );

          // If request is paid, try to find the payment transaction hash
          if (req.paid) {
            const txHash = await findPaymentTransactionHash(
              requestId,
              req.payer
            );
            if (txHash) {
              setPaymentTransactionHash(txHash);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading payment request:", error);
    } finally {
      setLoadingRequest(false);
    }
  };

  const loadPayerBalance = async () => {
    if (!isConnected || !request) return;

    setLoadingBalance(true);
    try {
      const tokenInfo = getTokenInfo(request.token);
      let tokenAddressForBalance: string | undefined = request.token;

      // For APT token, use undefined to get APT balance
      if (tokenInfo.symbol === "APT") {
        tokenAddressForBalance = undefined;
      }

      const balance = await getBalance(tokenAddressForBalance);
      setPayerBalance(Number(balance) || 0);
    } catch (error) {
      console.error("Error loading payer balance:", error);
      setPayerBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handlePay = async () => {
    if (!actualRequestId || !request) {
      // console.error("Missing request ID or request data");
      return;
    }

    // Double-check payment status before proceeding
    try {
      const currentRequest = await getPaymentRequest(actualRequestId);
      if (currentRequest?.paid) {
        // Silently refresh the UI to show paid status instead of showing alert
        await loadPaymentRequest();
        return;
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }

    try {
      // console.log("Payment details:", {
      //   actualRequestId,
      //   originalRequestId: requestId,
      //   amount: request.amount,
      //   token: tokenInfo.address,
      //   payee: request.payee,
      // });

      // Use the actual request object address to pay
      const txHash = await payRequest(actualRequestId);

      setTransactionHash(txHash);
      setPaymentSuccess(true);

      // Clear URL parameters for security after successful payment
      clearUrlParameters();

      // Reload request to show updated status
      await loadPaymentRequest();
    } catch (error: any) {
      // console.error("Payment failed:", error);
      // You might want to show an error message to the user here
      alert(`Payment failed: ${error?.message || error}`);
    }
  };

  const getTokenInfo = (tokenAddress: string) => {
    return (
      DEFAULT_TOKENS.find((t) => t.address === tokenAddress) ||
      DEFAULT_TOKENS[0]
    );
  };

  const getExplorerUrl = (hash: string) => {
    return `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`;
  };

  const findPaymentTransactionHash = async (
    requestObjectAddress: string,
    payerAddress?: string
  ) => {
    // Use the provided payer address or fall back to the global request state
    const payer = payerAddress || request?.payer;
    if (!payer) {
      return null;
    }

    try {
      // Get the payer's transaction history
      const transactions = await aptos.getAccountTransactions({
        accountAddress: payer,
        options: {
          limit: 200, // Look at more transactions
        },
      });

      // Look for a transaction that contains a PaymentPaid event for this request
      for (const tx of transactions) {
        if ("events" in tx && tx.events) {
          for (const event of tx.events) {
            if (event.type.includes("PaymentPaid")) {
              // Check various possible formats for the request address
              const eventRequestAddress =
                event.data?.request?.inner ||
                event.data?.request?.address ||
                event.data?.request;

              if (eventRequestAddress) {
                if (
                  eventRequestAddress === requestObjectAddress &&
                  "hash" in tx
                ) {
                  return tx.hash;
                }
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding payment transaction hash:", error);
      return null;
    }
  };

  if (loadingRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <div className="text-gray-600">Loading payment request...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Request Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              This payment request doesn't exist or has been removed.
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
      </div>
    );
  }

  const tokenInfo = getTokenInfo(request.token);
  const expired = isExpired(request.expires_at);
  const timeRemaining = getTimeRemaining(request.expires_at);
  const isOwnRequest = address?.toString() === request.payee;

  // Success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Payment Sent! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment has been successfully processed on the Aptos
              blockchain.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-lg font-semibold text-gray-900">
                {formatAmount(request.amount, tokenInfo.decimals)}{" "}
                {tokenInfo.symbol}
              </div>
              <div className="text-gray-600 text-sm mt-1">{request.memo}</div>
            </div>

            {transactionHash && (
              <div className="mb-6">
                <a
                  href={getExplorerUrl(transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            )}

            <div className="flex space-x-3">
              <Link
                to="/request"
                className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-center"
              >
                Create Request
              </Link>
              <Link
                to="/"
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-center"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">
              {formatAmount(request.amount, tokenInfo.decimals)}{" "}
              {tokenInfo.symbol}
            </div>
            <div className="text-primary-100">{request.memo}</div>
          </div>

          {/* Request Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Requested by</div>
                <div className="font-medium text-gray-900">
                  {formatAddress(request.payee)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Expires</div>
                <div
                  className={`font-medium ${
                    expired ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {expired ? "Expired" : timeRemaining}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Token</div>
                <div className="flex items-center space-x-2">
                  <img
                    src={tokenInfo.icon}
                    alt={tokenInfo.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-gray-900">
                    {tokenInfo.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            {/* {request.paid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-800">
                    Payment Completed
                  </span>
                </div>
                {request.payer && (
                  <div className="text-sm text-green-600 mt-1">
                    Paid by {formatAddress(request.payer)}
                  </div>
                )}
                {paymentTransactionHash && (
                  <div className="text-sm mt-2">
                    <a
                      href={getExplorerUrl(paymentTransactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-700 underline"
                    >
                      View Transaction
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            )} */}

            {expired && !request.paid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800">
                    Request Expired
                  </span>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  This payment request is no longer valid.
                </div>
              </div>
            )}

            {isOwnRequest && !request.paid && !expired && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-primary-800">
                    Your Request
                  </span>
                </div>
                <div className="text-sm text-primary-600 mt-1">
                  Share this link to receive payments.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Connect Wallet to Pay
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect your Aptos wallet to pay{" "}
                      {formatAmount(request.amount, tokenInfo.decimals)}{" "}
                      {tokenInfo.symbol}
                    </p>
                  </div>

                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-3">
                      <Wallet className="w-6 h-6 text-primary-600 mr-2" />
                      <span className="font-medium text-primary-800">
                        Choose Your Wallet
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <WalletSelector />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-yellow-800 text-sm">
                      💡 Don't have an Aptos wallet? Install{" "}
                      <a
                        href="https://petra.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline hover:no-underline"
                      >
                        Petra Wallet
                      </a>{" "}
                      or{" "}
                      <a
                        href="https://martianwallet.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline hover:no-underline"
                      >
                        Martian Wallet
                      </a>
                    </div>
                  </div>
                </div>
              ) : request.paid ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Payment Completed! ✅
                    </h3>

                    {request.payer && (
                      <div className="text-sm text-green-700 mb-2">
                        <strong>Paid by:</strong> {formatAddress(request.payer)}
                      </div>
                    )}
                    {paymentTransactionHash && (
                      <div className="text-sm">
                        <a
                          href={getExplorerUrl(paymentTransactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 hover:text-green-700 underline"
                        >
                          View Payment Transaction
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : expired ? (
                <div className="text-center text-gray-500">
                  This request has expired
                </div>
              ) : isOwnRequest ? (
                <div className="text-center text-gray-500">
                  You cannot pay your own request
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Balance Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">
                          Your Balance
                        </div>
                        <div className="font-medium text-gray-900">
                          {loadingBalance ? (
                            "Loading..."
                          ) : (
                            <>
                              {formatAmount(payerBalance, tokenInfo.decimals)}{" "}
                              {tokenInfo.symbol}
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Required</div>
                        <div className="font-medium text-gray-900">
                          {formatAmount(request.amount, tokenInfo.decimals)}{" "}
                          {tokenInfo.symbol}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insufficient Balance Warning */}
                  {!loadingBalance && payerBalance < request.amount && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-800">
                          Insufficient Balance
                        </span>
                      </div>
                      <div className="text-sm text-red-600 mt-1">
                        You need{" "}
                        {formatAmount(
                          request.amount - payerBalance,
                          tokenInfo.decimals
                        )}{" "}
                        more {tokenInfo.symbol} to complete this payment.
                      </div>
                    </div>
                  )}

                  {/* Payment Button */}
                  <button
                    onClick={handlePay}
                    disabled={
                      loading || loadingBalance || payerBalance < request.amount
                    }
                    className="w-full flex items-center justify-center px-6 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg font-semibold text-lg transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : loadingBalance ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking Balance...
                      </>
                    ) : payerBalance < request.amount ? (
                      <>💳 Insufficient {tokenInfo.symbol}</>
                    ) : (
                      <>
                        💳 Pay{" "}
                        {formatAmount(request.amount, tokenInfo.decimals)}{" "}
                        {tokenInfo.symbol}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
