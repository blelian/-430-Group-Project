// src/app/layout.tsx
"use client";

import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { CartProvider, useCart } from "@/app/context/CartContext";
import CartDrawer from "@/app/ui/CartDrawer";
import CartButton from "@/app/ui/CartButton";
import Link from "next/link";
import React, { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import LoadingSpinner from "@/app/ui/loading-spinner";

// =======================
// 🔹 Header Component
// =======================
function HeaderBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { isAuthenticated } = useCart();
  const [role, setRole] = React.useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = Cookies.get("role");
    setRole(storedRole || null);
  }, []);

  const handleCartClick = () => {
    // allow guests to open the cart so local cart is visible
    onOpenCart();
  };

  const handleOrdersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push("/login");

    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === "SELLER") router.push("/seller/orders");
    else if (normalizedRole === "ADMIN") router.push("/admin/orders");
    // customers do not see Orders link (handled in JSX)
  };

  return (
    <header className="w-full border-b bg-white/90 backdrop-blur-sm sticky top-0 z-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Handcrafted Haven
          </Link>

          <nav className="hidden md:flex gap-4">
            <Link href="/shop" className="text-sm hover:underline">
              Shop
            </Link>

            {isAuthenticated && role !== "CUSTOMER" && (
              <a
                href="#orders"
                onClick={handleOrdersClick}
                className="text-sm hover:underline"
              >
                Orders
              </a>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CartButton onClick={handleCartClick} />
        </div>
      </div>
    </header>
  );
}

// =======================
// 🔹 Page Loader
// =======================
function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    startTransition(() => {
      setLoading(true);
      timer = setTimeout(() => setLoading(false), 300);
    });

    return () => clearTimeout(timer);
  }, [pathname, startTransition]);

  if (!loading && !isPending) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/70 z-50">
      <LoadingSpinner text="Loading page..." />
    </div>
  );
}

// =======================
// 🔹 Root Layout
// =======================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <HeaderBar onOpenCart={() => setCartOpen(true)} />
          <PageLoader />
          <main>{children}</main>

          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

          <footer className="border-t mt-12 py-6 text-center text-sm text-gray-600 bg-gray-50">
            © {new Date().getFullYear()} Handcrafted Haven. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
