# Advanced Product Configurator with Smart Cart Management

A sophisticated e-commerce product configurator with an advanced shopping cart system built with Next.js, Redux, and IndexedDB.

## Features

### Part 1: Product Configuration (Already Implemented)

- ✅ Dynamic variant selection with real-time price updates
- ✅ Quantity discounts (5%, 10%, 15%)
- ✅ Promo code validation
- ✅ Shareable URLs with configuration state
- ✅ 3D product visualization (placeholder)

### Part 2: Advanced Cart Management (NEW)

#### ✅ Persistent Cart

- **IndexedDB Integration**: Offline-first storage using IndexedDB
- **Cross-Tab Sync**: BroadcastChannel API for real-time synchronization across browser tabs
- **Persistent State**: Cart survives browser refresh and system restarts
- **Fallback Support**: localStorage events for browsers without BroadcastChannel

#### ✅ Smart Features

- **Save for Later**: Move items from cart to "saved for later" list
- **Recently Viewed**: Track last 10 viewed products with timestamps
- **Bundle Discounts**: Automatic detection of bundle deals
  - Buy 3+ of same product: 15% off
  - Office Setup Bundle (Chair + Desk): 10% off
  - Complete Workspace (Chair + Desk + Monitor Arm): 15% off
- **Low Stock Warnings**: Real-time alerts when items are low in stock

#### ✅ Cart Operations

- **Add/Update/Remove**: Full CRUD operations with optimistic updates
- **Quantity Management**: Inline quantity adjustment with validation
- **Promo Codes**: Apply and validate promotional codes
- **Price Calculations**:
  - Subtotal with variant modifiers
  - Quantity discounts per item
  - Promo code discounts
  - Tax and shipping calculations
- **Error Handling**: Optimistic updates with automatic rollback on failure

#### ✅ Technical Implementation

- **State Management**: Redux Toolkit with async thunks
- **Middleware**: Custom middleware for cross-tab synchronization
- **Selectors**: Memoized selectors using Reselect for performance
- **TypeScript**: Full type safety throughout the application
- **Race Condition Handling**: Proper handling of concurrent updates across tabs

#### ✅ Unit Tests

- **Pricing Logic Tests**: 10+ test cases covering:
  - Base price calculations
  - Variant modifiers
  - Quantity discounts (5%, 10%, 15%)
  - Promo code validation
  - Edge cases and complex scenarios
  - Stacking discounts

## Project Structure

```
src/
├── components/
│   ├── cart/
│   │   ├── Cart.tsx                    # Main cart component
│   │   ├── CartItem.tsx                # Individual cart item
│   │   ├── SavedForLaterItem.tsx       # Saved items display
│   │   └── RecentlyViewed.tsx          # Recently viewed products
│   └── product/
│       ├── ProductConfigurator.tsx     # Product configuration page
│       ├── PricingDisplay.tsx          # Price breakdown
│       └── VariantSelector.tsx         # Variant selection UI
├── store/
│   ├── slices/
│   │   └── cartSlice.ts               # Redux cart slice
│   ├── selectors/
│   │   └── cartSelectors.ts           # Memoized selectors
│   ├── hooks/
│   │   └── useCart.ts                 # Custom cart hook
│   ├── middleware/
│   │   └── cartSyncMiddleware.ts      # Cross-tab sync
│   ├── store.ts                       # Redux store configuration
│   └── Provider.tsx                   # Redux provider component
├── lib/
│   └── db/
│       └── cartDB.ts                  # IndexedDB wrapper
├── data/
│   └── mockData.ts                    # Product data and helpers
└── __tests__/
    └── cart.test.ts                   # Unit tests

```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Usage

### Adding to Cart

```typescript
import { useCart } from "@/store/hooks/useCart";

function ProductPage() {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    await addToCart({
      productId: "prod-001",
      selectedVariants: {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      },
      quantity: 1,
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Accessing Cart State

```typescript
import { useCart } from "@/store/hooks/useCart";

function CartSummary() {
  const {
    items,              // Cart items
    cartCount,          // Total item count
    subtotal,           // Subtotal before discounts
    total,              // Final total
    lowStockItems,      // Items with low stock
    bundleDiscounts,    // Available bundle deals
  } = useCart();

  return (
    <div>
      <p>{cartCount} items</p>
      <p>Total: ৳{total.toLocaleString()}</p>
    </div>
  );
}
```

### Cart Operations

```typescript
const {
  updateQuantity, // Update item quantity
  removeFromCart, // Remove item
  clearCart, // Clear all items
  saveForLater, // Save item for later
  moveToCart, // Move saved item to cart
  applyPromo, // Apply promo code
  removePromo, // Remove promo code
} = useCart();

// Update quantity with optimistic update
await updateQuantity(itemId, 5);

// Apply promo code
const result = applyPromo("WELCOME10");
if (result.success) {
  console.log("Promo applied!");
}
```

## Data Flow

### Cross-Tab Synchronization

```
Tab 1: Add to Cart
    ↓
IndexedDB Updated
    ↓
BroadcastChannel Message
    ↓
Tab 2: Receives Message
    ↓
Redux: loadCart()
    ↓
Tab 2: UI Updates
```

### Optimistic Updates with Rollback

```
User Action (Remove Item)
    ↓
Optimistic Update (UI updates immediately)
    ↓
Persist to IndexedDB
    ↓
Success? → Done
    ↓
Failure? → Rollback to Previous State
```

## Advanced Features

### Bundle Detection Algorithm

The cart automatically detects applicable bundle discounts:

1. **Single Product Bundle**: Count quantities of each product
2. **Complementary Bundles**: Check for specific product combinations
3. **Apply Best Discount**: Automatically applies highest applicable discount

### Stock Management

Real-time stock level tracking:

- **High Stock**: 20+ units (no warning)
- **Medium Stock**: 6-20 units (informational)
- **Low Stock**: 1-5 units (warning displayed)
- **Out of Stock**: 0 units (checkout prevented)

### Promo Code Validation

Multi-step validation process:

1. Check code exists
2. Verify expiration date
3. Check minimum purchase requirement
4. Calculate discount (percentage or fixed)
5. Apply to cart total (after quantity discounts)

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test cart.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage

The test suite includes:

- ✅ Base price calculations
- ✅ Variant price modifiers
- ✅ Quantity discounts (3+, 5+, 10+)
- ✅ Promo code validation
- ✅ Expired promo codes
- ✅ Minimum purchase requirements
- ✅ Case-insensitive promo codes
- ✅ Stacking discounts
- ✅ Edge cases (exact minimum, large quantities)
- ✅ Complex multi-item scenarios

## Performance Optimizations

1. **Memoized Selectors**: Using Reselect to prevent unnecessary re-renders
2. **Optimistic Updates**: Immediate UI feedback with background persistence
3. **Lazy Loading**: Components loaded on-demand
4. **IndexedDB**: Fast local storage for cart data
5. **BroadcastChannel**: Efficient cross-tab communication

## Browser Compatibility

- ✅ Chrome/Edge (Full support including BroadcastChannel)
- ✅ Firefox (Full support)
- ✅ Safari (Fallback to localStorage events)
- ✅ Mobile browsers (Progressive enhancement)

## Future Enhancements

- [ ] Wishlist functionality
- [ ] Cart abandonment recovery
- [ ] Product recommendations
- [ ] Advanced filtering in cart
- [ ] Export cart as PDF
- [ ] Share cart with others
- [ ] Scheduled purchases
- [ ] Subscription management

## API Reference

### useCart Hook

```typescript
interface UseCartReturn {
  // State
  items: CartItem[];
  savedForLater: CartItem[];
  recentlyViewed: string[];
  recentlyViewedProducts: Product[];
  appliedPromoCode: { code: string; discount: number } | null;
  loading: boolean;
  error: string | null;
  syncStatus: "idle" | "syncing" | "synced" | "error";

  // Computed Values
  cartCount: number;
  subtotal: number;
  quantityDiscount: number;
  promoDiscount: number;
  total: number;
  totalSavings: number;
  lowStockItems: LowStockItem[];
  bundleDiscounts: BundleDiscount[];

  // Actions
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  saveForLater: (cartItemId: number, item: CartItem) => Promise<void>;
  moveToCart: (savedItemId: number, item: CartItem) => Promise<void>;
  addRecentlyViewed: (productId: string) => Promise<void>;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
