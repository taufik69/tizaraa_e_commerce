// HeaderClient.tsx (Client Component)
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  Package,
  Tag,
  Heart,
  User,
  LucideIcon,
} from "lucide-react";
import { useAppSelector } from "@/features/store/hooks/hooks";
import { selectCartItems } from "@/features/slices/cartSelectors";

type IconName = "Home" | "Package" | "Tag" | "Heart";

type MenuItem = {
  name: string;
  href: string;
  icon: IconName;
};

const iconMap: Record<IconName, LucideIcon> = {
  Home,
  Package,
  Tag,
  Heart,
};

export default function HeaderClient({
  menuItems,
}: {
  menuItems: readonly MenuItem[];
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const items: any = useAppSelector(selectCartItems);

  // cartCount = total quantity (better than items.length)
  const cartCount = useMemo(
    () => items.reduce((sum: any, item: any) => sum + (item.quantity || 0), 0),
    [items],
  );

  return (
    <header className="bg-gray-100 backdrop-blur-sm border-b  border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-gary-800 to-gray-800 rounded-lg flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-linear-to-r from-gray-400 to-gray-900 bg-clip-text">
              Tizaraa E-commerce
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Profile - Desktop */}
            <Link
              href="/profile"
              className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Profile"
            >
              <User className="w-6 h-6 text-gray-700" />
            </Link>

            {/* Cart Icon with Badge (Redux based) */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-lg">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu((p) => !p)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            showMobileMenu ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 py-4 border-t border-gray-200">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Profile - Mobile */}
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
              onClick={() => setShowMobileMenu(false)}
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
