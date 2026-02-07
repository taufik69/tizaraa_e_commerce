// src/components/product/ProductConfigurator.tsx
"use client";

import React, { useState, useEffect, lazy } from "react";
import type { Product } from "@/data/mockData";
import VariantSelector from "./VariantSelector";
import PricingDisplay from "./PricingDisplay";
import { useSearchParams, useRouter } from "next/navigation";
import { addRecentlyViewedAsync } from "@/features/slices/cartSlice";
import { useAppDispatch } from "@/features/store/hooks/hooks";

// Lazy load 3D viewer for performance
const ProductViewer3D = lazy(() => import("./ProductViewer3D"));

interface ProductConfiguratorProps {
  product: Product;
}

export default function ProductConfigurator({
  product,
}: ProductConfiguratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Initialize state from URL or defaults
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const urlColor = searchParams.get("color");
    const urlMaterial = searchParams.get("material");
    const urlSize = searchParams.get("size");

    return {
      color: urlColor || product.variants.colors[0]?.id || "",
      material: urlMaterial || product.variants.materials[0]?.id || "",
      size: urlSize || product.variants.sizes[0]?.id || "",
    };
  });

  const [quantity, setQuantity] = useState(() => {
    const urlQty = searchParams.get("qty");
    return urlQty ? parseInt(urlQty) : 1;
  });

  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [selectedImage, setSelectedImage] = useState({
    image: "null",
    index: 0,
  });

  // Update URL when configuration changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("color", selectedVariants.color);
    params.set("material", selectedVariants.material);
    params.set("size", selectedVariants.size);
    if (quantity > 1) params.set("qty", quantity.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
    setShareUrl(`${window.location.origin}${newUrl}`);
  }, [selectedVariants, quantity]);

  // Add product to recently viewed
  useEffect(() => {
    if (!product.id) return;
    dispatch(addRecentlyViewedAsync(product.id));
  }, [dispatch, product.id]);

  const handleVariantChange = (
    type: "color" | "material" | "size",
    variantId: string,
  ) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [type]: variantId,
    }));
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(
      `Check out this ${product.name} configuration`,
    );
    const body = encodeURIComponent(
      `I found this amazing ${product.name} configuration!\n\nView it here: ${shareUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this ${product.name} configuration: ${shareUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Get selected variant details for 3D viewer
  const selectedColor = product.variants.colors.find(
    (c) => c.id === selectedVariants.color,
  );
  const selectedMaterial = product.variants.materials.find(
    (m) => m.id === selectedVariants.material,
  );

  // handle selected image index
  const handleSelectedImage = (image: string, index: number) => {
    setSelectedImage({ image, index });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/*  responsive header row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 wrap-break-word">
                {product.name}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
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

                <span className="text-xs sm:text-sm text-gray-600">
                  {product.rating} ({product.reviewCount.toLocaleString()}{" "}
                  reviews)
                </span>
              </div>
            </div>

            {/*  Share Button stays usable on mobile */}
            <button
              onClick={() => setShowShareModal(true)}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="text-sm text-gray-900 font-medium">Share</span>
            </button>
          </div>

          {/* Breadcrumb (wraps on small screens) */}
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
            <span>/</span>
            <a href="/products" className="hover:text-gray-900">
              Products
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium wrap-break-word">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - 3D Viewer + Variants */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Viewer */}
            <React.Suspense
              fallback={
                <div className="w-full h-80 sm:h-105 lg:h-130 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading 3D Preview...</p>
                  </div>
                </div>
              }
            >
              <ProductViewer3D
                productName={product.name}
                selectedColor={selectedColor?.hex}
                selectedMaterial={selectedMaterial?.id}
                images={product.images}
                modelUrl={product.modelUrl}
                handleSelectedImage={handleSelectedImage}
              />
            </React.Suspense>

            {/* Variant Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Customize Your Product
              </h2>
              <VariantSelector
                product={product}
                selectedVariants={selectedVariants}
                onVariantChange={handleVariantChange}
              />
            </div>
          </div>

          {/* Right Column - Pricing */}
          <div className="lg:col-span-1">
            <PricingDisplay
              product={product}
              selectedVariants={selectedVariants}
              quantity={quantity}
              onQuantityChange={setQuantity}
              selectedImage={selectedImage}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
               flex items-end sm:items-center justify-center
               p-3 sm:p-4"
        >
          {/* Modal Card */}
          <div
            className="bg-white w-full max-w-md rounded-2xl
                 shadow-xl border border-gray-100
                 max-h-[85vh] sm:max-h-[80vh]
                 overflow-hidden"
          >
            {/* Scroll Area */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain max-h-[85vh] sm:max-h-[80vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  Share Configuration
                </h3>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="shrink-0 p-2 rounded-lg text-black hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Share URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Share Link
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full sm:flex-1 min-w-0 px-3 py-2 bg-gray-50 text-black
                         border border-gray-300 rounded-lg text-sm
                         truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShareUrl}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors
                ${copySuccess ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Share Via
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleShareViaWhatsApp}
                    className="flex items-center justify-center gap-2 px-4 py-3
                         bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>

                  <button
                    onClick={handleShareViaEmail}
                    className="flex items-center justify-center gap-2 px-4 py-3
                         bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email
                  </button>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Your Configuration:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Color</p>
                    <p className="font-medium text-gray-900">
                      {selectedColor?.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Material</p>
                    <p className="font-medium text-gray-900">
                      {selectedMaterial?.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">{quantity}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full sm:hidden py-3 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
