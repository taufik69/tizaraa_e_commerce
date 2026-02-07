"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Star, Eye, X } from "lucide-react";
import type { Product } from "@/data/mockData";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ColorOption {
  id: string;
  name: string;
  hex?: string;
}

interface ProductListingClientProps {
  initialProducts: Product[];
  initialFilters: {
    search: string;
    categories: string[];
    brands: string[];
    colors: string[];
    ratings: number[];
    minPrice: number;
    maxPrice: number;
    sort: string;
  };
  categories: string[];
  brands: string[];
  colors: ColorOption[];
}

export default function ProductListingClient({
  initialProducts,
  initialFilters,
  categories,
  brands,
  colors,
}: ProductListingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // kept if you want to read from URL later

  // --------------------------
  // State Management
  // --------------------------
  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories,
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialFilters.brands,
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialFilters.colors,
  );
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    initialFilters.ratings,
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice,
    initialFilters.maxPrice,
  ]);

  const [sortBy, setSortBy] = useState(initialFilters.sort);

  // Responsive filter drawer:
  const [showFilters, setShowFilters] = useState(false);

  // Auto-toggle filters based on screen size (lg = 1024px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => {
      if (mq.matches)
        setShowFilters(true); // open (sidebar visible)
      else setShowFilters(false); // close (drawer hidden)
    };
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --------------------------
  // Update URL when filters change
  // --------------------------
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedBrands.length > 0)
      params.set("brands", selectedBrands.join(","));
    if (selectedColors.length > 0)
      params.set("colors", selectedColors.join(","));
    if (selectedRatings.length > 0)
      params.set("ratings", selectedRatings.join(","));

    if (priceRange[0] !== 0 || priceRange[1] !== 30000) {
      params.set("minPrice", String(priceRange[0]));
      params.set("maxPrice", String(priceRange[1]));
    }

    if (sortBy !== "popular") params.set("sort", sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedColors,
    selectedRatings,
    priceRange,
    sortBy,
    pathname,
    router,
  ]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // --------------------------
  // Filter toggle handlers
  // --------------------------
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }, []);

  const toggleColor = useCallback((colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  }, []);

  const toggleRating = useCallback((rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedRatings([]);
    setPriceRange([0, 30000]);
    setSearchQuery("");
    setDebouncedSearch("");
    // On mobile, close drawer after clearing
    setShowFilters((prev) =>
      window.matchMedia("(min-width: 1024px)").matches ? true : false,
    );
  }, []);

  // --------------------------
  // Filtered and sorted products
  // --------------------------
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = initialProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category && selectedCategories.includes(product.category));

      const matchesBrand =
        selectedBrands.length === 0 ||
        (product.brand && selectedBrands.includes(product.brand));

      const matchesColor =
        selectedColors.length === 0 ||
        product.variants.colors.some((color) =>
          selectedColors.includes(color.name),
        );

      const matchesRating =
        selectedRatings.length === 0 ||
        selectedRatings.some((r) => product.rating >= r);

      const matchesPrice =
        product.basePrice >= priceRange[0] &&
        product.basePrice <= priceRange[1];

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesColor &&
        matchesRating &&
        matchesPrice
      );
    });

    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case "price-low":
        sortedFiltered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-high":
        sortedFiltered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        sortedFiltered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // keep existing order
        break;
      case "popular":
      default:
        sortedFiltered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return sortedFiltered;
  }, [
    initialProducts,
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedColors,
    selectedRatings,
    priceRange,
    sortBy,
  ]);

  // Get stock status
  const getStockStatus = useCallback((product: Product) => {
    const totalStock = product.variants.colors.reduce(
      (sum, color) => sum + color.stock,
      0,
    );
    if (totalStock === 0)
      return { label: "Out of Stock", color: "text-red-600" };
    if (totalStock < 10)
      return { label: "Low Stock", color: "text-orange-600" };
    return { label: "In Stock", color: "text-green-600" };
  }, []);

  // Calculate filter counts
  const getFilterCount = useCallback(
    (
      type: "category" | "brand" | "color" | "rating",
      value: string | number,
    ) => {
      return initialProducts.filter((p) => {
        if (type === "category") return p.category === value;
        if (type === "brand") return p.brand === value;
        if (type === "color")
          return p.variants.colors.some((c) => c.name === value);
        if (type === "rating") return p.rating >= (value as number);
        return false;
      }).length;
    },
    [initialProducts],
  );

  // Highlight search text
  const highlightSearchText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  }, []);

  return (
    <>
      <div className="lg:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-8">
          {/* Backdrop for mobile drawer */}
          {showFilters && (
            <button
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
          )}

          {/* Sidebar / Drawer Filters */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white
              transform transition-transform duration-300
              ${showFilters ? "translate-x-0" : "-translate-x-full"}
              lg:static lg:z-auto lg:translate-x-0 lg:w-80 lg:max-w-none lg:bg-transparent
            `}
          >
            <div className="h-full lg:h-auto lg:sticky lg:top-24">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b lg:hidden">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Filters content */}
              <div className="space-y-6 p-4 lg:p-0 max-h-full overflow-y-auto lg:max-h-[calc(100vh-120px)]">
                {/* Filter Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      Filters
                    </h2>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    {filteredAndSortedProducts.length} products found
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Price Range
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="30000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([0, parseInt(e.target.value)])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">৳0</span>
                      <span className="font-semibold text-gray-900">
                        ৳{priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Category
                    </h3>
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const count = getFilterCount("category", category);
                        return (
                          <label
                            key={category}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">
                              {category}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Brand</h3>
                    <div className="space-y-3">
                      {brands.map((brand) => {
                        const count = getFilterCount("brand", brand);
                        return (
                          <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">
                              {brand}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Filter */}
                {colors.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Color</h3>
                    <div className="space-y-3">
                      {colors.map((color) => {
                        const count = getFilterCount("color", color.name);
                        return (
                          <label
                            key={color.name}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedColors.includes(color.name)}
                              onChange={() => toggleColor(color.name)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {color.hex && (
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: color.hex }}
                                />
                              )}
                              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                {color.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rating Filter */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Rating</h3>
                  <div className="space-y-3">
                    {[4, 3, 2, 1].map((rating) => {
                      const count = getFilterCount("rating", rating);
                      return (
                        <label
                          key={rating}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRatings.includes(rating)}
                            onChange={() => toggleRating(rating)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex items-center gap-1 flex-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              & up
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort & Search */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredAndSortedProducts.length}
                    </span>{" "}
                    {filteredAndSortedProducts.length === 1
                      ? "product"
                      : "products"}
                  </div>

                  {/* Mobile Filters Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {/* Search Bar */}
                <div className="flex-1 w-full lg:max-w-2xl">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setDebouncedSearch("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1"
                      >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3 justify-end">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border text-black border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Best Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Link href={`/products/${product.id}`}>
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Quick View Button */}
                        <Link
                          href={`/products/${product.id}`}
                          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                        >
                          <Eye className="w-5 h-5 text-gray-700" />
                        </Link>

                        {/* Stock Badge */}
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${stockStatus.color}`}
                          >
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">{product.brand}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>

                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {highlightSearchText(product.name, debouncedSearch)}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Available Colors */}
                        <div className="flex items-center gap-1">
                          {product.variants.colors.slice(0, 5).map((color) => (
                            <div
                              key={color.id}
                              className="w-5 h-5 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                          {product.variants.colors.length > 5 && (
                            <span className="text-xs text-gray-500 ml-1">
                              +{product.variants.colors.length - 5}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {product.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({product.reviewCount.toLocaleString()})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              ৳{(product.basePrice / 100).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Base price
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
