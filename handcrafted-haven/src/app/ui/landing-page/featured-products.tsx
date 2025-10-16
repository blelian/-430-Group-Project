// src/app/ui/landing-page/featured-products.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/prisma/client";
import { Product } from "@/app/lib/definitions";

export default async function FeaturedProducts() {
  // Get distinct non-null categories (normalized)
  const productCategories = await prisma.product.findMany({
    select: { category: true },
    where: { category: { not: null } },
    distinct: ["category"],
  });

  // Build array of available category names
  const availableCategories = productCategories
    .map((c) => c.category?.trim())
    .filter((c): c is string => typeof c === "string" && c.length > 0);

  if (availableCategories.length === 0) return null;

  // Fetch products that belong to those available categories
  const dbProducts = await prisma.product.findMany({
    where: { category: { in: availableCategories } },
    take: 20, // fetch some products to choose from
    orderBy: { createdAt: "desc" },
  });

  if (!dbProducts || dbProducts.length === 0) return null;

  const products: Product[] = dbProducts.map((p) => ({
    id: p.id,
    title: p.name ?? "Untitled Product",
    price: p.price ?? 0,
    category: p.category ?? "",
    description: p.description ?? "",
    image: p.image ?? undefined,
    rating: {
      rate: p.ratingRate ?? 0,
      count: p.ratingCount ?? 0,
    },
  }));

  // Shuffle and pick up to 10 products
  const shuffledProducts = products.sort(() => Math.random() - 0.5).slice(0, 10);

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <h2 className="text-3xl font-bold text-center my-6">Featured Products</h2>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shuffledProducts.map((product) => (
          <li
            key={product.id}
            className="flex flex-col h-full gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <Link
              href={`/shop/category/${product.category.toLowerCase()}`}
              className="flex flex-col h-full"
            >
              <div className="relative w-full h-40 rounded-lg bg-gray-100 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title || "Product Image"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="break-words mt-2">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="font-bold text-lg">${product.price}</p>
                <p className="text-sm text-yellow-600">
                  ⭐ {product.rating.rate.toFixed(1)} ({product.rating.count})
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
