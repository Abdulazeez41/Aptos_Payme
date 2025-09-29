/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS } from "../utils/constants";
import type { CreatePaymentRequestParams, PaymentRequest } from "../types";

// Utility function to encode strings as hex for Move transactions (browser-compatible)
const stringToHex = (str: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return (
    "0x" +
    Array.from(data)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  );
};

// Utility function to decode hex strings back to text (browser-compatible)
const hexToString = (hex: string): string => {
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

    // Convert hex to bytes
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    // Decode bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  } catch (error) {
    console.error("Error decoding hex string:", error);
    return hex; // Return original hex if decoding fails
  }
};

// Note: The Move contract creates deterministic object addresses using:
// seed = PAYMENT_SEED_PREFIX + "::" + u64_to_bytes(timestamp)
// object::create_named_object(payee_signer, seed)

// Get the correct token metadata address
const getTokenMetadataAddress = async (
  _aptos: any,
  tokenType: string
): Promise<string> => {
  try {
    if (tokenType === "0xa" || tokenType.includes("aptos_coin")) {
      // For APT, use the standard metadata object address
      return "0xa";
    }
    if (
      tokenType ===
      "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832"
    ) {
      // For USDC, use the standard metadata object address
      return "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";
    }
    // For other tokens, return the provided address
    return tokenType;
  } catch (error) {
    console.error("Error getting token metadata address:", error);
    return tokenType;
  }
};

export const usePayments = () => {
  const { account, signAndSubmitTransaction, aptos } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentRequest = useCallback(
    async (params: CreatePaymentRequestParams) => {
      if (!account || !signAndSubmitTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        // Get the correct token metadata address
        const tokenAddress = await getTokenMetadataAddress(aptos, params.token);

        // Use the wallet adapter's signAndSubmitTransaction method
        const transaction = {
          data: {
            function: `${CONTRACT_ADDRESS}::payme::create_payment_request`,
            functionArguments: [
              tokenAddress, // Object<Metadata> address
              params.amount, // u64 as number
              stringToHex(params.memo), // String encoded as hex
              params.expires_in_seconds, // u64 as number
            ],
          },
        };

        const response = await signAndSubmitTransaction(transaction as any);

        // Wait for transaction confirmation
        const result = await aptos.waitForTransaction({
          transactionHash: response.hash,
        });

        // Extract the request object from events if available
        if (result.success && "events" in result) {
          const events = result.events || [];
          const createdEvent = events.find((event: any) =>
            event.type.includes("PaymentRequestCreated")
          );

          if (createdEvent) {
            // Extract the request object address from the event
            const rawRequest = createdEvent.data?.request;
            // console.log("Raw request from event:", rawRequest);
            // console.log("Full event data:", createdEvent.data);
            // console.log("Event type:", createdEvent.type);

            let requestObjectAddress = "";

            // In Aptos TypeScript SDK, Object<T> is typically represented as a string address
            // or an object with an 'inner' property
            if (typeof rawRequest === "string") {
              requestObjectAddress = rawRequest;
              // console.log("Found string address:", requestObjectAddress);
            } else if (rawRequest && typeof rawRequest === "object") {
              // Try different possible structures for Object<T>
              if (rawRequest.inner) {
                requestObjectAddress = rawRequest.inner;
                // console.log("Found inner address:", requestObjectAddress);
              } else if (rawRequest.address) {
                requestObjectAddress = rawRequest.address;
                // console.log("Found address property:", requestObjectAddress);
              } else if (rawRequest.vec && rawRequest.vec[0]) {
                requestObjectAddress = rawRequest.vec[0];
                // console.log("Found vec[0] address:", requestObjectAddress);
              } else {
                // Log all properties to debug
                // console.log("Object properties:", Object.keys(rawRequest));
                // console.log("Object values:", Object.values(rawRequest));

                // Try to find any property that looks like an address
                for (const [, value] of Object.entries(rawRequest)) {
                  if (
                    typeof value === "string" &&
                    value.startsWith("0x") &&
                    value.length > 10
                  ) {
                    requestObjectAddress = value;
                    // console.log(
                    //   `Found address in property '${key}':`,
                    //   requestObjectAddress
                    // );
                    break;
                  }
                }
              }
            }

            if (!requestObjectAddress) {
              // Fallback: use transaction hash and let PaymentPage handle it
              // console.warn(
              //   "Could not extract request object address, using transaction hash"
              // );
              requestObjectAddress = response.hash;
            }

            // console.log("Final extracted request object address:", requestObjectAddress);

            return {
              transactionHash: response.hash,
              requestObject: requestObjectAddress,
            };
          }
        }

        return { transactionHash: response.hash };
      } catch (err: any) {
        setError(err?.message || "Failed to create payment request");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [account, signAndSubmitTransaction, aptos]
  );

  const payRequest = useCallback(
    async (requestObjectAddress: string) => {
      if (!account || !signAndSubmitTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        // Use the wallet adapter's signAndSubmitTransaction method
        const transaction = {
          data: {
            function: `${CONTRACT_ADDRESS}::payme::pay_request`,
            functionArguments: [requestObjectAddress],
          },
        };

        const response = await signAndSubmitTransaction(transaction as any);

        await aptos.waitForTransaction({ transactionHash: response.hash });

        return response.hash;
      } catch (err: any) {
        setError(err?.message || "Failed to pay request");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [account, signAndSubmitTransaction, aptos]
  );

  const cancelRequest = useCallback(
    async (requestObjectAddress: string) => {
      if (!account || !signAndSubmitTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const transaction = {
          data: {
            function: `${CONTRACT_ADDRESS}::payme::cancel_request`,
            functionArguments: [requestObjectAddress],
          },
        };

        const response = await signAndSubmitTransaction(transaction as any);

        await aptos.waitForTransaction({ transactionHash: response.hash });

        return response.hash;
      } catch (err: any) {
        setError(err?.message || "Failed to cancel request");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [account, signAndSubmitTransaction, aptos]
  );

  const getPaymentRequest = useCallback(
    async (requestIdOrHash: string): Promise<PaymentRequest | null> => {
      try {
        // console.log("Getting payment request for:", requestIdOrHash);

        // First, always try to use it as a request object address
        try {
          const result = await aptos.view({
            payload: {
              function: `${CONTRACT_ADDRESS}::payme::get_request`,
              functionArguments: [requestIdOrHash],
            },
          });

          if (result && result.length > 0) {
            const requestData = result[0] as any;
            // console.log("Found request data:", requestData);

            return {
              payee: requestData.payee,
              token: requestData.token.inner || requestData.token, // Handle Object<Metadata> structure
              amount: parseInt(requestData.amount),
              memo: requestData.memo,
              created_at: parseInt(requestData.created_at),
              expires_at: parseInt(requestData.expires_at),
              paid: requestData.paid,
              payer: requestData.payer?.vec?.[0] || undefined,
            };
          }
        } catch (err) {
          console.error(err);
          // console.log("Not a valid request object address, trying as transaction hash");
        }

        // If that fails and it looks like a transaction hash, try to extract from transaction
        if (requestIdOrHash.startsWith("0x") && requestIdOrHash.length > 20) {
          try {
            const transaction = await aptos.getTransactionByHash({
              transactionHash: requestIdOrHash,
            });

            // console.log("Transaction details:", transaction);

            // Try to extract request object address from transaction events
            if (
              "success" in transaction &&
              transaction.success &&
              "events" in transaction
            ) {
              const events = transaction.events || [];
              const createdEvent = events.find((event: any) =>
                event.type.includes("PaymentRequestCreated")
              );

              if (createdEvent) {
                const rawRequest = createdEvent.data?.request;
                let requestObjectAddress = "";

                if (typeof rawRequest === "string") {
                  requestObjectAddress = rawRequest;
                } else if (rawRequest?.inner) {
                  requestObjectAddress = rawRequest.inner;
                } else if (rawRequest?.address) {
                  requestObjectAddress = rawRequest.address;
                }

                if (requestObjectAddress) {
                  // console.log("Found request object address in transaction:", requestObjectAddress);
                  // Recursively call with the extracted address
                  return await getPaymentRequest(requestObjectAddress);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching transaction:", error);
          }
        }

        // console.log("Could not find payment request for:", requestIdOrHash);
        return null;
      } catch (err) {
        console.error("Error fetching payment request:", err);
        return null;
      }
    },
    [aptos]
  );

  const getPaymentHistory = useCallback(
    async (userAddress: string) => {
      try {
        // console.log("Fetching real payment history for:", userAddress);

        if (!userAddress) {
          return [];
        }

        const history: any[] = [];

        // Fetch user's account transactions
        try {
          const accountTransactions = await aptos.getAccountTransactions({
            accountAddress: userAddress,
            options: {
              limit: 50, // Fetch last 50 transactions
            },
          });

          // console.log(`Found ${accountTransactions.length} total transactions for user`);

          // Filter for PayMe-related transactions
          for (const transaction of accountTransactions) {
            if (!("success" in transaction) || !transaction.success) {
              continue; // Skip failed transactions
            }

            // Only process user transactions which have payload and events
            if (transaction.type !== "user_transaction") {
              continue;
            }

            const userTx = transaction as any; // Type assertion for user transaction

            const functionName = userTx.payload.function;
            const functionArgs = userTx.payload?.arguments || [];

            // console.log("PayMe transaction found:", functionName, "for user:", userAddress);

            // Handle create_payment_request transactions
            if (functionName.includes("create_payment_request")) {
              // User created a payment request (they are the payee)
              try {
                // Extract token address from first argument (handle object structure)
                let tokenAddress = "0xa"; // Default to APT
                const rawTokenArg = functionArgs[0];
                if (typeof rawTokenArg === "string") {
                  tokenAddress = rawTokenArg;
                } else if (rawTokenArg && rawTokenArg.inner) {
                  tokenAddress = rawTokenArg.inner;
                } else if (rawTokenArg && rawTokenArg.address) {
                  tokenAddress = rawTokenArg.address;
                }

                const amount = functionArgs[1] ? parseInt(functionArgs[1]) : 0;
                const memo = functionArgs[2]
                  ? hexToString(functionArgs[2])
                  : "Payment request";

                // console.log(
                //   "Create request - Token address extracted:",
                //   tokenAddress
                // );

                // Check if transaction was successful and if request has been paid
                const transactionSuccessful = userTx.success === true;
                let isPaid = false;

                if (transactionSuccessful) {
                  try {
                    const events = userTx.events || [];
                    const createdEvent = events.find((event: any) =>
                      event.type.includes("PaymentRequestCreated")
                    );

                    if (createdEvent) {
                      const rawRequest = createdEvent.data?.request;
                      let requestAddress = "";

                      if (typeof rawRequest === "string") {
                        requestAddress = rawRequest;
                      } else if (rawRequest?.inner) {
                        requestAddress = rawRequest.inner;
                      } else if (rawRequest?.address) {
                        requestAddress = rawRequest.address;
                      }

                      if (requestAddress) {
                        const requestData = await aptos.view({
                          payload: {
                            function: `${CONTRACT_ADDRESS}::payme::get_request`,
                            functionArguments: [requestAddress],
                          },
                        });

                        if (requestData && requestData.length > 0) {
                          const request = requestData[0] as any;
                          isPaid = request.paid === true;
                        }
                      }
                    }
                  } catch (error) {
                    console.log("Could not check request status:", error);
                    isPaid = false;
                  }
                }

                history.push({
                  id: userTx.hash + "_create",
                  type: "received", // Payee expects to "receive" money from this request
                  amount: amount,
                  token: tokenAddress, // Use actual token from transaction
                  memo: memo,
                  date: new Date(parseInt(userTx.timestamp) / 1000),
                  paid: transactionSuccessful && isPaid,
                  payer: undefined,
                  payee: userAddress, // User is the payee
                  created_at: Math.floor(parseInt(userTx.timestamp) / 1000000),
                  expires_at:
                    Math.floor(parseInt(userTx.timestamp) / 1000000) + 86400,
                  transactionHash: userTx.hash,
                });

                // console.log("Added created request for payee:", userAddress, "- Transaction successful:", transactionSuccessful, "- Request paid:", isPaid, "- Final status:", transactionSuccessful && isPaid ? "completed" : "pending");
              } catch (parseError) {
                console.error(
                  "Error parsing create_payment_request:",
                  parseError
                );
              }
            }

            // Handle pay_request transactions
            else if (functionName.includes("pay_request") && userTx.events) {
              const events = userTx.events || [];

              const paidEvent = events.find((event: any) =>
                event.type.includes("PaymentPaid")
              );

              if (paidEvent) {
                try {
                  const amount = paidEvent.data?.amount
                    ? parseInt(paidEvent.data.amount)
                    : 0;
                  const payerAddress = paidEvent.data?.payer;
                  const requestObject = paidEvent.data?.request;

                  // console.log("PaymentPaid event - Payer:", payerAddress, "User:", userAddress);

                  if (payerAddress === userAddress) {
                    // User made the payment (they are the payer)
                    const paymentSuccessful = userTx.success === true;

                    // Try to get token information from the request
                    let tokenAddress = "0xa"; // Default to APT
                    let memo = "Payment sent";

                    try {
                      let requestAddress = "";
                      if (typeof requestObject === "string") {
                        requestAddress = requestObject;
                      } else if (requestObject?.inner) {
                        requestAddress = requestObject.inner;
                      } else if (requestObject?.address) {
                        requestAddress = requestObject.address;
                      }

                      if (requestAddress) {
                        const requestData = await aptos.view({
                          payload: {
                            function: `${CONTRACT_ADDRESS}::payme::get_request`,
                            functionArguments: [requestAddress],
                          },
                        });

                        if (requestData && requestData.length > 0) {
                          const request = requestData[0] as any;
                          tokenAddress = request.token || "0xa";
                          memo = request.memo
                            ? hexToString(request.memo)
                            : "Payment sent";
                          // console.log(
                          //   "Payment sent - Token address from request:",
                          //   tokenAddress
                          // );
                        }
                      }
                    } catch (error) {
                      console.log(
                        "Could not fetch request details for payment:",
                        error
                      );
                    }

                    history.push({
                      id: userTx.hash + "_pay",
                      type: "sent", // Payer "sent" money
                      amount: amount,
                      token: tokenAddress, // Use actual token from request
                      memo: memo,
                      date: new Date(parseInt(userTx.timestamp) / 1000),
                      paid: paymentSuccessful, // Payment completed if transaction successful
                      payer: userAddress, // User is the payer
                      payee: "Unknown",
                      created_at: Math.floor(
                        parseInt(userTx.timestamp) / 1000000
                      ),
                      expires_at: Math.floor(
                        parseInt(userTx.timestamp) / 1000000
                      ),
                      transactionHash: userTx.hash,
                    });

                    // console.log(
                    //   "Added payment sent for payer:",
                    //   userAddress,
                    //   "- Transaction successful:",
                    //   paymentSuccessful,
                    //   "- Status:",
                    //   paymentSuccessful ? "completed" : "failed"
                    // );
                  } else {
                    // Try to determine if this user is the payee by fetching request data
                    try {
                      let requestAddress = "";

                      if (typeof requestObject === "string") {
                        requestAddress = requestObject;
                      } else if (requestObject?.inner) {
                        requestAddress = requestObject.inner;
                      } else if (requestObject?.address) {
                        requestAddress = requestObject.address;
                      }

                      if (requestAddress) {
                        const requestData = await aptos.view({
                          payload: {
                            function: `${CONTRACT_ADDRESS}::payme::get_request`,
                            functionArguments: [requestAddress],
                          },
                        });

                        if (requestData && requestData.length > 0) {
                          const request = requestData[0] as any;
                          const payeeAddress = request.payee;

                          // console.log("Request payee:", payeeAddress, "User:", userAddress);

                          if (payeeAddress === userAddress) {
                            // User received the payment (they are the payee)
                            const originalMemo = request.memo
                              ? hexToString(request.memo)
                              : "Payment received";
                            const tokenAddress = request.token || "0xa"; // Extract token from request

                            // console.log(
                            //   "Payment received - Token address from request:",
                            //   tokenAddress
                            // );

                            const paymentSuccessful = userTx.success === true;

                            history.push({
                              id: userTx.hash + "_receive",
                              type: "received", // Payee "received" money
                              amount: amount,
                              token: tokenAddress, // Use actual token from request
                              memo: originalMemo,
                              date: new Date(parseInt(userTx.timestamp) / 1000),
                              paid: paymentSuccessful, // Payment completed if transaction successful
                              payer: payerAddress,
                              payee: userAddress, // User is the payee
                              created_at: Math.floor(
                                parseInt(userTx.timestamp) / 1000000
                              ),
                              expires_at: Math.floor(
                                parseInt(userTx.timestamp) / 1000000
                              ),
                              transactionHash: userTx.hash,
                            });

                            // console.log(
                            //   "Added payment received for payee:",
                            //   userAddress,
                            //   "- Transaction successful:",
                            //   paymentSuccessful,
                            //   "- Status:",
                            //   paymentSuccessful ? "completed" : "failed"
                            // );

                            // Also mark any matching created request as completed
                            const matchingRequest = history.find(
                              (item) =>
                                item.payee === userAddress &&
                                item.amount === amount &&
                                !item.paid &&
                                item.type === "received"
                            );

                            if (matchingRequest) {
                              matchingRequest.paid = true;
                              // console.log(
                              //   "Marked matching request as completed"
                              // );
                            }
                          }
                        }
                      }
                    } catch (fetchError) {
                      console.log("Could not fetch request data:", fetchError);
                    }
                  }
                } catch (parseError) {
                  console.error("Error parsing pay_request:", parseError);
                }
              }
            }
          }

          // console.log(`Found ${history.length} PayMe transactions`);

          // Remove duplicates and sort
          const uniqueHistory = history.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );

          // Sort by date (newest first)
          uniqueHistory.sort((a, b) => b.created_at - a.created_at);

          return uniqueHistory;
        } catch (transactionError) {
          console.error(
            "Error fetching account transactions:",
            transactionError
          );

          // Fallback: return empty array but don't throw
          return [];
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }
    },
    [aptos]
  );

  return {
    createPaymentRequest,
    payRequest,
    cancelRequest,
    getPaymentRequest,
    getPaymentHistory,
    loading,
    error,
  };
};
