// src/components/product/PricingDisplay.tsx
"use client";

import React, { useState } from "react";
import { Product } from "@/data/mockData";
import { useAppDispatch } from "@/features/store/hooks/hooks";
import {
  addToCartAsync,
  optimisticAddToCart,
} from "@/features/slices/cartSlice";
import Link from "next/link";

interface PricingDisplayProps {
  product: Product;
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  };
  quantity: number;
  onQuantityChange: (qty: number) => void;
  selectedImage: {
    image: string;
    index: number;
  };
}

export default function PricingDisplay({
  product,
  selectedVariants,
  quantity,
  onQuantityChange,
  selectedImage,
}: PricingDisplayProps) {
  const dispatch = useAppDispatch();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  // Quantity discount
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

  const finalTotal = subtotal - quantityDiscount;

  const handleAddToCart = async () => {
    if (!colorVariant || !materialVariant || !sizeVariant) {
      alert("Please select all product variants");
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        key: `${product.id}-${selectedVariants.color}-${selectedVariants.material}-${selectedVariants.size}`,
        productId: product.id,
        selectedVariants: {
          color: selectedVariants.color,
          material: selectedVariants.material,
          size: selectedVariants.size,
        },
        quantity,
        addedAt: new Date().toISOString(),
        selectedImage, // ✅ persist selected image
      };

      // Optimistic update
      dispatch(optimisticAddToCart(cartItem as any));

      // Actual async operation
      await dispatch(addToCartAsync(cartItem as any)).unwrap();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 sticky top-4">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900 mb-1">
          Quantity
        </label>

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
          <div className="flex justify-between text-gray-600">
            <span>Base Price</span>
            <span>৳{basePrice.toLocaleString()}</span>
          </div>

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

          <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
            <span>Unit Price</span>
            <span>৳{configuratedPrice.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Quantity</span>
            <span>× {quantity}</span>
          </div>

          <div className="flex justify-between font-medium text-gray-900">
            <span>Subtotal</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>

          {quantityDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Quantity Discount ({quantityDiscountPercent}%)</span>
              <span>-৳{quantityDiscount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t-2 border-gray-900">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <div className="text-right">
            {quantityDiscount > 0 && (
              <p className="text-sm text-green-600 font-medium mb-1">
                You save ৳{quantityDiscount.toLocaleString()}!
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
        className="w-full py-4 bg-gray-800 hover:bg-gray-700 cursor-pointer text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding to Cart...
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>

      {/* cart page */}
      <Link
        href={"/cart"}
        className="w-full h-full text-center bg-red-500 block py-4"
      >
        cart
      </Link>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <p>✓ Free shipping on orders above ৳20,000</p>
        <p>✓ 30-day easy returns</p>
        <p>✓ 1-year warranty included</p>
      </div>
    </div>
  );
}
