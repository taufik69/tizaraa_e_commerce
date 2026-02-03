# 🛒 Tizaraa E-Commerce Platform

A sophisticated, production-ready e-commerce platform built with Next.js 16, featuring advanced product configuration, smart cart management, and real-time inventory tracking.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11.2-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-cyan)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Contributing](#-contributing)

## Features

### Core Features

- **Advanced Product Configurator**
  - Real-time 3D product visualization with React three fiber
  - Dynamic variant selection (Color, Material, Size)
  - Live price calculations with variant modifiers
  - Shareable product configurations via URL

- **Smart Shopping Cart**
  - Persistent cart with IndexedDB
  - Optimistic UI updates
  - Save for later functionality
  - Recently viewed products tracking

- **Intelligent Pricing System**
  - Quantity-based discounts (5%, 10%, 15%)
  - Promo code validation
  - Bundle discount detection
  - Real-time price breakdown

- **Inventory Management**
  - Real-time stock level tracking
  - Low stock warnings
  - Out-of-stock prevention
  - Variant compatibility checking

- **User Experience**
  - Responsive design (Mobile-first)
  - Fast page transitions
  - Toast notifications
  - Loading skeletons
  - Error boundaries

### Data & Storage

- **Database:** IndexedDB (Offline-first)
- **Mock Data:** Type-safe mock products

### Testing & Quality

- **Testing:** Jest + React Testing Library
- **Linting:** ESLint
- **Type Safety:** Full TypeScript coverage

## Getting Started

### Prerequisites

```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/tizaraa-ecommerce.git
cd tizaraa-ecommerce
```

2. **Install dependencies**

```bash
npm install
```

3. **Run development server**

```bash
npm run dev
```

4. **Open browser**

```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

### 1. Product Configuration System

```typescript
// Dynamic price calculation with variants
const finalPrice = calculateProductPrice(
  product,
  {
    color: "color-blue",
    material: "material-leather",
    size: "size-l",
  },
  quantity,
);
```

**Features:**

- Real-time 3D preview
- Variant compatibility checking
- Shareable configuration URLs
- Price breakdown visualization

### 2. Smart Cart Management

```typescript
// Add to cart with optimistic updates
await addToCart({
  productId: "prod-001",
  selectedVariants: { color, material, size },
  quantity: 5,
});
```

**Features:**

- Persistent storage (survives refresh)
- Optimistic UI updates
- Error rollback handling

### 3. Pricing Engine

**Quantity Discounts:**

- Buy 3+: 5% off
- Buy 5+: 10% off
- Buy 10+: 15% off

**Promo Codes:**

- WELCOME10: 10% off (min ৳5,000)
- SAVE500: ৳500 off (min ৳10,000)
- MEGA25: 25% off (min ৳25,000)

### 4. Inventory Management

```typescript
// Real-time stock levels
const stockLevel = getStockLevel(product.stock);
// Returns: 'high' | 'medium' | 'low' | 'out'
```

### 5. Cross-Tab Synchronization

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Run specific test file
npm test cart.test.ts
```

### Test Coverage

```
✅ Product price calculations (base + modifiers)
✅ Quantity discount logic (3+, 5+, 10+)
✅ Promo code validation
✅ Stock level management
✅ Variant compatibility
✅ Edge cases & integration tests
```

#### useCart Hook

```typescript
const {
  // State
  items, // CartItem[]
  cartCount, // number
  subtotal, // number
  total, // number

  // Actions
  addToCart, // (item: CartItem) => Promise<void>
  updateQuantity, // (id, qty) => Promise<void>
  removeFromCart, // (id) => Promise<void>
  applyPromo, // (code) => { success, message }
} = useCart();
```

#### Product Configuration

```typescript
interface Product {
  id: string;
  name: string;
  basePrice: number;
  variants: {
    colors: Variant[];
    materials: Variant[];
    sizes: Variant[];
  };
  images: string[];
  modelUrl?: string;
}
```

#### Cart Item Structure

```typescript
interface CartItem {
  productId: string;
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  };
  quantity: number;
  selectedImage?: {
    image: string;
    index: number;
  };
}
```

## ⚡ Performance

### Optimization Techniques

1. **Memoized Selectors**
   - Using Reselect for cart calculations
   - Prevents unnecessary re-renders

2. **Optimistic Updates**
   - Immediate UI feedback
   - Background persistence

3. **Code Splitting**
   - Lazy loading for 3D viewer
   - Route-based splitting

4. **IndexedDB**
   - Fast local storage
   - Offline-first approach

5. **Image Optimization**
   - Next.js Image component
   - Automatic format conversion

### Progressive Enhancement

- **IndexedDB**: Universal support
- **3D Models**: Graceful degradation to 2D images

## 🎨 UI/UX Features

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized interactions

### Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Animations

- Smooth transitions
- Loading states
- Skeleton screens
- Toast notifications

## 🔒 Data Flow

### Error Handling

```
Action Dispatch
    ↓
Try: Optimistic Update
    ↓
Async Operation
    ↓
Success? → Done
    ↓
Failure? → Rollback to Previous State
    ↓
Show Error Toast
```

## Error Handling

- **Global Error Boundary**: Catches React errors
- **Page-level Error Pages**: Custom 404, 500, etc.
- **Optimistic Update Rollback**: Automatic state recovery
- **Toast Notifications**: User-friendly error messages

## 🚧 Future Enhancements

- [ ] User authentication & profiles
- [ ] Wishlist functionality
- [ ] Product reviews & ratings
- [ ] Order history
- [ ] Payment integration
- [ ] Advanced filtering & search
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Quality
npm run lint            # Run ESLint
npm test               # Run tests
npm test -- --coverage # Test coverage

# Type checking
npx tsc --noEmit       # Check TypeScript errors
```

## 👨‍💻 Author

**Tizaraa Development Team**

- Website: [tizaraa.com](https://tizaraa.com)
- GitHub: [@tizaraa](https://github.com/taufik69/tizaraa_e_commerce)

## 📞 Support

For support, email support@tizaraa.com or join our Discord server.

---
