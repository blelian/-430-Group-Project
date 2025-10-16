// src/app/ui/landing-page/featured-products.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/prisma/client";
import { Product } from "@/app/lib/definitions";

export default async function FeaturedProducts() {
  // Fetch products that have a non-null category
  const dbProducts = await prisma.product.findMany({
    where: { category: { not: null } },
    take: 10, // max 10 products
  });

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

  // Randomize order
  const shuffledProducts = products.sort(() => Math.random() - 0.5);

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shuffledProducts.map((product: Product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <li className="flex flex-col h-full gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <div className="relative w-full h-40 rounded-lg bg-gray-100">
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
              <div className="break-words">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="font-bold text-lg">${product.price}</p>
                <p className="text-sm text-yellow-600">
                  ⭐ {product.rating.rate.toFixed(1)} ({product.rating.count})
                </p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
