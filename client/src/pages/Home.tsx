import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Globe,
  Shield,
  QrCode,
  Share2,
  History,
  Sparkles,
  Star,
  Coins,
  TrendingUp,
} from "lucide-react";
import aptosPaymeLogo from "../assets/aptos_payme_logo.png";
import { useWallet } from "../hooks/useWallet";

export const Home: React.FC = () => {
  const { isConnected } = useWallet();
  const [floatingElements, setFloatingElements] = useState<
    { id: number; x: number; y: number; delay: number }[]
  >([]);

  // Generate floating background elements
  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
      });
    }
    setFloatingElements(elements);
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute opacity-10"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
            }}
          >
            {element.id % 3 === 0 ? (
              <Coins className="w-6 h-6 text-primary-500 animate-bounce" />
            ) : element.id % 3 === 1 ? (
              <Star className="w-4 h-4 text-purple-500 animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5 text-pink-500 animate-spin-slow" />
            )}
          </div>
        ))}
      </div>
      {/* Hero Section */}
      <div className="relative text-center py-12 lg:py-20">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-400 to-primary-400 rounded-full blur-2xl opacity-15 animate-bounce-in"></div>
        </div>

        <div className="relative z-10 mb-8 animate-fade-in">
          <div className="group inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-lg hover:shadow-primary-500/25 transition-all duration-300 hover:scale-110 cursor-pointer p-2">
            <img
              src={aptosPaymeLogo}
              alt="Aptos PayMe Logo"
              className="w-full h-full object-contain group-hover:animate-pulse"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 animate-slide-up">
            Aptos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 animate-pulse">
              PayMe
            </span>
          </h1>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-500 animate-bounce" />
            <p className="text-xl lg:text-2xl text-gray-600 font-medium">
              PayPal.Me, But On-Chain
            </p>
            <TrendingUp
              className="w-6 h-6 text-primary-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The <span className="font-semibold text-primary-600">payments rail</span> that powers the Aptos ecosystem.{" "}
            <span className="font-semibold text-purple-600">Create</span>,{" "}
            <span className="font-semibold text-pink-600">share</span>, and{" "}
            <span className="font-semibold text-green-600">receive</span>{" "}
            payments as easily as sharing a link. Built for the future of money.
          </p>
        </div>

        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounce-in">
            <Link
              to="/request"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-primary-500/25 hover:scale-105 transform overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Create Payment Link
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/history"
              className="group inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-primary-300 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
            >
              <History className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              View History
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        ) : (
          <div className="group bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-300 rounded-xl p-6 max-w-md mx-auto hover:shadow-lg transition-all duration-300 animate-bounce-in">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              <p className="text-yellow-800 font-medium">
                Connect your wallet to get started
              </p>
              <Sparkles className="w-4 h-4 text-yellow-600 ml-2 group-hover:animate-spin" />
            </div>
            <p className="text-yellow-600 text-sm text-center">
              You'll need an Aptos wallet like{" "}
              <span className="font-semibold">Petra</span>,{" "}
              <span className="font-semibold">Martian</span>, or{" "}
              <span className="font-semibold">Pontem</span> to create and pay
              payment requests.
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="relative py-12 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
              Aptos PayMe
            </span>
            ?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 group-hover:from-primary-500 group-hover:to-primary-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <Zap className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors duration-300 group-hover:animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 mb-2 transition-colors">
              Lightning Fast ⚡
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Instant on-chain payments with Aptos' sub-second finality. No
              waiting, no delays.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
          </div>

          <div
            className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 group-hover:from-green-500 group-hover:to-green-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <Globe className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300 group-hover:animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 mb-2 transition-colors">
              Global & Permissionless 🌍
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Send and receive money anywhere, anytime. No borders, no banks, no
              barriers—just pure financial freedom.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
          </div>

          <div
            className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 group-hover:from-purple-500 group-hover:to-purple-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <Shield className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300 group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 mb-2 transition-colors">
              Secure & Transparent 🛡️
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              All transactions are on-chain and verifiable. Your funds are
              always in your control.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
          </div>

          <div
            className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 group-hover:from-primary-500 group-hover:to-primary-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <QrCode className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors duration-300 group-hover:animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 mb-2 transition-colors">
              QR Code Ready 📱
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Perfect for in-person payments. Generate QR codes for cafes,
              markets, and events.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
          </div>

          <div
            className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 group-hover:from-orange-500 group-hover:to-orange-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <Share2 className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300 group-hover:animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 mb-2 transition-colors">
              Easy Sharing 🚀
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Share payment links via WhatsApp, Telegram, SMS, or email with one
              click.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-300"></div>
          </div>

          <div
            className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-red-200 hover:shadow-xl transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 group-hover:from-red-500 group-hover:to-red-600 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
              <History className="w-6 h-6 text-red-600 group-hover:text-white transition-colors duration-300 group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-700 mb-2 transition-colors">
              Full History 📊
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Track all your payment requests with detailed history and export
              capabilities.
            </p>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="relative py-12 lg:py-16  ">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-500 rounded-full blur-lg"></div>
        </div>

        <div className="relative ">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
              Perfect For{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
                Everyone
              </span>
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-4 h-4 text-primary-500 animate-pulse" />
              <p className="text-gray-600">Real-world use cases that matter</p>
              <Star className="w-4 h-4 text-primary-500 animate-pulse" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 border border-gray-100 hover:border-primary-200">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3 group-hover:animate-bounce">
                  🍕
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Splitting Bills
                </h3>
              </div>
              <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                Alice splits lunch with 3 friends by sharing a payment link via
                WhatsApp — they pay instantly in USDC.
              </p>
              <div className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors font-medium">
                ✨ Solves micro-splitting without cash or IOUs.
              </div>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 border border-gray-100 hover:border-purple-200">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3 group-hover:animate-bounce">
                  💼
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Freelance Work
                </h3>
              </div>
              <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                Bob sends client a payment link after delivering work — they pay
                and Bob gets notified on-chain.
              </p>
              <div className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors font-medium">
                ✨ No invoicing tools needed. Global, instant settlement.
              </div>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 border border-gray-100 hover:border-green-200">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3 group-hover:animate-bounce">
                  👨‍👩‍👧
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  Family Allowances
                </h3>
              </div>
              <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                Carol creates an allowance link for her child abroad — child
                claims funds anytime, with on-chain proof.
              </p>
              <div className="text-sm text-gray-500 group-hover:text-green-600 transition-colors font-medium">
                ✨ Transparent, self-custodial, no bank delays.
              </div>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102 transform hover:-translate-y-1 border border-gray-100 hover:border-orange-200">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3 group-hover:animate-bounce">
                  🏪
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                  Small Business
                </h3>
              </div>
              <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                Dave displays a QR code at his food stall — customers scan & pay
                without needing an app.
              </p>
              <div className="text-sm text-gray-500 group-hover:text-orange-600 transition-colors font-medium">
                ✨ Low barrier to entry for crypto commerce.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {isConnected && (
        <div className="relative text-center py-12 lg:py-16 ">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="relative  animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary-500 animate-spin mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Ready to get started?
              </h2>
              <Sparkles className="w-8 h-8 text-primary-500 animate-spin ml-3" />
            </div>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create your first payment request and experience the{" "}
              <span className="font-semibold text-primary-600">future</span> of
              P2P payments on{" "}
              <span className="font-semibold text-purple-600">Aptos</span>.
            </p>

            <Link
              to="/request"
              className=" items-center px-5 py-5 w-60  bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 hover:from-primary-600 hover:via-primary-700 hover:to-purple-700 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-110 transform overflow-hidden"
            >
              Create Payment Request
            </Link>

            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></div>
                <span>Global Reach</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2"></div>
                <span>Secure & Fast</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
