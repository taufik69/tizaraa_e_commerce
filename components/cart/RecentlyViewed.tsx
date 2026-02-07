// src/components/cart/RecentlyViewed.tsx
"use client";

import React from "react";
import { useAppSelector } from "@/features/store/hooks/hooks";
import { selectRecentlyViewed } from "@/features/slices/cartSelectors";
import { getProductById } from "@/data/mockData";

export default function RecentlyViewed() {
  const recentlyViewedIds = useAppSelector(selectRecentlyViewed);

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => getProductById(id))
    .filter(
      (product): product is NonNullable<typeof product> => product !== null,
    );

  if (recentlyViewedProducts.length === 0) return null;

  return (
    <div className="mt-8 sm:mt-12">
      {/*  Responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Recently Viewed Products
        </h2>
        <p className="text-sm text-gray-500">
          {recentlyViewedProducts.length} item
          {recentlyViewedProducts.length === 1 ? "" : "s"}
        </p>
      </div>

      {/*  Responsive grid: 2 -> 3 -> 4 -> 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {recentlyViewedProducts.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 sm:mb-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>

            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 truncate">
              {product.name}
            </h3>

            {/*  Rating row wraps safely on small devices */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1 min-w-0">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating ?? 0)
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
                <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                  ({product.reviewCount?.toLocaleString?.() ?? 0})
                </span>
              </div>
            </div>

            {/*  Price scales down on mobile */}
            <p className="text-base sm:text-lg font-bold text-gray-900">
              ৳{product.basePrice.toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
