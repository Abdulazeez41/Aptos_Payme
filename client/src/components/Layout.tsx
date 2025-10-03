import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, QrCode, History, Menu, X, Wallet } from "lucide-react";
import { useState } from "react";
import { WalletSelector } from "./WalletSelector";
import { ThemeToggle } from "./ThemeToggle";
import aptosPaymeLogo from "../assets/aptos_payme_logo.png";
// import { useWallet } from "../hooks/useWallet";

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  // const { isConnected } = useWallet();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Send", href: "/send", icon: Wallet },
    { name: "Request", href: "/request", icon: QrCode },
    { name: "History", href: "/history", icon: History },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={aptosPaymeLogo}
              alt="Aptos PayMe Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold text-gray-900">PayMe</span>
          </Link>

          <div className="flex items-center ml-7 space-x-2">
            <ThemeToggle />
            <WalletSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center flex-shrink-0 px-6 py-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={aptosPaymeLogo}
                alt="Aptos PayMe Logo"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <span className="text-xl font-bold text-gray-900">
                  Aptos PayMe
                </span>
                <p className="text-xs text-gray-500">PayPal.Me, But On-Chain</p>
              </div>
            </Link>
          </div>

          <div className="px-6 py-2 flex items-center justify-between">
            <WalletSelector />
            <ThemeToggle />
          </div>

          <nav className="flex-1 px-6 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Built on Aptos • v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="grid grid-cols-3 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-1 text-xs ${
                  isActive(item.href)
                    ? "text-primary-600"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
