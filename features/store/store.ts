// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../slices/cartSlice";
import { cartSyncMiddleware } from "../store/middleware/cartSyncMiddleware";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["cart/loadCart/fulfilled"],
        // Ignore these paths in the state
        ignoredPaths: ["cart.items", "cart.savedForLater"],
      },
    }).concat(cartSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
