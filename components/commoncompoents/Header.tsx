import HeaderClient from "./HeaderClient";

export default async function Header() {
  const cartCount = 0;

  const menuItems = [
    { name: "Home", href: "/", icon: "Home" },
    { name: "Products", href: "/products", icon: "Package" },
    { name: "Categories", href: "/categories", icon: "Tag" },
    { name: "Wishlist", href: "/wishlist", icon: "Heart" },
  ] as const;

  return <HeaderClient cartCount={cartCount} menuItems={menuItems} />;
}
