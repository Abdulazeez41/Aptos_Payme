import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Globe,
  Shield,
  QrCode,
  Share2,
  History,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";

export const Home: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 lg:py-20">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-full mb-6">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            Aptos <span className="text-primary-500">PayMe</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-2">
            PayPal.Me, But On-Chain
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A one-click, global, on-chain payment request system built on Aptos.
            Generate shareable payment links that anyone can pay instantly with
            crypto.
          </p>
        </div>

        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/request"
              className="inline-flex items-center px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg"
            >
              Create Payment Link
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl font-semibold text-lg transition-colors"
            >
              View History
              <History className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-yellow-800 font-medium mb-2">
              Connect your wallet to get started
            </p>
            <p className="text-yellow-600 text-sm">
              You'll need an Aptos wallet like Petra, Martian, or Pontem to
              create and pay payment requests.
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="py-12 lg:py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Aptos PayMe?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Instant on-chain payments with Aptos' sub-second finality. No
              waiting, no delays.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Global & Permissionless
            </h3>
            <p className="text-gray-600">
              Send and receive payments anywhere in the world. No bank accounts
              or geo-restrictions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure & Transparent
            </h3>
            <p className="text-gray-600">
              All transactions are on-chain and verifiable. Your funds are
              always in your control.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              QR Code Ready
            </h3>
            <p className="text-gray-600">
              Perfect for in-person payments. Generate QR codes for cafes,
              markets, and events.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Sharing
            </h3>
            <p className="text-gray-600">
              Share payment links via WhatsApp, Telegram, SMS, or email with one
              click.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Full History
            </h3>
            <p className="text-gray-600">
              Track all your payment requests with detailed history and export
              capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-12 lg:py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Perfect For
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🍕 Splitting Bills
            </h3>
            <p className="text-gray-600 mb-4">
              Alice splits lunch with 3 friends by sharing a payment link via
              WhatsApp — they pay instantly in USDT.
            </p>
            <div className="text-sm text-gray-500">
              Solves micro-splitting without cash or IOUs.
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💼 Freelance Work
            </h3>
            <p className="text-gray-600 mb-4">
              Bob sends client a payment link after delivering work — they pay
              and Bob gets notified on-chain.
            </p>
            <div className="text-sm text-gray-500">
              No invoicing tools needed. Global, instant settlement.
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              👨‍👩‍👧 Family Allowances
            </h3>
            <p className="text-gray-600 mb-4">
              Carol creates an allowance link for her child abroad — child
              claims funds anytime, with on-chain proof.
            </p>
            <div className="text-sm text-gray-500">
              Transparent, self-custodial, no bank delays.
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏪 Small Business
            </h3>
            <p className="text-gray-600 mb-4">
              Dave displays a QR code at his food stall — customers scan & pay
              without needing an app.
            </p>
            <div className="text-sm text-gray-500">
              Low barrier to entry for crypto commerce.
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {isConnected && (
        <div className="text-center py-12 lg:py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your first payment request and experience the future of P2P
            payments on Aptos.
          </p>
          <Link
            to="/request"
            className="inline-flex items-center px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg"
          >
            Create Payment Request
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
};
