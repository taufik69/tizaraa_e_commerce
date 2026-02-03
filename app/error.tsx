// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-linear-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Something Went Wrong!
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          We're sorry, but something unexpected happened. Our team has been
          notified and we're working to fix it.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-lg mx-auto">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Error Details (Development Only):
            </h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-gary-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-gray-500 hover:text-gray-600 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If this problem persists, please contact our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-600 font-semibold transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </Link>
        </div>

        {/* Error ID (if available) */}
        {error.digest && (
          <p className="mt-6 text-sm text-gray-500">
            Error Reference: <code className="font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
