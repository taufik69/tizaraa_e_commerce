// src/components/product/PricingDisplay.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/data/mockData";
import { calculateProductPrice, validatePromoCode } from "@/data/mockData";

interface PricingDisplayProps {
  product: Product;
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  };
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export default function PricingDisplay({
  product,
  selectedVariants,
  quantity,
  onQuantityChange,
}: PricingDisplayProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Calculate pricing breakdown
  const basePrice = product.basePrice;

  const colorVariant = product.variants.colors.find(
    (c) => c.id === selectedVariants.color,
  );
  const materialVariant = product.variants.materials.find(
    (m) => m.id === selectedVariants.material,
  );
  const sizeVariant = product.variants.sizes.find(
    (s) => s.id === selectedVariants.size,
  );

  const colorModifier = colorVariant?.priceModifier || 0;
  const materialModifier = materialVariant?.priceModifier || 0;
  const sizeModifier = sizeVariant?.priceModifier || 0;

  const configuratedPrice =
    basePrice + colorModifier + materialModifier + sizeModifier;
  const subtotal = configuratedPrice * quantity;

  // Calculate quantity discount
  let quantityDiscount = 0;
  let quantityDiscountPercent = 0;
  if (quantity >= 10) {
    quantityDiscountPercent = 15;
    quantityDiscount = Math.round(subtotal * 0.15);
  } else if (quantity >= 5) {
    quantityDiscountPercent = 10;
    quantityDiscount = Math.round(subtotal * 0.1);
  } else if (quantity >= 3) {
    quantityDiscountPercent = 5;
    quantityDiscount = Math.round(subtotal * 0.05);
  }

  const afterQuantityDiscount = subtotal - quantityDiscount;

  // Calculate promo discount
  const promoDiscount = promoApplied?.discount || 0;

  // Final total
  const finalTotal = afterQuantityDiscount - promoDiscount;

  // Total savings
  const totalSavings = quantityDiscount + promoDiscount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = validatePromoCode(promoCode, afterQuantityDiscount);

    if (result.valid) {
      setPromoApplied({
        code: promoCode.toUpperCase(),
        discount: result.discount,
      });
      setPromoError("");
      setPromoCode("");
    } else {
      setPromoError(result.message);
      setPromoApplied(null);
    }

    setIsApplyingPromo(false);
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoError("");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 sticky top-4">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => quantity > 1 && onQuantityChange(quantity - 1)}
            className="w-10 h-10 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 text-black cursor-pointer"
            disabled={quantity <= 1}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <input
            type="number"
            min="1"
            max="999"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onQuantityChange(Math.max(1, Math.min(999, val)));
            }}
            className="w-20 h-10 text-center text-lg cursor-pointer font-semibold border-2 text-black border-gray-900 rounded-lg focus:border-blue-500 focus:outline-none"
          />

          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-10 h-10 rounded-lg border-2 cursor-pointer border-gray-900 text-black flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Quantity Discount Hints */}
        {quantity < 3 && (
          <p className="text-xs text-gray-500">
            💡 Buy 3+ for 5% off, 5+ for 10% off, 10+ for 15% off
          </p>
        )}
        {quantity >= 3 && quantity < 5 && (
          <p className="text-xs text-green-600 font-medium">
            🎉 5% discount applied! Add 2 more for 10% off
          </p>
        )}
        {quantity >= 5 && quantity < 10 && (
          <p className="text-xs text-green-600 font-medium">
            🎉 10% discount applied! Add 5 more for 15% off
          </p>
        )}
        {quantity >= 10 && (
          <p className="text-xs text-green-600 font-medium">
            🎉 Maximum 15% discount applied!
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 py-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Price Breakdown</h3>

        <div className="space-y-2 text-sm">
          {/* Base Price */}
          <div className="flex justify-between text-gray-600">
            <span>Base Price</span>
            <span>৳{basePrice.toLocaleString()}</span>
          </div>

          {/* Variant Modifiers */}
          {colorModifier !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: colorVariant?.hex }}
                />
                {colorVariant?.name}
              </span>
              <span className="text-green-600">
                +৳{colorModifier.toLocaleString()}
              </span>
            </div>
          )}

          {materialModifier !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{materialVariant?.name}</span>
              <span className="text-green-600">
                +৳{materialModifier.toLocaleString()}
              </span>
            </div>
          )}

          {sizeModifier !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{sizeVariant?.name}</span>
              <span
                className={
                  sizeModifier > 0 ? "text-green-600" : "text-orange-600"
                }
              >
                {sizeModifier > 0 ? "+" : ""}৳{sizeModifier.toLocaleString()}
              </span>
            </div>
          )}

          {/* Configured Unit Price */}
          <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
            <span>Unit Price</span>
            <span>৳{configuratedPrice.toLocaleString()}</span>
          </div>

          {/* Quantity */}
          <div className="flex justify-between text-gray-600">
            <span>Quantity</span>
            <span>× {quantity}</span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between font-medium text-gray-900">
            <span>Subtotal</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>

          {/* Quantity Discount */}
          {quantityDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Quantity Discount ({quantityDiscountPercent}%)</span>
              <span>-৳{quantityDiscount.toLocaleString()}</span>
            </div>
          )}

          {/* Promo Discount */}
          {promoApplied && (
            <div className="flex justify-between text-blue-600 font-medium">
              <span className="flex items-center gap-1">
                Promo: {promoApplied.code}
                <button
                  onClick={handleRemovePromo}
                  className="text-red-500 hover:text-red-700"
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
              <span>-৳{promoDiscount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Promo Code Input */}
      {!promoApplied && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">
            Have a promo code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 placeholder:text-black text-black rounded-lg focus:outline-none focus:border-blue-500 text-sm uppercase"
            />
            <button
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isApplyingPromo ? "Checking..." : "Apply"}
            </button>
          </div>
          {promoError && <p className="text-xs text-red-600">{promoError}</p>}
          <p className="text-xs text-gray-500">
            Try: WELCOME10, SAVE500, MEGA25
          </p>
        </div>
      )}

      {/* Total */}
      <div className="pt-4 border-t-2 border-gray-900">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <div className="text-right">
            {totalSavings > 0 && (
              <p className="text-sm text-green-600 font-medium mb-1">
                You save ৳{totalSavings.toLocaleString()}!
              </p>
            )}
            <p className="text-2xl font-bold text-gray-900">
              ৳{finalTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
        onClick={() =>
          alert("Add to Cart functionality - to be implemented with cart store")
        }
      >
        Add to Cart
      </button>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <p>✓ Free shipping on orders above ৳20,000</p>
        <p>✓ 30-day easy returns</p>
        <p>✓ 1-year warranty included</p>
      </div>
    </div>
  );
}
