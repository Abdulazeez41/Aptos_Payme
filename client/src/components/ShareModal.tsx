import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  CheckCircle,
  MessageCircle,
  Send,
  Mail,
  QrCode,
  Plus,
} from "lucide-react";
import QRCodeLib from "qrcode";
import {
  generatePaymentUrl,
  generateShareText,
  generateWhatsAppUrl,
  generateTelegramUrl,
  generateSMSUrl,
  generateEmailUrl,
} from "../utils/format";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  amount: string;
  token: string;
  memo: string;
  payee?: string;
  expiresAt?: number;
  onNewRequest: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  requestId,
  amount,
  token,
  memo,
  payee,
  expiresAt,
  onNewRequest,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  const paymentUrl = generatePaymentUrl(
    requestId,
    amount,
    token,
    memo,
    payee,
    expiresAt
  );
  const shareText = generateShareText(amount, token, memo, paymentUrl);

  const generateQRCode = React.useCallback(async () => {
    try {
      const qrUrl = await QRCodeLib.toDataURL(paymentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      // console.error("Error generating QR code:", error);
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, generateQRCode]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // console.error("Failed to copy:", error);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      action: () => window.open(generateWhatsAppUrl(shareText), "_blank"),
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-primary-500 hover:bg-primary-600",
      action: () => window.open(generateTelegramUrl(shareText), "_blank"),
    },
    {
      name: "SMS",
      icon: MessageCircle,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => window.open(generateSMSUrl(shareText), "_blank"),
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-red-500 hover:bg-red-600",
      action: () =>
        window.open(
          generateEmailUrl(`Payment Request: ${amount} ${token}`, shareText),
          "_blank"
        ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Request Created! 🎉
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {amount} {token}
              </div>
              <div className="text-gray-600 mt-1">{memo}</div>
            </div>
          </div>

          {/* Payment Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono break-all">
                {paymentUrl}
              </div>
              <button
                onClick={() => copyToClipboard(paymentUrl)}
                className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                title="Copy link"
                aria-label="Copy payment link"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* QR Code Toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? "Hide" : "Show"} QR Code
            </button>
          </div>

          {/* QR Code */}
          {showQR && qrCodeUrl && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Scan to pay with any Aptos wallet
              </p>
            </div>
          )}

          {/* Share Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share via
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 ${option.color} text-white rounded-lg font-medium transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy Full Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or copy the full message
            </label>
            <div className="relative">
              <textarea
                value={shareText}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
                rows={4}
                title="Share message text"
                aria-label="Share message text"
              />
              <button
                onClick={() => copyToClipboard(shareText)}
                className="absolute top-2 right-2 p-1 bg-white hover:bg-gray-100 border border-gray-200 rounded transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onNewRequest}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
