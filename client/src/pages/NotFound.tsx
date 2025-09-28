import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Zap,
  Star,
  Sparkles,
  RefreshCw,
  Search,
  Coins,
  TrendingUp,
} from "lucide-react";

export const NotFound: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const [floatingElements, setFloatingElements] = useState<
    { id: number; x: number; y: number; delay: number }[]
  >([]);
  const [glitchText, setGlitchText] = useState("404");

  // Generate random stars for background animation
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  // Generate floating background elements (same as Home page)
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

  // Glitch effect for 404 text
  useEffect(() => {
    const glitchTexts = ["404", "4Ø4", "4０4", "40４", "４04", "404"];
    let index = 0;

    const glitchInterval = setInterval(() => {
      setGlitchText(glitchTexts[index]);
      index = (index + 1) % glitchTexts.length;
    }, 150);

    const resetInterval = setInterval(() => {
      setGlitchText("404");
    }, 2000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(resetInterval);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900/80 to-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Floating Background Elements (same as Home page) */}
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

      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Star
              className="w-1 h-1 text-primary-300 fill-current opacity-60"
              style={{
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Floating Orbs (same style as Home page) */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-400 to-primary-400 rounded-full blur-2xl opacity-15 animate-bounce-in"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-25 animate-spin-slow"></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div> */}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* 404 Glitch Text */}
        <div className="mb-8">
          <h1
            className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 animate-pulse select-none"
            style={{
              textShadow: "0 0 30px rgba(123, 44, 191, 0.5)",
              fontFamily: "monospace",
            }}
          >
            {glitchText}
          </h1>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Sparkles className="w-6 h-6 text-primary-400 animate-spin" />
            <p className="text-xl md:text-2xl text-gray-300 font-medium">
              Page Not Found
            </p>
            <Sparkles className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        </div>

        {/* Description */}
        <div className="mb-12 space-y-4">
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Oops! Looks like you've ventured into the void of the blockchain.
            This page doesn't exist in our PayMe universe.
          </p>
          <div className="flex justify-center items-center space-x-2 text-gray-500">
            <Search className="w-4 h-4" />
            <p className="text-sm">
              The page you're looking for might have been moved, deleted, or
              never existed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-bounce-in">
          <Link
            to="/"
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-primary-500/25 hover:scale-105 transform overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Home className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            Go Home
            <Zap className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity group-hover:animate-pulse" />
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 transform hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:animate-pulse group-hover:translate-x-[-2px] transition-transform" />
            Go Back
            <TrendingUp className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
          </button>

          <button
            onClick={handleRefresh}
            className="group inline-flex items-center px-8 py-4 bg-transparent hover:bg-primary-500/10 text-primary-400 hover:text-primary-300 border border-primary-500/30 hover:border-primary-400 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-primary-500/20"
          >
            <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
            Refresh
            <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity group-hover:animate-pulse" />
          </button>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl font-bold text-primary-400 mb-2 group-hover:scale-110 transition-transform">
              0
            </div>
            <div className="text-sm text-gray-400">Pages Found</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              ∞
            </div>
            <div className="text-sm text-gray-400">Possibilities</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="text-3xl font-bold text-pink-400 mb-2 group-hover:scale-110 transition-transform">
              1
            </div>
            <div className="text-sm text-gray-400">Way Home</div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500/10 backdrop-blur-sm rounded-full border border-primary-500/20">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-primary-300 font-medium">
              Built on Aptos • PayMe v1.0.0
            </p>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
