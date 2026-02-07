"use client";

import React, { useState } from "react";
import CartItem from "./CartItem";
import SavedForLaterItem from "./SavedForLaterItem";
import RecentlyViewed from "./RecentlyViewed";

import { useAppDispatch, useAppSelector } from "@/features/store/hooks/hooks";
import {
  clearCartAsync,
  applyPromoCode,
  removePromoCode,
} from "@/features/slices/cartSlice";

import {
  selectCartItems,
  selectSavedForLater,
  selectSyncStatus,
  selectLoading,
  selectCartDerived,
} from "@/features/slices/cartSelectors";

import { validatePromoCode } from "@/data/mockData";
import ConfirmModal from "../ui/ConfirmModal";
import Link from "next/link";

export default function Cart() {
  const dispatch = useAppDispatch();

  // store data
  const items = useAppSelector(selectCartItems);
  const savedForLater = useAppSelector(selectSavedForLater);
  const syncStatus = useAppSelector(selectSyncStatus);
  const loading = useAppSelector(selectLoading);

  // derived totals (same UI vars)
  const {
    cartCount,
    subtotal,
    quantityDiscount,
    appliedPromoCode,
    promoDiscount,
    total,
    totalSavings,
    lowStockItems,
    bundleDiscounts,
  } = useAppSelector(selectCartDerived);

  // local UI state
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const baseForPromo = subtotal - quantityDiscount;
    const result = validatePromoCode(promoCode, baseForPromo);

    if (result.valid) {
      dispatch(
        applyPromoCode({
          code: promoCode.toUpperCase(),
          discount: result.discount,
        }),
      );
      setPromoCode("");
      setPromoError("");
    } else {
      setPromoError(result.message);
    }

    setIsApplyingPromo(false);
  };

  const handleClearCart = () => setClearOpen(true);

  const confirmClearCart = async () => {
    setClearLoading(true);
    try {
      await dispatch(clearCartAsync()).unwrap();
      setClearOpen(false);
    } catch (err) {
      console.error("Failed to clear cart", err);
    } finally {
      setClearLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Sync Status */}
            {syncStatus === "syncing" && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </div>
            )}

            {/* Clear cart button responsive */}
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="w-full sm:w-auto px-4 py-2 text-red-600 border border-red-300 cursor-pointer hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Warnings */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-orange-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Low Stock Alert
                </h3>
                <div className="space-y-1">
                  {lowStockItems.map((item: any) => (
                    <p
                      key={item.id}
                      className="text-sm text-orange-800 wrap-break-word"
                    >
                      {item.productName}: Only {item.stock} left in stock (you
                      requested {item.requested})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Discounts */}
        {bundleDiscounts.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-green-900 mb-2">
                  Bundle Deals Available! 🎉
                </h3>
                <div className="space-y-1">
                  {bundleDiscounts.map((bundle: any, index: number) => (
                    <p
                      key={index}
                      className="text-sm text-green-800 wrap-break-word"
                    >
                      {bundle.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Add some products to get started!
            </p>
            <a
              href="/"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {items.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              {/* ✅ on mobile: normal block, on lg+: sticky */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6 lg:sticky lg:top-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 gap-3">
                    <span className="min-w-0 truncate">
                      Subtotal ({cartCount} items)
                    </span>
                    <span className="shrink-0">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {quantityDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium gap-3">
                      <span className="min-w-0 truncate">
                        Quantity Discount
                      </span>
                      <span className="shrink-0">
                        -৳{quantityDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {appliedPromoCode && (
                    <div className="flex justify-between text-blue-600 font-medium gap-3">
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="truncate">
                          Promo: {appliedPromoCode.code}
                        </span>
                        <button
                          onClick={() => dispatch(removePromoCode())}
                          className="text-red-500 hover:text-red-700 shrink-0"
                          title="Remove promo"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                      <span className="shrink-0">
                        -৳{promoDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 gap-3">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium shrink-0">
                      {total >= 20000 ? "FREE" : "৳100"}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                {!appliedPromoCode && (
                  <div className="space-y-2 pt-4 border-t">
                    <label className="text-sm font-semibold text-gray-900">
                      Have a promo code?
                    </label>

                    {/* ✅ mobile: stack, sm+: row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyPromo()
                        }
                        placeholder="Enter code"
                        className="w-full sm:flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-500 text-sm uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {isApplyingPromo ? "Checking..." : "Apply"}
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-xs text-red-600">{promoError}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Try: WELCOME10, SAVE500, MEGA25
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="pt-4 border-t-2 border-gray-900">
                  {totalSavings > 0 && (
                    <p className="text-sm text-green-600 font-medium mb-2">
                      You save ৳{totalSavings.toLocaleString()}!
                    </p>
                  )}

                  {/* ✅ mobile: stack, sm+: row */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ৳{(total >= 20000 ? total : total + 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href={"/checkout"}
                  className="w-full block text-center py-3 sm:py-4 bg-gray-700 hover:bg-gray-900 cursor-pointer text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </Link>

                {/* Additional Info */}
                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                  <p>✓ Free shipping on orders above ৳20,000</p>
                  <p>✓ 30-day easy returns</p>
                  <p>✓ Secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved for Later */}
        {savedForLater.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Saved for Later ({savedForLater.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForLater.map((item) => (
                <SavedForLaterItem key={item.key} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />

        <ConfirmModal
          open={clearOpen}
          title="Clear cart?"
          message="Are you sure you want to clear your cart? This action cannot be undone."
          confirmText="Yes, clear cart"
          cancelText="No, keep items"
          danger
          loading={clearLoading}
          onClose={() => (clearLoading ? null : setClearOpen(false))}
          onConfirm={confirmClearCart}
        />
      </div>
    </div>
  );
}
