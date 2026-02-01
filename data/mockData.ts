// src/data/mockData.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  rating: number;
  reviewCount: number;
  variants: ProductVariants;
  bundleEligible?: string[];
  category?: string;
  brand?: string;
  modelUrl?: string;
}

export interface ProductVariants {
  colors: Variant[];
  materials: Variant[];
  sizes: Variant[];
}

export interface Variant {
  id: string;
  name: string;
  priceModifier: number;
  stock: number;
  hex?: string;
  incompatibleWith?: string[];
  image?: string;
}

export interface CartItem {
  productId: string;
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  };
  quantity: number;
  customizations?: Record<string, any>;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  validUntil: string;
}

// ==================== MOCK PRODUCTS ====================

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Premium Office Chair',
    description: 'Ergonomic office chair with 3D lumbar support and adjustable armrests. Perfect for long working hours.',
    basePrice: 15999,
    rating: 4.5,
    reviewCount: 234,
    category: 'Furniture',
    brand: 'ErgoMax',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
    ],
    modelUrl: 'models/chair/mid_century_lounge_chair_1k.gltf',
    bundleEligible: ['prod-002', 'prod-003'],
    variants: {
      colors: [
        {
          id: 'color-black',
          name: 'Midnight Black',
          priceModifier: 0,
          stock: 45,
          hex: '#1a1a1a',
        },
        {
          id: 'color-gray',
          name: 'Slate Gray',
          priceModifier: 500,
          stock: 30,
          hex: '#64748b',
        },
        {
          id: 'color-blue',
          name: 'Ocean Blue',
          priceModifier: 800,
          stock: 8, // Low stock
          hex: '#1e40af',
          incompatibleWith: ['material-wood'], // Blue not available with wood
        },
        {
          id: 'color-red',
          name: 'Crimson Red',
          priceModifier: 1000,
          stock: 3, // Very low stock
          hex: '#dc2626',
        },
      ],
      materials: [
        {
          id: 'material-mesh',
          name: 'Breathable Mesh',
          priceModifier: 0,
          stock: 100,
        },
        {
          id: 'material-leather',
          name: 'Premium Leather',
          priceModifier: 3000,
          stock: 50,
        },
        {
          id: 'material-fabric',
          name: 'Luxury Fabric',
          priceModifier: 1500,
          stock: 75,
          incompatibleWith: ['color-red'], // Fabric not available in red
        },
        {
          id: 'material-wood',
          name: 'Wood Finish',
          priceModifier: 2000,
          stock: 20,
          incompatibleWith: ['color-blue'], // Wood not available in blue
        },
      ],
      sizes: [
        {
          id: 'size-s',
          name: 'Small (150-165 cm)',
          priceModifier: -500,
          stock: 25,
        },
        {
          id: 'size-m',
          name: 'Medium (165-180 cm)',
          priceModifier: 0,
          stock: 100,
        },
        {
          id: 'size-l',
          name: 'Large (180-195 cm)',
          priceModifier: 1000,
          stock: 60,
        },
        {
          id: 'size-xl',
          name: 'Extra Large (195+ cm)',
          priceModifier: 1500,
          stock: 15,
        },
      ],
    },
  },

  {
    id: 'prod-002',
    name: 'Standing Desk Pro',
    description: 'Electric height-adjustable standing desk with memory presets and anti-collision technology.',
    basePrice: 25999,
    rating: 4.8,
    reviewCount: 567,
    category: 'Furniture',
    brand: 'DeskMaster',
    images: [
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800',
    ],
    modelUrl: 'models/desk/small_wooden_table_01_1k.gltf',
    bundleEligible: ['prod-001', 'prod-003'],
    variants: {
      colors: [
        {
          id: 'color-white',
          name: 'Arctic White',
          priceModifier: 0,
          stock: 40,
          hex: '#ffffff',
        },
        {
          id: 'color-black',
          name: 'Carbon Black',
          priceModifier: 500,
          stock: 35,
          hex: '#000000',
        },
        {
          id: 'color-walnut',
          name: 'Walnut Brown',
          priceModifier: 1200,
          stock: 6, // Low stock
          hex: '#8b4513',
        },
      ],
      materials: [
        {
          id: 'material-laminate',
          name: 'High-Pressure Laminate',
          priceModifier: 0,
          stock: 80,
        },
        {
          id: 'material-bamboo',
          name: 'Eco Bamboo',
          priceModifier: 2500,
          stock: 30,
        },
        {
          id: 'material-solid-wood',
          name: 'Solid Wood',
          priceModifier: 5000,
          stock: 15,
        },
      ],
      sizes: [
        {
          id: 'size-120',
          name: '120cm × 60cm',
          priceModifier: 0,
          stock: 50,
        },
        {
          id: 'size-140',
          name: '140cm × 70cm',
          priceModifier: 2000,
          stock: 45,
        },
        {
          id: 'size-160',
          name: '160cm × 80cm',
          priceModifier: 4000,
          stock: 30,
        },
        {
          id: 'size-180',
          name: '180cm × 90cm',
          priceModifier: 6000,
          stock: 10,
        },
      ],
    },
  },

  {
    id: 'prod-003',
    name: 'LED Monitor Arm',
    description: 'Dual monitor arm with gas spring technology, supports screens up to 32 inches.',
    basePrice: 4999,
    rating: 4.6,
    reviewCount: 892,
    category: 'Accessories',
    brand: 'MonitorPro',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
    ],
    modelUrl:" models/Television/Television_01_1k.gltf",
    bundleEligible: ['prod-001', 'prod-002'],
    variants: {
      colors: [
        {
          id: 'color-silver',
          name: 'Silver',
          priceModifier: 0,
          stock: 100,
          hex: '#c0c0c0',
        },
        {
          id: 'color-black',
          name: 'Matte Black',
          priceModifier: 300,
          stock: 85,
          hex: '#000000',
        },
        {
          id: 'color-white',
          name: 'Pure White',
          priceModifier: 300,
          stock: 4, // Low stock
          hex: '#ffffff',
        },
      ],
      materials: [
        {
          id: 'material-aluminum',
          name: 'Aluminum Alloy',
          priceModifier: 0,
          stock: 150,
        },
        {
          id: 'material-steel',
          name: 'Reinforced Steel',
          priceModifier: 1000,
          stock: 60,
        },
      ],
      sizes: [
        {
          id: 'size-single',
          name: 'Single Monitor',
          priceModifier: 0,
          stock: 120,
        },
        {
          id: 'size-dual',
          name: 'Dual Monitor',
          priceModifier: 2000,
          stock: 80,
        },
        {
          id: 'size-triple',
          name: 'Triple Monitor',
          priceModifier: 4500,
          stock: 25,
        },
      ],
    },
  },

  {
    id: 'prod-004',
    name: 'Wireless Gaming Headset',
    description: '7.1 Surround Sound wireless gaming headset with RGB lighting and 30-hour battery life.',
    basePrice: 8999,
    rating: 4.7,
    reviewCount: 1234,
    category: 'Electronics',
    brand: 'SoundWave',
    images: [
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    ],
    modelUrl:" models/headset/boombox_1k.gltf",
    bundleEligible: ['prod-005'],
    variants: {
      colors: [
        {
          id: 'color-black',
          name: 'Shadow Black',
          priceModifier: 0,
          stock: 200,
          hex: '#000000',
        },
        {
          id: 'color-white',
          name: 'Ghost White',
          priceModifier: 500,
          stock: 150,
          hex: '#ffffff',
        },
        {
          id: 'color-rgb',
          name: 'RGB Edition',
          priceModifier: 1500,
          stock: 7, // Low stock
          hex: '#ff00ff',
          incompatibleWith: ['material-eco'], // RGB not available with eco materials
        },
      ],
      materials: [
        {
          id: 'material-plastic',
          name: 'Premium ABS Plastic',
          priceModifier: 0,
          stock: 300,
        },
        {
          id: 'material-metal',
          name: 'Aluminum Frame',
          priceModifier: 2000,
          stock: 100,
        },
        {
          id: 'material-eco',
          name: 'Eco-Friendly Composite',
          priceModifier: 1000,
          stock: 50,
          incompatibleWith: ['color-rgb'], // Eco not available with RGB
        },
      ],
      sizes: [
        {
          id: 'size-standard',
          name: 'Standard Fit',
          priceModifier: 0,
          stock: 400,
        },
        {
          id: 'size-large',
          name: 'Large Ear Cups',
          priceModifier: 800,
          stock: 150,
        },
      ],
    },
  },

  {
    id: 'prod-005',
    name: 'Mechanical Keyboard RGB',
    description: 'Hot-swappable mechanical keyboard with Cherry MX switches and per-key RGB lighting.',
    basePrice: 12999,
    rating: 4.9,
    reviewCount: 2103,
    category: 'Electronics',
    brand: 'KeyMaster',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
    ],
    modelUrl: 'models/keyboard/CashRegister_01_1k.gltf',
    bundleEligible: ['prod-004'],
    variants: {
      colors: [
        {
          id: 'color-black',
          name: 'Stealth Black',
          priceModifier: 0,
          stock: 180,
          hex: '#000000',
        },
        {
          id: 'color-white',
          name: 'Ice White',
          priceModifier: 600,
          stock: 5, // Low stock
          hex: '#ffffff',
        },
        {
          id: 'color-gray',
          name: 'Space Gray',
          priceModifier: 400,
          stock: 120,
          hex: '#808080',
        },
      ],
      materials: [
        {
          id: 'material-plastic',
          name: 'ABS Keycaps',
          priceModifier: 0,
          stock: 250,
        },
        {
          id: 'material-pbt',
          name: 'PBT Keycaps',
          priceModifier: 1500,
          stock: 150,
        },
        {
          id: 'material-aluminum',
          name: 'Aluminum Case',
          priceModifier: 3500,
          stock: 40,
        },
      ],
      sizes: [
        {
          id: 'size-60',
          name: '60% Compact',
          priceModifier: -1000,
          stock: 100,
        },
        {
          id: 'size-tkl',
          name: 'TKL (80%)',
          priceModifier: 0,
          stock: 200,
        },
        {
          id: 'size-full',
          name: 'Full Size (100%)',
          priceModifier: 1500,
          stock: 150,
        },
      ],
    },
  },
];

// ==================== PROMO CODES ====================

export const mockPromoCodes: PromoCode[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 5000,
    validUntil: '2026-12-31',
  },
  {
    code: 'SAVE500',
    discountType: 'fixed',
    discountValue: 500,
    minPurchase: 10000,
    validUntil: '2026-06-30',
  },
  {
    code: 'MEGA25',
    discountType: 'percentage',
    discountValue: 25,
    minPurchase: 25000,
    validUntil: '2026-03-31',
  },
  {
    code: 'FLASH1000',
    discountType: 'fixed',
    discountValue: 1000,
    minPurchase: 15000,
    validUntil: '2026-02-15',
  },
];

// ==================== HELPER FUNCTIONS ====================

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find((product) => product.id === id);
};

export const getVariantById = (
  variants: Variant[],
  id: string
): Variant | undefined => {
  return variants.find((variant) => variant.id === id);
};

export const checkVariantCompatibility = (
  variant: Variant,
  selectedVariants: { color?: string; material?: string; size?: string }
): boolean => {
  if (!variant.incompatibleWith) return true;

  const selectedIds = Object.values(selectedVariants).filter(Boolean);
  return !variant.incompatibleWith.some((incompatibleId) =>
    selectedIds.includes(incompatibleId)
  );
};

export const calculateProductPrice = (
  product: Product,
  selectedVariants: {
    color: string;
    material: string;
    size: string;
  },
  quantity: number = 1
): number => {
  let totalPrice = product.basePrice;

  // Add variant modifiers
  const colorVariant = getVariantById(product.variants.colors, selectedVariants.color);
  const materialVariant = getVariantById(product.variants.materials, selectedVariants.material);
  const sizeVariant = getVariantById(product.variants.sizes, selectedVariants.size);

  if (colorVariant) totalPrice += colorVariant.priceModifier;
  if (materialVariant) totalPrice += materialVariant.priceModifier;
  if (sizeVariant) totalPrice += sizeVariant.priceModifier;

  // Apply quantity discounts
  let discount = 0;
  if (quantity >= 10) {
    discount = 0.15; // 15% off for 10+ items
  } else if (quantity >= 5) {
    discount = 0.10; // 10% off for 5-9 items
  } else if (quantity >= 3) {
    discount = 0.05; // 5% off for 3-4 items
  }

  const subtotal = totalPrice * quantity;
  const discountAmount = subtotal * discount;

  return Math.round(subtotal - discountAmount);
};

export const validatePromoCode = (
  code: string,
  cartTotal: number
): { valid: boolean; discount: number; message: string } => {
  const promo = mockPromoCodes.find((p) => p.code.toLowerCase() === code.toLowerCase());

  if (!promo) {
    return { valid: false, discount: 0, message: 'Invalid promo code' };
  }

  const currentDate = new Date();
  const validUntilDate = new Date(promo.validUntil);

  if (currentDate > validUntilDate) {
    return { valid: false, discount: 0, message: 'Promo code has expired' };
  }

  if (promo.minPurchase && cartTotal < promo.minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum purchase of ৳${promo.minPurchase.toLocaleString()} required`,
    };
  }

  const discount =
    promo.discountType === 'percentage'
      ? Math.round((cartTotal * promo.discountValue) / 100)
      : promo.discountValue;

  return {
    valid: true,
    discount,
    message: `Promo code applied! You saved ৳${discount.toLocaleString()}`,
  };
};

// ==================== STOCK HELPERS ====================

export const getStockLevel = (stock: number): 'out' | 'low' | 'medium' | 'high' => {
  if (stock === 0) return 'out';
  if (stock <= 5) return 'low';
  if (stock <= 20) return 'medium';
  return 'high';
};

export const getStockMessage = (stock: number): string => {
  const level = getStockLevel(stock);
  
  switch (level) {
    case 'out':
      return 'Out of stock';
    case 'low':
      return `Only ${stock} left in stock!`;
    case 'medium':
      return `${stock} available`;
    case 'high':
      return 'In stock';
  }
};