// app/products/[id]/page.tsx
"use client";
import { use } from "react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import { mockProducts, getProductById } from "@/data/mockData";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <a
            href="/products"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return <ProductConfigurator product={product} />;
}

// Generate static params for all products (for static generation)
// export async function generateStaticParams() {
//   return mockProducts.map((product) => ({
//     id: product.id,
//   }));
// }
