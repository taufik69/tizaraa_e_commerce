"use client";

import React, { useState, useMemo, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  mockPromoCodes,
  getStockLevel,
  getStockMessage,
  checkVariantCompatibility,
  type Product,
  type PromoCode,
  type Variant,
} from "@/data/mockData";

// Dynamic import for 3D viewer (only loads when needed)
const ProductViewer3D = dynamic(
  () => import("@/components/product/ProductViewer3D"),
  {
    loading: () => (
      <div className="w-full h-150 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600 font-medium">
            Loading 3D Viewer...
          </p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for 3D viewer
  },
);

interface ProductDetailClientProps {
  product: Product;
  defaultVariants: {
    color: string;
    material: string;
    size: string;
  };
}

export default function ProductDetailClient({
  product,
  defaultVariants,
}: ProductDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedColor, setSelectedColor] = useState(defaultVariants.color);
  const [selectedMaterial, setSelectedMaterial] = useState(
    defaultVariants.material,
  );
  const [selectedSize, setSelectedSize] = useState(defaultVariants.size);
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [showPromoMessage, setShowPromoMessage] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Calculate price with memoization
  const { totalPrice, basePrice, discountPercentage } = useMemo(() => {
    let price = product.basePrice;

    const color = product.variants.colors.find((c) => c.id === selectedColor);
    const material = product.variants.materials.find(
      (m) => m.id === selectedMaterial,
    );
    const size = product.variants.sizes.find((s) => s.id === selectedSize);

    if (color) price += color.priceModifier;
    if (material) price += material.priceModifier;
    if (size) price += size.priceModifier;

    const basePrice = price;

    // Quantity discount
    let discount = 0;
    if (quantity >= 10) discount = 0.15;
    else if (quantity >= 5) discount = 0.1;
    else if (quantity >= 3) discount = 0.05;

    const subtotal = price * quantity;
    const discountAmount = subtotal * discount;
    let final = subtotal - discountAmount;

    // Apply promo code
    if (appliedPromo) {
      const promoDiscount =
        appliedPromo.discountType === "percentage"
          ? (final * appliedPromo.discountValue) / 100
          : appliedPromo.discountValue;
      final -= promoDiscount;
    }

    return {
      totalPrice: Math.round(final),
      basePrice,
      discountPercentage: discount,
    };
  }, [
    product,
    selectedColor,
    selectedMaterial,
    selectedSize,
    quantity,
    appliedPromo,
  ]);

  // Get selected color hex
  const selectedColorHex = useMemo(() => {
    return product.variants.colors.find((c) => c.id === selectedColor)?.hex;
  }, [product, selectedColor]);

  // Get current stock
  const currentStock = useMemo(() => {
    const color = product.variants.colors.find((c) => c.id === selectedColor);
    const material = product.variants.materials.find(
      (m) => m.id === selectedMaterial,
    );
    const size = product.variants.sizes.find((s) => s.id === selectedSize);
    return Math.min(color?.stock || 0, material?.stock || 0, size?.stock || 0);
  }, [product, selectedColor, selectedMaterial, selectedSize]);

  const handleApplyPromo = () => {
    const promo = mockPromoCodes.find(
      (p) => p.code.toLowerCase() === promoCode.toLowerCase(),
    );

    if (!promo) {
      setPromoError("Invalid promo code");
      setShowPromoMessage(true);
      setTimeout(() => {
        setShowPromoMessage(false);
        setPromoError("");
      }, 3000);
      return;
    }

    const currentDate = new Date();
    const validUntilDate = new Date(promo.validUntil);

    if (currentDate > validUntilDate) {
      setPromoError("Promo code has expired");
      setShowPromoMessage(true);
      setTimeout(() => {
        setShowPromoMessage(false);
        setPromoError("");
      }, 3000);
      return;
    }

    if (promo.minPurchase && totalPrice < promo.minPurchase) {
      setPromoError(
        `Minimum purchase of ৳${promo.minPurchase.toLocaleString()} required`,
      );
      setShowPromoMessage(true);
      setTimeout(() => {
        setShowPromoMessage(false);
        setPromoError("");
      }, 3000);
      return;
    }

    setAppliedPromo(promo);
    setPromoError("");
    setShowPromoMessage(true);
    setTimeout(() => setShowPromoMessage(false), 3000);
  };

  const handleVariantChange = (
    type: "color" | "material" | "size",
    value: string,
  ) => {
    startTransition(() => {
      if (type === "color") setSelectedColor(value);
      else if (type === "material") setSelectedMaterial(value);
      else setSelectedSize(value);
    });
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ShopHub
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-6 text-sm overflow-x-auto">
            {mockPromoCodes.map((promo) => (
              <div
                key={promo.code}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="font-semibold">{promo.code}</span>
                <span className="opacity-90">
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}% OFF`
                    : `৳${promo.discountValue} OFF`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: 3D Viewer */}
          <div>
            <ProductViewer3D
              productName={product.name}
              selectedColor={selectedColorHex}
              images={product.images}
              modelUrl={product.modelUrl}
            />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">{product.brand}</span>
                  <h1 className="text-3xl font-bold text-gray-900 mt-1">
                    {product.name}
                  </h1>
                </div>
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.floor(product.rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    getStockLevel(currentStock) === "high"
                      ? "bg-green-500"
                      : getStockLevel(currentStock) === "medium"
                        ? "bg-yellow-500"
                        : getStockLevel(currentStock) === "low"
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    getStockLevel(currentStock) === "high"
                      ? "text-green-700"
                      : getStockLevel(currentStock) === "medium"
                        ? "text-yellow-700"
                        : getStockLevel(currentStock) === "low"
                          ? "text-orange-700"
                          : "text-red-700"
                  }`}
                >
                  {getStockMessage(currentStock)}
                </span>
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">
                  Select Color
                </label>
                <span className="text-sm text-gray-600">
                  {
                    product.variants.colors.find((c) => c.id === selectedColor)
                      ?.name
                  }
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {product.variants.colors.map((color) => {
                  const isCompatible = checkVariantCompatibility(color, {
                    material: selectedMaterial,
                    size: selectedSize,
                  });
                  const isSelected = selectedColor === color.id;

                  return (
                    <button
                      key={color.id}
                      onClick={() =>
                        isCompatible && handleVariantChange("color", color.id)
                      }
                      disabled={!isCompatible || isPending}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : isCompatible
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-100 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-xs text-gray-700 font-medium text-center">
                        {color.name.split(" ")[0]}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {color.priceModifier > 0
                          ? `+৳${color.priceModifier}`
                          : "Base"}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
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

            {/* Material Selection */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">
                  Select Material
                </label>
                <span className="text-sm text-gray-600">
                  {
                    product.variants.materials.find(
                      (m) => m.id === selectedMaterial,
                    )?.name
                  }
                </span>
              </div>

              <div className="space-y-3">
                {product.variants.materials.map((material) => {
                  const isCompatible = checkVariantCompatibility(material, {
                    color: selectedColor,
                    size: selectedSize,
                  });
                  const isSelected = selectedMaterial === material.id;

                  return (
                    <button
                      key={material.id}
                      onClick={() =>
                        isCompatible &&
                        handleVariantChange("material", material.id)
                      }
                      disabled={!isCompatible || isPending}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : isCompatible
                            ? "border-gray-200 hover:border-gray-300 bg-white"
                            : "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {material.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {material.priceModifier > 0
                              ? `+৳${material.priceModifier.toLocaleString()}`
                              : "No additional cost"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-gray-500">
                            Stock: {material.stock}
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
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
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900">
                  Select Size
                </label>
                <span className="text-sm text-gray-600">
                  {
                    product.variants.sizes.find((s) => s.id === selectedSize)
                      ?.name
                  }
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {product.variants.sizes.map((size) => {
                  const isCompatible = checkVariantCompatibility(size, {
                    color: selectedColor,
                    material: selectedMaterial,
                  });
                  const isSelected = selectedSize === size.id;

                  return (
                    <button
                      key={size.id}
                      onClick={() =>
                        isCompatible && handleVariantChange("size", size.id)
                      }
                      disabled={!isCompatible || isPending}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : isCompatible
                            ? "border-gray-200 hover:border-gray-300 bg-white"
                            : "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">
                        {size.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {size.priceModifier > 0
                          ? `+৳${size.priceModifier}`
                          : size.priceModifier < 0
                            ? `৳${size.priceModifier}`
                            : "Base"}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
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

            {/* Quantity & Promo */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-3 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white transition-colors flex items-center justify-center font-semibold text-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(
                              currentStock,
                              parseInt(e.target.value) || 1,
                            ),
                          ),
                        )
                      }
                      className="flex-1 h-12 px-4 text-center border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(currentStock, quantity + 1))
                      }
                      disabled={quantity >= currentStock}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300 bg-white transition-colors flex items-center justify-center font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {quantity >= 3 && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      🎉 Bulk discount applied:{" "}
                      {quantity >= 10 ? "15%" : quantity >= 5 ? "10%" : "5%"}{" "}
                      off
                    </div>
                  )}
                </div>

                {/* Promo Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-3 block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {showPromoMessage && (
                    <div
                      className={`mt-2 text-sm font-medium ${
                        promoError ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {promoError || "✓ Code applied successfully!"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Base Price:</span>
                  <span>৳{basePrice.toLocaleString()}</span>
                </div>
                {quantity > 1 && (
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Quantity:</span>
                    <span>× {quantity}</span>
                  </div>
                )}
                {discountPercentage > 0 && (
                  <div className="flex items-center justify-between text-green-600 font-semibold">
                    <span>Bulk Discount:</span>
                    <span>-{(discountPercentage * 100).toFixed(0)}%</span>
                  </div>
                )}
                {appliedPromo && (
                  <div className="flex items-center justify-between text-green-600 font-semibold">
                    <span>Promo ({appliedPromo.code}):</span>
                    <span>
                      -
                      {appliedPromo.discountType === "percentage"
                        ? `${appliedPromo.discountValue}%`
                        : `৳${appliedPromo.discountValue}`}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-blue-200 pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    Total Price:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full py-4 bg-linear]]]]]]]]-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg">
                  Add to Cart
                </button>
                <button className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
