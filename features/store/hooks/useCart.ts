// src/store/hooks/useCart.ts
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { AppDispatch, RootState } from "../store";
import {
  addToCartAsync,
  updateCartItemAsync,
  removeFromCartAsync,
  clearCartAsync,
  saveForLaterAsync,
  moveToCartAsync,
  addRecentlyViewedAsync,
  loadCart,
  optimisticAddToCart,
  optimisticUpdateQuantity,
  optimisticRemoveFromCart,
  rollbackCart,
  applyPromoCode,
  removePromoCode,
} from "../../slices/cartSlice";
import {
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartTotal,
  selectQuantityDiscount,
  selectPromoDiscount,
  selectTotalSavings,
  selectLowStockItems,
  selectBundleDiscounts,
  selectSavedForLater,
  selectRecentlyViewed,
  selectRecentlyViewedProducts,
  selectAppliedPromoCode,
  selectCartLoading,
  selectCartError,
  selectSyncStatus,
  selectPromoCodeValidation,
} from "../selectors/cartSelectors";
import { CartItem } from "@/data/mockData";

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector(selectCartItems);
  const savedForLater = useSelector(selectSavedForLater);
  const recentlyViewed = useSelector(selectRecentlyViewed);
  const recentlyViewedProducts = useSelector(selectRecentlyViewedProducts);
  const appliedPromoCode = useSelector(selectAppliedPromoCode);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const syncStatus = useSelector(selectSyncStatus);

  const cartCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const quantityDiscount = useSelector(selectQuantityDiscount);
  const promoDiscount = useSelector(selectPromoDiscount);
  const total = useSelector(selectCartTotal);
  const totalSavings = useSelector(selectTotalSavings);
  const lowStockItems = useSelector(selectLowStockItems);
  const bundleDiscounts = useSelector(selectBundleDiscounts);

  // Load cart on mount
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  // Add to cart with optimistic update
  const addToCart = useCallback(
    async (item: CartItem) => {
      const previousItems = [...items];

      try {
        // Optimistic update
        dispatch(optimisticAddToCart(item));

        // Persist to IndexedDB
        await dispatch(addToCartAsync(item)).unwrap();
      } catch (error) {
        // Rollback on error
        dispatch(rollbackCart(previousItems));
        throw error;
      }
    },
    [dispatch, items],
  );

  // Update quantity with optimistic update
  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      const previousItems = [...items];

      try {
        // Optimistic update
        dispatch(optimisticUpdateQuantity({ id, quantity }));

        // Persist to IndexedDB
        await dispatch(
          updateCartItemAsync({ id, updates: { quantity } }),
        ).unwrap();
      } catch (error) {
        // Rollback on error
        dispatch(rollbackCart(previousItems));
        throw error;
      }
    },
    [dispatch, items],
  );

  // Remove from cart with optimistic update
  const removeFromCart = useCallback(
    async (id: number) => {
      const previousItems = [...items];

      try {
        // Optimistic update
        dispatch(optimisticRemoveFromCart(id));

        // Persist to IndexedDB
        await dispatch(removeFromCartAsync(id)).unwrap();
      } catch (error) {
        // Rollback on error
        dispatch(rollbackCart(previousItems));
        throw error;
      }
    },
    [dispatch, items],
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    await dispatch(clearCartAsync()).unwrap();
  }, [dispatch]);

  // Save for later
  const saveForLater = useCallback(
    async (cartItemId: number, item: CartItem) => {
      await dispatch(saveForLaterAsync({ cartItemId, item })).unwrap();
    },
    [dispatch],
  );

  // Move to cart
  const moveToCart = useCallback(
    async (savedItemId: number, item: CartItem) => {
      await dispatch(moveToCartAsync({ savedItemId, item })).unwrap();
    },
    [dispatch],
  );

  // Add to recently viewed
  const addRecentlyViewed = useCallback(
    async (productId: string) => {
      await dispatch(addRecentlyViewedAsync(productId));
    },
    [dispatch],
  );

  // Apply promo code
  const applyPromo = useCallback(
    (code: string) => {
      const afterQuantityDiscount = subtotal - quantityDiscount;
      const validation = selectPromoCodeValidation(code, afterQuantityDiscount);

      if (validation.valid) {
        dispatch(
          applyPromoCode({
            code: code.toUpperCase(),
            discount: validation.discount,
          }),
        );
        return { success: true, message: validation.message };
      } else {
        return { success: false, message: validation.message };
      }
    },
    [dispatch, subtotal, quantityDiscount],
  );

  // Remove promo code
  const removePromo = useCallback(() => {
    dispatch(removePromoCode());
  }, [dispatch]);

  return {
    // State
    items,
    savedForLater,
    recentlyViewed,
    recentlyViewedProducts,
    appliedPromoCode,
    loading,
    error,
    syncStatus,

    // Computed values
    cartCount,
    subtotal,
    quantityDiscount,
    promoDiscount,
    total,
    totalSavings,
    lowStockItems,
    bundleDiscounts,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    saveForLater,
    moveToCart,
    addRecentlyViewed,
    applyPromo,
    removePromo,
  };
};
