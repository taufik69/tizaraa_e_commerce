import { CartItem } from "@/data/mockData";

const DB_NAME = "ProductConfiguratorDB";
const DB_VERSION = 1;
const CART_STORE = "cart";
const SAVED_FOR_LATER_STORE = "savedForLater";
const RECENTLY_VIEWED_STORE = "recentlyViewed";

interface DBStores {
  cart: CartItem;
  savedForLater: CartItem;
  recentlyViewed: {
    productId: string;
    timestamp: number;
  };
}

class CartDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create cart store
        if (!db.objectStoreNames.contains(CART_STORE)) {
          const cartStore = db.createObjectStore(CART_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          cartStore.createIndex("productId", "productId", { unique: false });
        }

        // Create saved for later store
        if (!db.objectStoreNames.contains(SAVED_FOR_LATER_STORE)) {
          const savedStore = db.createObjectStore(SAVED_FOR_LATER_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          savedStore.createIndex("productId", "productId", { unique: false });
        }

        // Create recently viewed store
        if (!db.objectStoreNames.contains(RECENTLY_VIEWED_STORE)) {
          const recentStore = db.createObjectStore(RECENTLY_VIEWED_STORE, {
            keyPath: "productId",
          });
          recentStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  // Cart operations
  async getCart(): Promise<CartItem[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CART_STORE, "readonly");
      const store = transaction.objectStore(CART_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addToCart(item: CartItem & { id?: number }): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CART_STORE, "readwrite");
      const store = transaction.objectStore(CART_STORE);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCartItem(id: number, updates: Partial<CartItem>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CART_STORE, "readwrite");
      const store = transaction.objectStore(CART_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error("Item not found"));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeFromCart(id: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CART_STORE, "readwrite");
      const store = transaction.objectStore(CART_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearCart(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CART_STORE, "readwrite");
      const store = transaction.objectStore(CART_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Saved for later operations
  async getSavedForLater(): Promise<CartItem[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SAVED_FOR_LATER_STORE, "readonly");
      const store = transaction.objectStore(SAVED_FOR_LATER_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveForLater(item: CartItem & { id?: number }): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SAVED_FOR_LATER_STORE, "readwrite");
      const store = transaction.objectStore(SAVED_FOR_LATER_STORE);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSavedForLater(id: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SAVED_FOR_LATER_STORE, "readwrite");
      const store = transaction.objectStore(SAVED_FOR_LATER_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Recently viewed operations
  async addRecentlyViewed(productId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction(RECENTLY_VIEWED_STORE, "readwrite");
        const store = transaction.objectStore(RECENTLY_VIEWED_STORE);

        // Add or update the product with current timestamp
        const item = {
          productId,
          timestamp: Date.now(),
        };

        const putRequest = store.put(item);

        putRequest.onsuccess = async () => {
          // Keep only the 10 most recent items
          const index = store.index("timestamp");
          const allRequest = index.openCursor(null, "prev");
          const items: string[] = [];

          allRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              items.push(cursor.value.productId);
              if (items.length < 10) {
                cursor.continue();
              } else {
                // Delete items beyond the 10th
                cursor.continue();
                if (cursor) {
                  store.delete(cursor.value.productId);
                }
              }
            } else {
              resolve();
            }
          };

          allRequest.onerror = () => reject(allRequest.error);
        };

        putRequest.onerror = () => reject(putRequest.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getRecentlyViewed(): Promise<string[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(RECENTLY_VIEWED_STORE, "readonly");
      const store = transaction.objectStore(RECENTLY_VIEWED_STORE);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev");

      const products: string[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && products.length < 10) {
          products.push(cursor.value.productId);
          cursor.continue();
        } else {
          resolve(products);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const cartDB = new CartDB();
