// src/components/cart/SavedForLaterItem.tsx
"use client";

import React from "react";
import { CartItem } from "@/data/mockData";
import { useAppDispatch } from "@/features/store/hooks/hooks";
import { moveToCartAsync } from "@/features/slices/cartSlice";
import { getProductById } from "@/data/mockData";

interface SavedForLaterItemProps {
  item: CartItem & { id: number };
}

export default function SavedForLaterItem({ item }: SavedForLaterItemProps) {
  const dispatch = useAppDispatch();

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

  const handleMoveToCart = async () => {
    try {
      await dispatch(
        moveToCartAsync({
          savedItemId: item.id,
          item: {
            key: item.key,
            productId: item.productId,
            selectedVariants: item.selectedVariants,
            quantity: item.quantity,
            addedAt: item.addedAt,
          },
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to move to cart:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {product.name}
          </h3>

          <div className="text-xs text-gray-600 mb-3 space-y-1">
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: colorVariant?.hex }}
              />
              <span className="truncate">{colorVariant?.name}</span>
            </div>
            <div className="truncate">{materialVariant?.name}</div>
            <div className="truncate">{sizeVariant?.name}</div>
          </div>

          <button
            onClick={handleMoveToCart}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Move to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
