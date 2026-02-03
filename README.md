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

## ✨ Features

### 🎯 Core Features

- **Advanced Product Configurator**
  - Real-time 3D product visualization with Three.js
  - Dynamic variant selection (Color, Material, Size)
  - Live price calculations with variant modifiers
  - Shareable product configurations via URL

- **Smart Shopping Cart**
  - Persistent cart with IndexedDB
  - Cross-tab synchronization
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

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit
- **3D Graphics:** Three.js + React Three Fiber
- **Icons:** Lucide React

### Data & Storage

- **Database:** IndexedDB (Offline-first)
- **Cross-tab Sync:** BroadcastChannel API
- **Mock Data:** Type-safe mock products

### Testing & Quality

- **Testing:** Jest + React Testing Library
- **Linting:** ESLint
- **Type Safety:** Full TypeScript coverage

## 🚀 Getting Started

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

```
tizaraa-ecommerce/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (Product listing)
│   ├── cart/                    # Cart page
│   ├── products/                # Product pages
│   │   └── [id]/               # Dynamic product detail
│   ├── not-found.tsx           # 404 page
│   ├── error.tsx               # Error page
│   └── global-error.tsx        # Global error boundary
│
├── components/                   # React components
│   ├── commoncomponents/        # Shared components
│   │   ├── Header.tsx          # Navigation header
│   │   ├── HeaderClient.tsx    # Client-side header
│   │   └── Footer.tsx          # Footer component
│   ├── cart/                    # Cart components
│   │   ├── Cart.tsx            # Main cart view
│   │   ├── CartItem.tsx        # Individual cart item
│   │   ├── SavedForLaterItem.tsx
│   │   └── RecentlyViewed.tsx
│   ├── product/                 # Product components
│   │   ├── ProductConfigurator.tsx
│   │   ├── ProductViewer3D.tsx
│   │   ├── VariantSelector.tsx
│   │   └── PricingDisplay.tsx
│   └── homeProducts/            # Product listing
│       ├── ProductlistingClient.tsx
│       └── ProductlistingSkeleton.tsx
│
├── features/                     # Redux features
│   ├── slices/                  # Redux slices
│   │   ├── cartSlice.ts        # Cart state & actions
│   │   └── cartSelectors.ts    # Memoized selectors
│   └── store/                   # Redux store
│       ├── store.ts            # Store configuration
│       ├── Provider.tsx        # Redux provider
│       └── hooks/              # Custom hooks
│           └── hooks.ts
│
├── lib/                         # Utilities & libraries
│   └── db/                     # Database
│       └── cartDB.ts          # IndexedDB wrapper
│
├── data/                        # Data layer
│   └── mockData.ts            # Mock products & helpers
│
├── helpers/                     # Helper functions
│   └── toast.ts               # Toast notifications
│
├── __tests__/                   # Test files
│   └── cart.test.ts           # Cart functionality tests
│
├── public/                      # Static assets
│   └── models/                # 3D model files (.gltf)
│
└── config files                 # Configuration
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

## 🎯 Key Features

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
- Cross-tab synchronization
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

```typescript
// Automatic sync across browser tabs
Tab 1: Add to cart
   ↓
IndexedDB updated
   ↓
BroadcastChannel message
   ↓
Tab 2: Auto-refresh cart
```

## 🧪 Testing

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

## 📚 Documentation

### API Reference

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

### Performance Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 95+

## 🌐 Browser Support

| Browser       | Version     | Support                  |
| ------------- | ----------- | ------------------------ |
| Chrome        | 90+         | ✅ Full                  |
| Firefox       | 88+         | ✅ Full                  |
| Safari        | 14+         | ✅ Full (with fallbacks) |
| Edge          | 90+         | ✅ Full                  |
| Mobile Safari | iOS 14+     | ✅ Full                  |
| Chrome Mobile | Android 90+ | ✅ Full                  |

### Progressive Enhancement

- **BroadcastChannel**: Full support with localStorage fallback
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

### Cart State Management

```
User Action
    ↓
Optimistic Update (Instant UI)
    ↓
Redux Dispatch
    ↓
IndexedDB Persist
    ↓
BroadcastChannel Sync
    ↓
Other Tabs Update
```

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

## 🛡️ Error Handling

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

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tizaraa Development Team**

- Website: [tizaraa.com](https://tizaraa.com)
- GitHub: [@tizaraa](https://github.com/tizaraa)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Redux team for state management tools
- Three.js community for 3D rendering
- Tailwind CSS for utility-first styling
- Lucide for beautiful icons

## 📞 Support

For support, email support@tizaraa.com or join our Discord server.

---

**Made with ❤️ by Tizaraa Team**

**Last Updated:** February 2026
