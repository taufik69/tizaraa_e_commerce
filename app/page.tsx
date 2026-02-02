"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { mockProducts } from "@/data/mockData";
import type { Product } from "@/data/mockData";

export default function ProductListingPage() {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // URL State Management - Read from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Read search query
      const search = params.get("search");
      if (search) setSearchQuery(search);

      // Read categories
      const categories = params.get("categories");
      if (categories) setSelectedCategories(categories.split(","));

      // Read brands
      const brands = params.get("brands");
      if (brands) setSelectedBrands(brands.split(","));

      // Read ratings
      const ratings = params.get("ratings");
      if (ratings)
        setSelectedRatings(ratings.split(",").map((r) => parseInt(r)));

      // Read price range
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      if (minPrice && maxPrice) {
        setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
      }

      // Read sort
      const sort = params.get("sort");
      if (sort) setSortBy(sort);
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedCategories.length > 0)
        params.set("categories", selectedCategories.join(","));
      if (selectedBrands.length > 0)
        params.set("brands", selectedBrands.join(","));
      if (selectedRatings.length > 0)
        params.set("ratings", selectedRatings.join(","));
      if (priceRange[0] !== 0 || priceRange[1] !== 30000) {
        params.set("minPrice", priceRange[0].toString());
        params.set("maxPrice", priceRange[1].toString());
      }
      if (sortBy !== "popular") params.set("sort", sortBy);

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, "", newUrl);
    }
  }, [
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedRatings,
    priceRange,
    sortBy,
  ]);

  // Extract unique values for filters with type guards
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          mockProducts.map((p) => p.category).filter((c): c is string => !!c),
        ),
      ),
    [],
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          mockProducts.map((p) => p.brand).filter((b): b is string => !!b),
        ),
      ),
    [],
  );

  // Filter toggle handlers
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
    setSelectedRatings([]);
    setPriceRange([0, 30000]);
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    // Step 1: Filter products
    let filtered = mockProducts.filter((product) => {
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
        matchesRating &&
        matchesPrice
      );
    });

    // Step 2: Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // Assuming products are already in newest-first order in mockData
        break;
      case "popular":
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [
    debouncedSearch,
    selectedCategories,
    selectedBrands,
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
    (type: "category" | "brand" | "rating", value: string | number) => {
      return mockProducts.filter((p) => {
        if (type === "category") return p.category === value;
        if (type === "brand") return p.brand === value;
        if (type === "rating") return p.rating >= (value as number);
        return false;
      }).length;
    },
    [],
  );

  // Highlight search text in product name
  const highlightSearchText = (text: string, query: string) => {
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
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopHub
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearch("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`w-80 shrink-0 transition-all duration-300 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-24 space-y-6">
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

                {/* Active Filters Count */}
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
                  <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
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
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort & View Options */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredAndSortedProducts.length}
                  </span>{" "}
                  {filteredAndSortedProducts.length === 1
                    ? "product"
                    : "products"}
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">Sort by:</label>
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
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Quick View Button */}
                        <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                          <Eye className="w-5 h-5 text-gray-700" />
                        </button>

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
                        {/* Brand & Category */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">{product.brand}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>

                        {/* Product Name with Search Highlight */}
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {highlightSearchText(product.name, debouncedSearch)}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>

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

                        {/* Price & Add to Cart */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              ৳{(product.basePrice / 100).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Base price
                            </div>
                          </div>
                          <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 group/btn">
                            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-medium">Add</span>
                          </button>
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
    </div>
  );
}
