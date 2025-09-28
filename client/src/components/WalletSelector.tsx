import React, { useState } from "react";
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../utils/format";

export const WalletSelector: React.FC = () => {
  const { connect, disconnect, isConnected, address, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setIsOpen(false);
    } catch (error) {
      // console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsOpen(false);
    } catch (error) {
      // console.error("Failed to disconnect wallet:", error);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 px-3 py-2">
                Choose a wallet
              </div>
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet.name)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-6 h-6 rounded"
                  />
                  <span className="text-sm font-medium">{wallet.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">
            {formatAddress(address?.toString() || "")}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-green-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-1">
                Connected Address
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-900">
                  {formatAddress(address?.toString() || "", 8, 6)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-50 rounded-md transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
