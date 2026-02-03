import type { RootState } from "@/features/store/store";
import { getProductById } from "@/data/mockData";
import { validatePromoCode } from "@/data/mockData";

// quantity discount rule (same as your PricingDisplay)
const getQtyDiscount = (subtotal: number, totalQty: number) => {
  let percent = 0;
  if (totalQty >= 10) percent = 15;
  else if (totalQty >= 5) percent = 10;
  else if (totalQty >= 3) percent = 5;

  const discount = Math.round(subtotal * (percent / 100));
  return { percent, discount };
};

export const selectCartState = (s: RootState) => s.cart;

export const selectCartItems = (s: RootState) => s.cart.items;
export const selectSavedForLater = (s: RootState) => s.cart.savedForLater;
export const selectRecentlyViewed = (s: RootState) => s.cart.recentlyViewed;

export const selectLoading = (s: RootState) => s.cart.loading;
export const selectSyncStatus = (s: RootState) => s.cart.syncStatus;
export const selectAppliedPromo = (s: RootState) => s.cart.appliedPromoCode;

// derived data for Cart page UI
export const selectCartDerived = (s: RootState) => {
  const items = s.cart.items;
  const appliedPromoCode = s.cart.appliedPromoCode;

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // subtotal compute from product.basePrice + variant modifiers
  const subtotal = items.reduce((sum, item) => {
    const p = getProductById(item.productId);
    if (!p) return sum;

    const color = p.variants.colors.find(
      (c: any) => c.id === item.selectedVariants.color,
    );
    const material = p.variants.materials.find(
      (m: any) => m.id === item.selectedVariants.material,
    );
    const size = p.variants.sizes.find(
      (z: any) => z.id === item.selectedVariants.size,
    );

    const unit =
      p.basePrice +
      (color?.priceModifier || 0) +
      (material?.priceModifier || 0) +
      (size?.priceModifier || 0);

    return sum + unit * item.quantity;
  }, 0);

  const { discount: quantityDiscount } = getQtyDiscount(subtotal, cartCount);

  const afterQtyDiscount = subtotal - quantityDiscount;

  // promo discount: recompute if promo exists (optional safety)
  let promoDiscount = 0;
  if (appliedPromoCode?.code) {
    const res = validatePromoCode(appliedPromoCode.code, afterQtyDiscount);
    promoDiscount = res.valid ? res.discount : 0;
  }

  const total = afterQtyDiscount - promoDiscount;

  const totalSavings = quantityDiscount + promoDiscount;

  // low stock warnings (if your product has stock)
  const lowStockItems = items
    .map((item) => {
      const p: any = getProductById(item.productId);
      if (!p) return null;
      const stock = p.stock ?? 999999; // if no stock in mock
      if (stock >= item.quantity) return null;

      return {
        id: item.key,
        productName: p.name,
        stock,
        requested: item.quantity,
      };
    })
    .filter(Boolean) as any[];

  // bundle discounts placeholder (keep your UI same)
  const bundleDiscounts: { name: string }[] = [];

  return {
    cartCount,
    subtotal,
    quantityDiscount,
    appliedPromoCode,
    promoDiscount,
    total,
    totalSavings,
    lowStockItems,
    bundleDiscounts,
  };
};
