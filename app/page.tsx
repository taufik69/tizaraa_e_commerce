// app/products/page.tsx (Server Component)
import { Suspense } from "react";
import { mockProducts } from "@/data/mockData";
import ProductListingClient from "@/components/homeProducts/Productlistingclient";
import ProductListingSkeleton from "@/components/homeProducts/Productlistingskeleton";

// Server Component - initial data এবং metadata
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Server-side  URL params extract
  const initialFilters = {
    search: (searchParams.search as string) || "",
    categories: searchParams.categories
      ? (searchParams.categories as string).split(",")
      : [],
    brands: searchParams.brands
      ? (searchParams.brands as string).split(",")
      : [],
    colors: searchParams.colors
      ? (searchParams.colors as string).split(",")
      : [],
    ratings: searchParams.ratings
      ? (searchParams.ratings as string).split(",").map((r) => parseInt(r))
      : [],
    minPrice: searchParams.minPrice
      ? parseInt(searchParams.minPrice as string)
      : 0,
    maxPrice: searchParams.maxPrice
      ? parseInt(searchParams.maxPrice as string)
      : 30000,
    sort: (searchParams.sort as string) || "popular",
  };

  // Server-side  unique values extract  (static data)
  const categories = Array.from(
    new Set(
      mockProducts.map((p) => p.category).filter((c): c is string => !!c),
    ),
  );
  const brands = Array.from(
    new Set(mockProducts.map((p) => p.brand).filter((b): b is string => !!b)),
  );

  // Extract unique colors from all products
  const allColors = mockProducts.flatMap((p) =>
    p.variants.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
    })),
  );

  // Get unique colors by name
  const colors = Array.from(
    new Map(allColors.map((c) => [c.name, c])).values(),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductListingClient
          initialProducts={mockProducts}
          initialFilters={initialFilters}
          categories={categories}
          brands={brands}
          colors={colors}
        />
      </Suspense>
    </div>
  );
}

// Generate metadata (Server Component)
export async function generateMetadata() {
  return {
    title: "Products - Tizaraa E-commerce",
    description: "Browse our wide selection of quality products",
  };
}
