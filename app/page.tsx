import { Suspense } from "react";
import { mockProducts } from "@/data/mockData";
import ProductDetailClient from "@/components/Productdetailclient";
import { notFound } from "next/navigation";

// Generate static params for all products at build time
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - ${product.brand} | ShopHub`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

// Server Component - Product Page
export default function ProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  // Pre-select default variants server-side
  const defaultVariants = {
    color: product.variants.colors[0].id,
    material: product.variants.materials[0].id,
    size: product.variants.sizes[0].id,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductDetailClient
          product={product}
          defaultVariants={defaultVariants}
        />
      </Suspense>
    </div>
  );
}

// Loading skeleton
function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Image skeleton */}
            <div className="bg-gray-200 rounded-xl h-150" />

            {/* Right - Details skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-20 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
