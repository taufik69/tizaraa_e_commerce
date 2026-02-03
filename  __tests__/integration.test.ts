// __tests__/integration.test.ts
import {
  calculateProductPrice,
  validatePromoCode,
  mockProducts,
  getProductById,
  checkVariantCompatibility,
} from "@/data/mockData";

describe("Complete User Flow Integration Tests", () => {
  describe("Shopping Journey: Add to Cart → Apply Discount → Checkout", () => {
    test("should calculate correct total for single product purchase", () => {
      const product = mockProducts[0]; // Premium Office Chair
      const selectedVariants = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };
      const quantity = 1;

      const itemTotal = calculateProductPrice(
        product,
        selectedVariants,
        quantity,
      );

      expect(itemTotal).toBe(15999); // Base price with no modifiers
    });

    test("should apply quantity discount for bulk purchase", () => {
      const product = mockProducts[0];
      const selectedVariants = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };
      const quantity = 5; // Should get 10% discount

      const itemTotal = calculateProductPrice(
        product,
        selectedVariants,
        quantity,
      );
      const expectedSubtotal = 15999 * 5;
      const expectedDiscount = Math.round(expectedSubtotal * 0.1);
      const expectedTotal = expectedSubtotal - expectedDiscount;

      expect(itemTotal).toBe(expectedTotal);
      expect(itemTotal).toBeLessThan(expectedSubtotal);
    });

    test("should stack quantity discount with promo code", () => {
      const product = mockProducts[0];
      const selectedVariants = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };
      const quantity = 5;

      // Calculate with quantity discount
      const afterQuantityDiscount = calculateProductPrice(
        product,
        selectedVariants,
        quantity,
      );

      // Apply promo code
      const promoResult = validatePromoCode("WELCOME10", afterQuantityDiscount);

      expect(promoResult.valid).toBe(true);

      const finalTotal = afterQuantityDiscount - promoResult.discount;
      const originalTotal = 15999 * 5;

      expect(finalTotal).toBeLessThan(originalTotal);
      expect(finalTotal).toBeLessThan(afterQuantityDiscount);
    });
  });

  describe("Multi-Product Cart Scenarios", () => {
    test("should calculate total for multiple different products", () => {
      const chair = mockProducts[0]; // ৳15,999
      const desk = mockProducts[1]; // ৳25,999
      const monitorArm = mockProducts[2]; // ৳4,999

      const chairPrice = calculateProductPrice(
        chair,
        { color: "color-black", material: "material-mesh", size: "size-m" },
        2,
      );

      const deskPrice = calculateProductPrice(
        desk,
        {
          color: "color-white",
          material: "material-laminate",
          size: "size-120",
        },
        1,
      );

      const armPrice = calculateProductPrice(
        monitorArm,
        {
          color: "color-silver",
          material: "material-aluminum",
          size: "size-single",
        },
        1,
      );

      const cartTotal = chairPrice + deskPrice + armPrice;

      expect(cartTotal).toBeGreaterThan(0);
      expect(cartTotal).toBe(chairPrice + deskPrice + armPrice);
    });

    test("should validate promo code for multi-product cart", () => {
      const cartTotal = 50000; // Multiple products totaling ৳50,000

      const result = validatePromoCode("MEGA25", cartTotal);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(12500); // 25% of 50,000
    });
  });

  describe("Product Configuration Edge Cases", () => {
    test("should handle premium configuration with all modifiers", () => {
      const chair = mockProducts[0];
      const premiumConfig = {
        color: "color-red", // +₹1,000
        material: "material-leather", // +₹3,000
        size: "size-xl", // +₹1,500
      };

      const price = calculateProductPrice(chair, premiumConfig, 1);
      const expectedPrice = 15999 + 1000 + 3000 + 1500;

      expect(price).toBe(expectedPrice);
    });

    test("should handle budget configuration with negative modifiers", () => {
      const chair = mockProducts[0];
      const budgetConfig = {
        color: "color-black", // +₹0
        material: "material-mesh", // +₹0
        size: "size-s", // -₹500
      };

      const price = calculateProductPrice(chair, budgetConfig, 1);
      const expectedPrice = 15999 - 500;

      expect(price).toBe(expectedPrice);
    });
  });

  describe("Variant Compatibility Workflows", () => {
    test("should prevent incompatible variant selection", () => {
      const chair = mockProducts[0];

      // Blue color is incompatible with wood material
      const blueColor = chair.variants.colors.find(
        (c) => c.id === "color-blue",
      )!;
      const selectedVariants = {
        color: "color-blue",
        material: "material-wood",
        size: "size-m",
      };

      const woodMaterial = chair.variants.materials.find(
        (m) => m.id === "material-wood",
      )!;

      const isCompatible = checkVariantCompatibility(
        woodMaterial,
        selectedVariants,
      );

      expect(isCompatible).toBe(false);
    });

    test("should allow compatible variant combinations", () => {
      const chair = mockProducts[0];

      const selectedVariants = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };

      const meshMaterial = chair.variants.materials.find(
        (m) => m.id === "material-mesh",
      )!;

      const isCompatible = checkVariantCompatibility(
        meshMaterial,
        selectedVariants,
      );

      expect(isCompatible).toBe(true);
    });
  });

  describe("Promo Code Business Rules", () => {
    test("should reject promo code if minimum not met", () => {
      const cartTotal = 3000;
      const result = validatePromoCode("WELCOME10", cartTotal);

      expect(result.valid).toBe(false);
      expect(result.message).toContain("Minimum purchase");
    });

    test("should accept promo code when minimum is exactly met", () => {
      const cartTotal = 5000;
      const result = validatePromoCode("WELCOME10", cartTotal);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(500); // 10% of 5,000
    });

    test("should handle fixed discount promo codes", () => {
      const cartTotal = 15000;
      const result = validatePromoCode("SAVE500", cartTotal);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(500); // Fixed ৳500
    });

    test("should handle percentage discount promo codes", () => {
      const cartTotal = 30000;
      const result = validatePromoCode("MEGA25", cartTotal);

      expect(result.valid).toBe(true);
      expect(result.discount).toBe(7500); // 25% of 30,000
    });
  });

  describe("Complex Pricing Scenarios", () => {
    test("should calculate correct total for large bulk order", () => {
      const product = mockProducts[0];
      const selectedVariants = {
        color: "color-gray", // +₹500
        material: "material-leather", // +₹3,000
        size: "size-l", // +₹1,000
      };
      const quantity = 20; // 15% discount

      const unitPrice = 15999 + 500 + 3000 + 1000;
      const subtotal = unitPrice * quantity;
      const discount = Math.round(subtotal * 0.15);
      const expectedTotal = subtotal - discount;

      const actualTotal = calculateProductPrice(
        product,
        selectedVariants,
        quantity,
      );

      expect(actualTotal).toBe(expectedTotal);
    });

    test("should handle maximum possible discount scenario", () => {
      const product = mockProducts[0];
      const selectedVariants = {
        color: "color-red", // +₹1,000
        material: "material-leather", // +₹3,000
        size: "size-xl", // +₹1,500
      };
      const quantity = 10; // 15% quantity discount

      const unitPrice = 15999 + 1000 + 3000 + 1500;
      const subtotal = unitPrice * quantity;
      const quantityDiscount = Math.round(subtotal * 0.15);
      const afterQuantityDiscount = subtotal - quantityDiscount;

      const calculatedPrice = calculateProductPrice(
        product,
        selectedVariants,
        quantity,
      );

      // Apply maximum promo
      const promoResult = validatePromoCode("MEGA25", afterQuantityDiscount);

      expect(calculatedPrice).toBe(afterQuantityDiscount);
      expect(promoResult.valid).toBe(true);

      const finalTotal = afterQuantityDiscount - promoResult.discount;
      const totalSavings = subtotal - finalTotal;

      expect(totalSavings).toBeGreaterThan(0);
    });
  });

  describe("Product Catalog Operations", () => {
    test("should retrieve product by ID correctly", () => {
      const productId = "prod-001";
      const product = getProductById(productId);

      expect(product).toBeDefined();
      expect(product?.id).toBe(productId);
      expect(product?.name).toBe("Premium Office Chair");
    });

    test("should return undefined for non-existent product", () => {
      const product = getProductById("non-existent-id");

      expect(product).toBeUndefined();
    });

    test("should have all required product properties", () => {
      mockProducts.forEach((product) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("description");
        expect(product).toHaveProperty("basePrice");
        expect(product).toHaveProperty("images");
        expect(product).toHaveProperty("rating");
        expect(product).toHaveProperty("reviewCount");
        expect(product).toHaveProperty("variants");
        expect(product.basePrice).toBeGreaterThan(0);
        expect(product.images.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Real-world Shopping Scenarios", () => {
    test("Scenario: First-time buyer with welcome discount", () => {
      // User adds 1 chair to cart
      const chair = mockProducts[0];
      const config = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };

      const itemTotal = calculateProductPrice(chair, config, 1);

      // Tries to apply welcome discount but cart total too low
      let promoResult = validatePromoCode("WELCOME10", itemTotal);
      expect(promoResult.valid).toBe(false);

      // Adds another item to meet minimum
      const cartTotal = itemTotal * 2; // Now meets ৳5,000 minimum
      promoResult = validatePromoCode("WELCOME10", cartTotal);

      expect(promoResult.valid).toBe(true);
      expect(promoResult.discount).toBeGreaterThan(0);
    });

    test("Scenario: Office furniture bundle purchase", () => {
      // User buys complete office setup
      const chair = calculateProductPrice(
        mockProducts[0],
        { color: "color-black", material: "material-mesh", size: "size-m" },
        1,
      );

      const desk = calculateProductPrice(
        mockProducts[1],
        {
          color: "color-white",
          material: "material-laminate",
          size: "size-140",
        },
        1,
      );

      const monitorArm = calculateProductPrice(
        mockProducts[2],
        {
          color: "color-black",
          material: "material-aluminum",
          size: "size-dual",
        },
        1,
      );

      const cartTotal = chair + desk + monitorArm;

      // Apply mega discount
      const promoResult = validatePromoCode("MEGA25", cartTotal);

      expect(promoResult.valid).toBe(true);
      expect(cartTotal - promoResult.discount).toBeLessThan(cartTotal);
    });

    test("Scenario: Bulk corporate order", () => {
      // Company orders 15 chairs
      const chair = mockProducts[0];
      const config = {
        color: "color-black",
        material: "material-mesh",
        size: "size-m",
      };
      const quantity = 15;

      const orderTotal = calculateProductPrice(chair, config, quantity);

      // Verify bulk discount applied
      const regularPrice = 15999 * quantity;
      expect(orderTotal).toBeLessThan(regularPrice);

      // Apply additional corporate discount
      const promoResult = validatePromoCode("MEGA25", orderTotal);
      expect(promoResult.valid).toBe(true);

      const finalTotal = orderTotal - promoResult.discount;
      const totalSavings = regularPrice - finalTotal;

      expect(totalSavings).toBeGreaterThan(10000); // Significant savings
    });
  });
});
