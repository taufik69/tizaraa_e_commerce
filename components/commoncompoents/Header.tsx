// Header.tsx (Server Component)
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const menuItems = [
    { name: "Home", href: "/", icon: "Home" },
    { name: "Products", href: "/", icon: "Package" },
  ] as const;

  return <HeaderClient menuItems={menuItems} />;
}
