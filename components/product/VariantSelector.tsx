// src/components/product/VariantSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Product, Variant } from "@/data/mockData";
import {
  checkVariantCompatibility,
  getStockLevel,
  getStockMessage,
} from "@/data/mockData";

interface VariantSelectorProps {
  product: Product;
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  };
  onVariantChange: (
    type: "color" | "material" | "size",
    variantId: string,
  ) => void;
}

export default function VariantSelector({
  product,
  selectedVariants,
  onVariantChange,
}: VariantSelectorProps) {
  const [incompatibleMessage, setIncompatibleMessage] = useState<string>("");

  // Check compatibility when selection changes
  useEffect(() => {
    const messages: string[] = [];

    // Check each variant type for incompatibilities
    ["colors", "materials", "sizes"].forEach((variantType) => {
      const variants =
        product.variants[variantType as keyof typeof product.variants];
      variants.forEach((variant: Variant) => {
        if (!checkVariantCompatibility(variant, selectedVariants)) {
          messages.push(
            `${variant.name} is not compatible with current selection`,
          );
        }
      });
    });

    if (messages.length > 0) {
      setIncompatibleMessage(messages[0]);
    } else {
      setIncompatibleMessage("");
    }
  }, [selectedVariants, product]);

  const renderColorSelector = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Color</label>
          {selectedVariants.color && (
            <span className="text-sm text-gray-600">
              {
                product.variants.colors.find(
                  (c) => c.id === selectedVariants.color,
                )?.name
              }
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {product.variants.colors.map((color) => {
            const isSelected = selectedVariants.color === color.id;
            const isCompatible = checkVariantCompatibility(
              color,
              selectedVariants,
            );
            const stockLevel = getStockLevel(color.stock);
            const isOutOfStock = stockLevel === "out";
            const isDisabled = !isCompatible || isOutOfStock;

            return (
              <button
                key={color.id}
                onClick={() =>
                  !isDisabled && onVariantChange("color", color.id)
                }
                disabled={isDisabled}
                className={`
                  relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                  ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
                title={
                  isDisabled
                    ? isOutOfStock
                      ? "Out of stock"
                      : "Incompatible with current selection"
                    : ""
                }
              >
                {/* Color Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full border-2 transition-all
                    ${isSelected ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-300"}
                  `}
                  style={{ backgroundColor: color.hex || "#ccc" }}
                />

                {/* Color Name */}
                <span className="text-xs font-medium text-gray-700 text-center max-w-20">
                  {color.name}
                </span>

                {/* Price Modifier */}
                {color.priceModifier !== 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    +৳{color.priceModifier.toLocaleString()}
                  </span>
                )}

                {/* Stock Badge */}
                {stockLevel === "low" && !isOutOfStock && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {color.stock} left
                  </span>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Out
                  </span>
                )}

                {/* Incompatible Icon */}
                {!isCompatible && !isOutOfStock && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-white rounded-full p-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMaterialSelector = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">
            Material
          </label>
          {selectedVariants.material && (
            <span className="text-sm text-gray-600">
              {
                product.variants.materials.find(
                  (m) => m.id === selectedVariants.material,
                )?.name
              }
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {product.variants.materials.map((material) => {
            const isSelected = selectedVariants.material === material.id;
            const isCompatible = checkVariantCompatibility(
              material,
              selectedVariants,
            );
            const stockLevel = getStockLevel(material.stock);
            const isOutOfStock = stockLevel === "out";
            const isDisabled = !isCompatible || isOutOfStock;

            return (
              <button
                key={material.id}
                onClick={() =>
                  !isDisabled && onVariantChange("material", material.id)
                }
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {material.name}
                    </h4>

                    {material.priceModifier !== 0 && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        +৳{material.priceModifier.toLocaleString()}
                      </p>
                    )}

                    {material.priceModifier === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Standard</p>
                    )}
                  </div>

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <p className="text-xs text-gray-500 mt-2">
                  {getStockMessage(material.stock)}
                </p>

                {/* Incompatible Badge */}
                {!isCompatible && !isOutOfStock && (
                  <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Incompatible
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSizeSelector = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">Size</label>
          {selectedVariants.size && (
            <span className="text-sm text-gray-600">
              {
                product.variants.sizes.find(
                  (s) => s.id === selectedVariants.size,
                )?.name
              }
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {product.variants.sizes.map((size) => {
            const isSelected = selectedVariants.size === size.id;
            const isCompatible = checkVariantCompatibility(
              size,
              selectedVariants,
            );
            const stockLevel = getStockLevel(size.stock);
            const isOutOfStock = stockLevel === "out";
            const isDisabled = !isCompatible || isOutOfStock;

            return (
              <button
                key={size.id}
                onClick={() => !isDisabled && onVariantChange("size", size.id)}
                disabled={isDisabled}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {size.name.split(" ")[0]}
                  </p>
                  {size.name.includes("(") && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {size.name.match(/\((.*?)\)/)?.[1]}
                    </p>
                  )}

                  {size.priceModifier !== 0 && (
                    <p
                      className={`text-xs font-semibold mt-1 ${size.priceModifier > 0 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {size.priceModifier > 0 ? "+" : ""}৳
                      {size.priceModifier.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Low Stock Badge */}
                {stockLevel === "low" && !isOutOfStock && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {size.stock}
                  </span>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1">
                    <svg
                      className="w-2.5 h-2.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Incompatibility Warning */}
      {incompatibleMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <svg
            className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-amber-800">{incompatibleMessage}</p>
        </div>
      )}

      {/* Color Selector */}
      {renderColorSelector()}

      {/* Material Selector */}
      {renderMaterialSelector()}

      {/* Size Selector */}
      {renderSizeSelector()}
    </div>
  );
}
