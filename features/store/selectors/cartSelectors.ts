// src/store/selectors/cartSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  calculateProductPrice,
  getProductById,
  getStockLevel,
  mockPromoCodes,
} from "@/data/mockData";

// Base selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectSavedForLater = (state: RootState) =>
  state.cart.savedForLater;
export const selectRecentlyViewed = (state: RootState) =>
  state.cart.recentlyViewed;
export const selectAppliedPromoCode = (state: RootState) =>
  state.cart.appliedPromoCode;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectSyncStatus = (state: RootState) => state.cart.syncStatus;

// Cart count
export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

// Cart total with variant prices
export const selectCartSubtotal = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const product = getProductById(item.productId);
    if (!product) return total;

    const itemPrice = calculateProductPrice(
      product,
      item.selectedVariants,
      item.quantity,
    );
    return total + itemPrice;
  }, 0);
});

// Quantity discount
export const selectQuantityDiscount = createSelector(
  [selectCartItems],
  (items) => {
    let totalDiscount = 0;

    items.forEach((item) => {
      const product = getProductById(item.productId);
      if (!product) return;

      const basePrice = product.basePrice;
      const colorVariant = product.variants.colors.find(
        (c) => c.id === item.selectedVariants.color,
      );
      const materialVariant = product.variants.materials.find(
        (m) => m.id === item.selectedVariants.material,
      );
      const sizeVariant = product.variants.sizes.find(
        (s) => s.id === item.selectedVariants.size,
      );

      const configuratedPrice =
        basePrice +
        (colorVariant?.priceModifier || 0) +
        (materialVariant?.priceModifier || 0) +
        (sizeVariant?.priceModifier || 0);

      const subtotal = configuratedPrice * item.quantity;

      let discountPercent = 0;
      if (item.quantity >= 10) {
        discountPercent = 0.15;
      } else if (item.quantity >= 5) {
        discountPercent = 0.1;
      } else if (item.quantity >= 3) {
        discountPercent = 0.05;
      }

      totalDiscount += Math.round(subtotal * discountPercent);
    });

    return totalDiscount;
  },
);

// Bundle discount detection
export const selectBundleDiscounts = createSelector(
  [selectCartItems],
  (items) => {
    const bundles: {
      productIds: string[];
      discount: number;
      name: string;
    }[] = [];

    // Check for "Buy 3 Get 15% Off" bundle
    const productGroups = items.reduce(
      (acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(productGroups).forEach(([productId, quantity]) => {
      if (quantity >= 3) {
        const product = getProductById(productId);
        if (product) {
          bundles.push({
            productIds: [productId],
            discount: 15,
            name: `Buy 3+ ${product.name} - Get 15% Off`,
          });
        }
      }
    });

    // Check for complementary product bundles
    const hasChair = items.some((item) => item.productId === "prod-001");
    const hasDesk = items.some((item) => item.productId === "prod-002");
    const hasMonitorArm = items.some((item) => item.productId === "prod-003");

    if (hasChair && hasDesk) {
      bundles.push({
        productIds: ["prod-001", "prod-002"],
        discount: 10,
        name: "Office Setup Bundle - 10% Off",
      });
    }

    if (hasChair && hasDesk && hasMonitorArm) {
      bundles.push({
        productIds: ["prod-001", "prod-002", "prod-003"],
        discount: 15,
        name: "Complete Workspace Bundle - 15% Off",
      });
    }

    return bundles;
  },
);

// Promo code discount
export const selectPromoDiscount = createSelector(
  [selectCartSubtotal, selectQuantityDiscount, selectAppliedPromoCode],
  (subtotal, quantityDiscount, promoCode) => {
    if (!promoCode) return 0;

    const afterQuantityDiscount = subtotal - quantityDiscount;
    return promoCode.discount;
  },
);

// Cart total
export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectQuantityDiscount, selectPromoDiscount],
  (subtotal, quantityDiscount, promoDiscount) => {
    return Math.max(0, subtotal - quantityDiscount - promoDiscount);
  },
);

// Total savings
export const selectTotalSavings = createSelector(
  [selectQuantityDiscount, selectPromoDiscount],
  (quantityDiscount, promoDiscount) => {
    return quantityDiscount + promoDiscount;
  },
);

// Low stock warnings
export const selectLowStockItems = createSelector(
  [selectCartItems],
  (items) => {
    return items
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;

        const colorVariant = product.variants.colors.find(
          (c) => c.id === item.selectedVariants.color,
        );
        const materialVariant = product.variants.materials.find(
          (m) => m.id === item.selectedVariants.material,
        );
        const sizeVariant = product.variants.sizes.find(
          (s) => s.id === item.selectedVariants.size,
        );

        const minStock = Math.min(
          colorVariant?.stock || 0,
          materialVariant?.stock || 0,
          sizeVariant?.stock || 0,
        );

        const stockLevel = getStockLevel(minStock);

        if (stockLevel === "low" || stockLevel === "out") {
          return {
            id: item.id,
            productName: product.name,
            stock: minStock,
            stockLevel,
            requested: item.quantity,
          };
        }

        return null;
      })
      .filter(Boolean);
  },
);

// Get recently viewed products with details
export const selectRecentlyViewedProducts = createSelector(
  [selectRecentlyViewed],
  (productIds) => {
    return productIds
      .map((id) => getProductById(id))
      .filter((product) => product !== undefined);
  },
);

// Check if cart has specific product
export const selectHasProductInCart = (productId: string) =>
  createSelector([selectCartItems], (items) =>
    items.some((item) => item.productId === productId),
  );

// Get cart item by ID
export const selectCartItemById = (id: number) =>
  createSelector([selectCartItems], (items) =>
    items.find((item) => item.id === id),
  );

// Validate promo code
export const selectPromoCodeValidation = (code: string, cartTotal: number) => {
  const promo = mockPromoCodes.find(
    (p) => p.code.toLowerCase() === code.toLowerCase(),
  );

  if (!promo) {
    return { valid: false, message: "Invalid promo code", discount: 0 };
  }

  const currentDate = new Date();
  const validUntilDate = new Date(promo.validUntil);

  if (currentDate > validUntilDate) {
    return { valid: false, message: "Promo code has expired", discount: 0 };
  }

  if (promo.minPurchase && cartTotal < promo.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of ৳${promo.minPurchase.toLocaleString()} required`,
      discount: 0,
    };
  }

  const discount =
    promo.discountType === "percentage"
      ? Math.round((cartTotal * promo.discountValue) / 100)
      : promo.discountValue;

  return {
    valid: true,
    message: `Promo code applied! You saved ৳${discount.toLocaleString()}`,
    discount,
  };
};
