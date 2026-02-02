// src/store/middleware/cartSyncMiddleware.ts
import { Middleware } from "@reduxjs/toolkit";
import { loadCart, setSyncStatus } from "../../slices/cartSlice";

const STORAGE_KEY = "cart_sync";
const SYNC_CHANNEL = "cart_sync_channel";

export const cartSyncMiddleware: Middleware = (store) => {
  // BroadcastChannel for cross-tab communication
  let channel: BroadcastChannel | null = null;

  // Initialize BroadcastChannel if supported
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(SYNC_CHANNEL);

    channel.onmessage = (event) => {
      if (event.data.type === "CART_UPDATED") {
        // Reload cart from IndexedDB when another tab updates it
        store.dispatch(setSyncStatus("syncing"));
        store.dispatch(loadCart());
      }
    };
  }

  // Listen to storage events for browsers without BroadcastChannel
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        store.dispatch(setSyncStatus("syncing"));
        store.dispatch(loadCart());
      }
    });
  }

  return (next) => (action) => {
    const result = next(action);

    // Notify other tabs when cart is modified
    if (
      action.type.startsWith("cart/") &&
      action.type.includes("/fulfilled") &&
      action.type !== "cart/loadCart/fulfilled"
    ) {
      // Broadcast to other tabs
      if (channel) {
        channel.postMessage({ type: "CART_UPDATED" });
      }

      // Fallback to localStorage event
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }
    }

    return result;
  };
};
