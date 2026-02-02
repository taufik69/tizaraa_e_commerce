// src/components/cart/RecentlyViewed.tsx
"use client";

import React from "react";
import { useCart } from "@/features/store/hooks/useCart";

export default function RecentlyViewed() {
  const { recentlyViewedProducts } = useCart();

  if (recentlyViewedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recentlyViewedProducts.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviewCount})
              </span>
            </div>

            <p className="text-lg font-bold text-gray-900">
              ৳{product.basePrice.toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
