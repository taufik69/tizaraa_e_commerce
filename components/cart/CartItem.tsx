// src/components/cart/CartItem.tsx
"use client";

import React, { useState } from "react";
import { CartItem as CartItemType } from "@/data/mockData";
import ConfirmModal from "@/components/ui/ConfirmModal";

import {
  getProductById,
  getStockLevel,
  getStockMessage,
} from "@/data/mockData";
import { useAppDispatch } from "@/features/store/hooks/hooks";
import {
  removeFromCartAsync,
  updateCartItemAsync,
  saveForLaterAsync,
} from "@/features/slices/cartSlice";

interface CartItemProps {
  item: CartItemType & {
    id: number;
    selectedImage?: {
      image: string;
      index: number;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

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
      await dispatch(
        updateCartItemAsync({
          id: item.id,
          updates: { quantity: newQuantity },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmRemove = async () => {
    setRemoveLoading(true);
    try {
      await dispatch(removeFromCartAsync(item.id)).unwrap();
      setRemoveOpen(false);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleSaveForLater = async () => {
    try {
      await dispatch(
        saveForLaterAsync({
          cartItemId: item.id,
          item: {
            key: item.key,
            productId: item.productId,
            selectedVariants: item.selectedVariants,
            quantity: item.quantity,
            addedAt: item.addedAt,
            selectedImage: item.selectedImage,
          },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to save for later:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      {/* ✅ Mobile: stack | Desktop: row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="w-full sm:w-32 sm:h-32 shrink-0">
          <div className="w-full aspect-square sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
            {item?.selectedImage == null ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              product.images.map((image, index) =>
                index === item?.selectedImage?.index ? (
                  <img
                    key={index}
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : null,
              )
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{product.brand}</p>
            </div>

            <button
              onClick={() => setRemoveOpen(true)}
              className="shrink-0 text-gray-400 hover:text-red-600 transition-colors"
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: colorVariant?.hex }}
              />
              <span className="truncate max-w-35">{colorVariant?.name}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="truncate max-w-40">{materialVariant?.name}</span>
            <span className="text-gray-300">•</span>
            <span className="truncate max-w-40">{sizeVariant?.name}</span>
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

          {/* ✅ Controls + Price responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 border-gray-900 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 text-black"
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
                className="w-20 sm:w-16 h-9 sm:h-8 text-center font-semibold border-2 border-gray-900 text-black rounded-lg focus:border-blue-500 focus:outline-none"
              />

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= minStock}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 border-gray-900 text-black flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
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

              {isUpdating && (
                <span className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-left sm:text-right">
              {discount > 0 && (
                <p className="text-sm text-gray-500 line-through">
                  ৳{subtotal.toLocaleString()}
                </p>
              )}
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ৳{itemTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ৳{unitPrice.toLocaleString()} each
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <button
              onClick={handleSaveForLater}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium w-fit"
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

      <ConfirmModal
        open={removeOpen}
        title="Remove item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Yes, remove"
        cancelText="No, keep"
        danger
        loading={removeLoading}
        onClose={() => (removeLoading ? null : setRemoveOpen(false))}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
