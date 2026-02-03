import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, PromoCode, mockPromoCodes } from "@/data/mockData";
import { cartDB } from "@/lib/db/cartDB";
import { calculateProductPrice, getProductById } from "@/data/mockData";

import { SucessToast, UpdateToast } from "@/helpers/toast";

interface CartState {
  items: (CartItem & { id: number })[];
  savedForLater: (CartItem & { id: number })[];
  recentlyViewed: string[];
  appliedPromoCode: {
    code: string;
    discount: number;
  } | null;
  loading: boolean;
  error: string | null;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

const initialState: CartState = {
  items: [],
  savedForLater: [],
  recentlyViewed: [],
  appliedPromoCode: null,
  loading: false,
  error: null,
  syncStatus: "idle",
};

// Async thunks for IndexedDB operations
export const loadCart = createAsyncThunk("cart/loadCart", async () => {
  const [cart, savedForLater, recentlyViewed] = await Promise.all([
    cartDB.getCart(),
    cartDB.getSavedForLater(),
    cartDB.getRecentlyViewed(),
  ]);

  return {
    cart,
    savedForLater,
    recentlyViewed,
  };
});

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (item: CartItem, { rejectWithValue }) => {
    try {
      // console.log("item", item);
      const id = await cartDB.addToCart(item);
      SucessToast("Add To Cart Sucessfullly");
      return { ...item, id };
    } catch (error) {
      return rejectWithValue("Failed to add item to cart");
    }
  },
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { id, updates }: { id: number; updates: Partial<CartItem> },
    { rejectWithValue },
  ) => {
    try {
      await cartDB.updateCartItem(id, updates);
      UpdateToast("Cart Updated Sucessfully");
      return { id, updates };
    } catch (error) {
      return rejectWithValue("Failed to update cart item");
    }
  },
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (id: number, { rejectWithValue }) => {
    try {
      await cartDB.removeFromCart(id);
      return id;
    } catch (error) {
      return rejectWithValue("Failed to remove item from cart");
    }
  },
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await cartDB.clearCart();
    } catch (error) {
      return rejectWithValue("Failed to clear cart");
    }
  },
);

export const saveForLaterAsync = createAsyncThunk(
  "cart/saveForLater",
  async (
    { cartItemId, item }: { cartItemId: number; item: CartItem },
    { rejectWithValue },
  ) => {
    try {
      // Remove from cart
      await cartDB.removeFromCart(cartItemId);
      // Add to saved for later
      const id = await cartDB.saveForLater(item);
      return { cartItemId, savedItem: { ...item, id } };
    } catch (error) {
      return rejectWithValue("Failed to save item for later");
    }
  },
);

export const moveToCartAsync = createAsyncThunk(
  "cart/moveToCart",
  async (
    { savedItemId, item }: { savedItemId: number; item: CartItem },
    { rejectWithValue },
  ) => {
    try {
      // Remove from saved for later
      await cartDB.removeFromSavedForLater(savedItemId);
      // Add to cart
      const id = await cartDB.addToCart(item);
      return { savedItemId, cartItem: { ...item, id } };
    } catch (error) {
      return rejectWithValue("Failed to move item to cart");
    }
  },
);

export const addRecentlyViewedAsync = createAsyncThunk(
  "cart/addRecentlyViewed",
  async (productId: string, { rejectWithValue }) => {
    try {
      await cartDB.addRecentlyViewed(productId);
      const recentlyViewed = await cartDB.getRecentlyViewed();
      return recentlyViewed;
    } catch (error) {
      return rejectWithValue("Failed to add to recently viewed");
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic updates for better UX
    optimisticAddToCart: (state, action: PayloadAction<CartItem>) => {
      const tempId = Date.now();
      state.items.push({ ...action.payload, id: tempId });
    },

    optimisticUpdateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    optimisticRemoveFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Rollback on error
    rollbackCart: (
      state,
      action: PayloadAction<(CartItem & { id: number })[]>,
    ) => {
      state.items = action.payload;
    },

    // Promo code management (renamed actions)
    applyPromoCode: (
      state,
      action: PayloadAction<{ code: string; discount: number }>,
    ) => {
      state.appliedPromoCode = action.payload;
    },

    removePromoCode: (state) => {
      state.appliedPromoCode = null;
    },

    // Sync status for multi-tab
    setSyncStatus: (
      state,
      action: PayloadAction<"idle" | "syncing" | "synced" | "error">,
    ) => {
      state.syncStatus = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Load cart
    builder.addCase(loadCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.items = action.payload.cart as (CartItem & { id: number })[];
      state.savedForLater = action.payload.savedForLater as (CartItem & {
        id: number;
      })[];
      state.recentlyViewed = action.payload.recentlyViewed;
      state.loading = false;
      state.syncStatus = "synced";
    });
    builder.addCase(loadCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to load cart";
      state.syncStatus = "error";
    });

    // Add to cart
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      // Update the item with the actual ID from the database
      const tempItem = state.items.find(
        (item) => item.productId === action.payload.productId,
      );
      if (tempItem) {
        Object.assign(tempItem, action.payload);
      } else {
        state.items.push(action.payload);
      }
      state.syncStatus = "synced";
    });
    builder.addCase(addToCartAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Update cart item
    builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
      state.syncStatus = "synced";
    });
    builder.addCase(updateCartItemAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Remove from cart
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.syncStatus = "synced";
    });
    builder.addCase(removeFromCartAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Clear cart
    builder.addCase(clearCartAsync.fulfilled, (state) => {
      state.items = [];
      state.appliedPromoCode = null;
      state.syncStatus = "synced";
    });
    builder.addCase(clearCartAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Save for later
    builder.addCase(saveForLaterAsync.fulfilled, (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload.cartItemId,
      );
      state.savedForLater.push(action.payload.savedItem);
      state.syncStatus = "synced";
    });
    builder.addCase(saveForLaterAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Move to cart
    builder.addCase(moveToCartAsync.fulfilled, (state, action) => {
      state.savedForLater = state.savedForLater.filter(
        (item) => item.id !== action.payload.savedItemId,
      );
      state.items.push(action.payload.cartItem);
      state.syncStatus = "synced";
    });
    builder.addCase(moveToCartAsync.rejected, (state, action) => {
      state.error = action.payload as string;
      state.syncStatus = "error";
    });

    // Recently viewed
    builder.addCase(addRecentlyViewedAsync.fulfilled, (state, action) => {
      state.recentlyViewed = action.payload;
    });
  },
});

export const {
  optimisticAddToCart,
  optimisticUpdateQuantity,
  optimisticRemoveFromCart,
  rollbackCart,
  applyPromoCode,
  removePromoCode,
  setSyncStatus,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;
