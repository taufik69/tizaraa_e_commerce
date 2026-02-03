"use client";
import Link from "next/link";
import { Home, Search, ShoppingCart, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-linear-to-r from-gray-600 to-gray-600 bg-clip-text mb-4 animate-pulse">
            404
          </h1>
          <div className="flex justify-center gap-4 mb-6">
            <div
              className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for seems to have wandered off. Don't worry,
          even the best explorers get lost sometimes!
        </p>

        {/* Illustration or Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-500 hover:text-gray-600 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            Browse Products
          </Link>
        </div>

        {/* Go Back Option */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-600 transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
