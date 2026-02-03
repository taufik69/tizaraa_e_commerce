// src/components/cart/CartItem.tsx
"use client";

import React, { useState } from "react";
import { CartItem as CartItemType } from "@/data/mockData";

import {
  getProductById,
  getStockLevel,
  getStockMessage,
} from "@/data/mockData";
import { removeFromCart, updateQuantity } from "@/features/slices/cartSlice";
import SavedForLaterItem from "./SavedForLaterItem";

interface CartItemProps {
  item: CartItemType & { id: number };
}

export default function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const product = getProductById(item.productId);
  if (!product) return null;

  const colorVariant = product.variants.colors.find(
    (c) => c.id === item.selectedVariants.color,
  );
  const materialVariant = product.variants.materials.find(
    (m) => m.id === item.selectedVariants.material,
  );
  const sizeVariant = product.variants.sizes.find(
    (s) => s.id === item.selectedVariants.size,
  );

  const basePrice = product.basePrice;
  const colorModifier = colorVariant?.priceModifier || 0;
  const materialModifier = materialVariant?.priceModifier || 0;
  const sizeModifier = sizeVariant?.priceModifier || 0;

  const unitPrice = basePrice + colorModifier + materialModifier + sizeModifier;

  // Calculate quantity discount for this item
  let discountPercent = 0;
  if (item.quantity >= 10) discountPercent = 15;
  else if (item.quantity >= 5) discountPercent = 10;
  else if (item.quantity >= 3) discountPercent = 5;

  const subtotal = unitPrice * item.quantity;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const itemTotal = subtotal - discount;

  // Stock check
  const minStock = Math.min(
    colorVariant?.stock || 0,
    materialVariant?.stock || 0,
    sizeVariant?.stock || 0,
  );
  const stockLevel = getStockLevel(minStock);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 999) return;

    setIsUpdating(true);
    try {
      updateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm("Remove this item from your cart?")) {
      try {
        removeFromCart(item.id);
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    }
  };

  const handleSaveForLater = () => {
    try {
      SavedForLaterItem(item.id, item);
    } catch (error) {
      console.error("Failed to save for later:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Remove from cart"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Variant Info */}
          <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: colorVariant?.hex }}
              />
              <span>{colorVariant?.name}</span>
            </div>
            <span>•</span>
            <span>{materialVariant?.name}</span>
            <span>•</span>
            <span>{sizeVariant?.name}</span>
          </div>

          {/* Stock Warning */}
          {stockLevel === "low" && (
            <div className="mb-3 text-sm text-orange-600 font-medium">
              ⚠️ {getStockMessage(minStock)}
            </div>
          )}

          {stockLevel === "out" && (
            <div className="mb-3 text-sm text-red-600 font-bold">
              ❌ Out of stock
            </div>
          )}

          {/* Quantity Discount Badge */}
          {discountPercent > 0 && (
            <div className="inline-block mb-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              {discountPercent}% Quantity Discount Applied!
            </div>
          )}

          {/* Quantity Selector and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="w-8 h-8 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 text-black"
              >
                <svg
                  className="w-4 h-4"
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
                value={item.quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleQuantityChange(Math.max(1, Math.min(999, val)));
                }}
                disabled={isUpdating}
                className="w-16 h-8 text-center font-semibold border-2 border-gray-900 text-black rounded-lg focus:border-blue-500 focus:outline-none"
              />

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= minStock}
                className="w-8 h-8 rounded-lg border-2 border-gray-900 text-black flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                <svg
                  className="w-4 h-4"
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

            <div className="text-right">
              {discount > 0 && (
                <p className="text-sm text-gray-500 line-through">
                  ৳{subtotal.toLocaleString()}
                </p>
              )}
              <p className="text-xl font-bold text-gray-900">
                ৳{itemTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ৳{unitPrice.toLocaleString()} each
              </p>
            </div>
          </div>

          {/* Save for Later Button */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <button
              onClick={handleSaveForLater}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Save for Later
            </button>

            {/* Hints for more discount */}
            {item.quantity < 3 && (
              <p className="text-xs text-gray-500">
                Add {3 - item.quantity} more for 5% off
              </p>
            )}
            {item.quantity >= 3 && item.quantity < 5 && (
              <p className="text-xs text-green-600">
                Add {5 - item.quantity} more for 10% off
              </p>
            )}
            {item.quantity >= 5 && item.quantity < 10 && (
              <p className="text-xs text-green-600">
                Add {10 - item.quantity} more for 15% off
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
