// __tests__/cart.test.ts
import {
  calculateProductPrice,
  validatePromoCode,
  getStockLevel,
  getStockMessage,
  checkVariantCompatibility,
  mockProducts,
  mockPromoCodes,
} from "@/data/mockData";

describe("Product Price Calculation", () => {
  const testProduct = mockProducts[0]; // Premium Office Chair

  test("should calculate base price correctly", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice);
  });

  test("should add color modifier to price", () => {
    const selectedVariants = {
      color: "color-gray", // +500
      material: "material-mesh",
      size: "size-m",
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice + 500);
  });

  test("should add material modifier to price", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-leather", // +3000
      size: "size-m",
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice + 3000);
  });

  test("should add size modifier to price", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-l", // +1000
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice + 1000);
  });

  test("should combine all modifiers correctly", () => {
    const selectedVariants = {
      color: "color-gray", // +500
      material: "material-leather", // +3000
      size: "size-l", // +1000
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice + 500 + 3000 + 1000);
  });

  test("should apply 5% discount for 3+ quantity", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };
    const quantity = 3;
    const basePrice = testProduct.basePrice;
    const subtotal = basePrice * quantity;
    const expectedDiscount = Math.round(subtotal * 0.05);
    const expectedTotal = subtotal - expectedDiscount;

    const price = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );
    expect(price).toBe(expectedTotal);
  });

  test("should apply 10% discount for 5+ quantity", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };
    const quantity = 5;
    const basePrice = testProduct.basePrice;
    const subtotal = basePrice * quantity;
    const expectedDiscount = Math.round(subtotal * 0.1);
    const expectedTotal = subtotal - expectedDiscount;

    const price = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );
    expect(price).toBe(expectedTotal);
  });

  test("should apply 15% discount for 10+ quantity", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };
    const quantity = 10;
    const basePrice = testProduct.basePrice;
    const subtotal = basePrice * quantity;
    const expectedDiscount = Math.round(subtotal * 0.15);
    const expectedTotal = subtotal - expectedDiscount;

    const price = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );
    expect(price).toBe(expectedTotal);
  });

  test("should handle negative size modifier correctly", () => {
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-s", // -500
    };
    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice - 500);
  });

  test("should calculate complex price with all modifiers and quantity discount", () => {
    const selectedVariants = {
      color: "color-blue", // +800
      material: "material-leather", // +3000
      size: "size-xl", // +1500
    };
    const quantity = 5; // 10% discount
    const unitPrice = testProduct.basePrice + 800 + 3000 + 1500;
    const subtotal = unitPrice * quantity;
    const discount = Math.round(subtotal * 0.1);
    const expectedTotal = subtotal - discount;

    const price = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );
    expect(price).toBe(expectedTotal);
  });
});

describe("Promo Code Validation", () => {
  test("should validate correct promo code", () => {
    const result = validatePromoCode("WELCOME10", 10000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(1000); // 10% of 10000
  });

  test("should reject invalid promo code", () => {
    const result = validatePromoCode("INVALID", 10000);
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.message).toBe("Invalid promo code");
  });

  test("should handle case-insensitive promo codes", () => {
    const result1 = validatePromoCode("welcome10", 10000);
    const result2 = validatePromoCode("WELCOME10", 10000);
    const result3 = validatePromoCode("WeLcOmE10", 10000);

    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(true);
    expect(result3.valid).toBe(true);
  });

  test("should reject promo code below minimum purchase", () => {
    const result = validatePromoCode("WELCOME10", 3000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("Minimum purchase");
  });

  test("should accept promo code at exact minimum purchase", () => {
    const result = validatePromoCode("WELCOME10", 5000);
    expect(result.valid).toBe(true);
  });

  test("should calculate percentage discount correctly", () => {
    const result = validatePromoCode("MEGA25", 30000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(7500); // 25% of 30000
  });

  test("should calculate fixed discount correctly", () => {
    const result = validatePromoCode("SAVE500", 15000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500);
  });

  test("should reject expired promo code", () => {
    // Create a promo code that expired yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const expiredPromo = {
      code: "EXPIRED",
      discountType: "percentage" as const,
      discountValue: 10,
      validUntil: yesterday.toISOString().split("T")[0],
    };

    mockPromoCodes.push(expiredPromo);

    const result = validatePromoCode("EXPIRED", 10000);
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Promo code has expired");

    // Clean up
    mockPromoCodes.pop();
  });

  test("should accept valid future promo code", () => {
    const result = validatePromoCode("WELCOME10", 10000);
    expect(result.valid).toBe(true);
  });

  test("should handle large cart totals correctly", () => {
    const result = validatePromoCode("MEGA25", 100000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(25000); // 25% of 100000
  });
});

describe("Stock Level Management", () => {
  test("should return 'out' for 0 stock", () => {
    expect(getStockLevel(0)).toBe("out");
  });

  test("should return 'low' for 1-5 stock", () => {
    expect(getStockLevel(1)).toBe("low");
    expect(getStockLevel(3)).toBe("low");
    expect(getStockLevel(5)).toBe("low");
  });

  test("should return 'medium' for 6-20 stock", () => {
    expect(getStockLevel(6)).toBe("medium");
    expect(getStockLevel(15)).toBe("medium");
    expect(getStockLevel(20)).toBe("medium");
  });

  test("should return 'high' for 21+ stock", () => {
    expect(getStockLevel(21)).toBe("high");
    expect(getStockLevel(100)).toBe("high");
    expect(getStockLevel(1000)).toBe("high");
  });

  test("should return correct stock message for out of stock", () => {
    expect(getStockMessage(0)).toBe("Out of stock");
  });

  test("should return correct stock message for low stock", () => {
    expect(getStockMessage(3)).toBe("Only 3 left in stock!");
  });

  test("should return correct stock message for medium stock", () => {
    expect(getStockMessage(15)).toBe("15 available");
  });

  test("should return correct stock message for high stock", () => {
    expect(getStockMessage(50)).toBe("In stock");
  });
});

describe("Variant Compatibility", () => {
  const testProduct = mockProducts[0];

  test("should allow compatible variants", () => {
    const blueColor = testProduct.variants.colors.find(
      (c) => c.id === "color-blue",
    )!;
    const selectedVariants = {
      color: "color-blue",
      material: "material-mesh",
      size: "size-m",
    };

    expect(checkVariantCompatibility(blueColor, selectedVariants)).toBe(true);
  });

  test("should detect incompatible color-material combination", () => {
    const blueColor = testProduct.variants.colors.find(
      (c) => c.id === "color-blue",
    )!;
    const selectedVariants = {
      color: "color-blue",
      material: "material-wood", // Incompatible with blue
      size: "size-m",
    };

    const woodMaterial = testProduct.variants.materials.find(
      (m) => m.id === "material-wood",
    )!;

    expect(checkVariantCompatibility(woodMaterial, selectedVariants)).toBe(
      false,
    );
  });

  test("should detect incompatible material-color combination", () => {
    const fabricMaterial = testProduct.variants.materials.find(
      (m) => m.id === "material-fabric",
    )!;
    const selectedVariants = {
      color: "color-red", // Incompatible with fabric
      material: "material-fabric",
      size: "size-m",
    };

    expect(checkVariantCompatibility(fabricMaterial, selectedVariants)).toBe(
      false,
    );
  });

  test("should allow variants without incompatibility rules", () => {
    const blackColor = testProduct.variants.colors.find(
      (c) => c.id === "color-black",
    )!;
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };

    expect(checkVariantCompatibility(blackColor, selectedVariants)).toBe(true);
  });
});

describe("Integration Tests", () => {
  test("should calculate final price with all features combined", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-gray", // +500
      material: "material-leather", // +3000
      size: "size-l", // +1000
    };
    const quantity = 5; // 10% quantity discount

    const unitPrice = testProduct.basePrice + 500 + 3000 + 1000;
    const subtotal = unitPrice * quantity;
    const quantityDiscount = Math.round(subtotal * 0.1);
    const afterQuantityDiscount = subtotal - quantityDiscount;

    // Apply promo code
    const promoResult = validatePromoCode("WELCOME10", afterQuantityDiscount);
    const finalTotal = afterQuantityDiscount - promoResult.discount;

    const calculatedPrice = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );

    expect(calculatedPrice).toBe(afterQuantityDiscount);
    expect(promoResult.valid).toBe(true);
    expect(finalTotal).toBeLessThan(subtotal);
  });

  test("should handle edge case of exact minimum quantity for discount", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };

    const price3 = calculateProductPrice(testProduct, selectedVariants, 3);
    const price2 = calculateProductPrice(testProduct, selectedVariants, 2);

    expect(price3).toBeLessThan(price2 * 1.5); // 3 items with discount should be less than 2 items * 1.5
  });

  test("should handle maximum variant modifiers", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-red", // +1000 (highest color modifier)
      material: "material-leather", // +3000 (highest material modifier)
      size: "size-xl", // +1500 (highest size modifier)
    };

    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice + 1000 + 3000 + 1500);
  });

  test("should handle minimum variant modifiers", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-black", // +0
      material: "material-mesh", // +0
      size: "size-s", // -500
    };

    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice - 500);
  });
});

describe("Edge Cases", () => {
  test("should handle quantity of 1 (no discount)", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };

    const price = calculateProductPrice(testProduct, selectedVariants, 1);
    expect(price).toBe(testProduct.basePrice);
  });

  test("should handle very large quantities", () => {
    const testProduct = mockProducts[0];
    const selectedVariants = {
      color: "color-black",
      material: "material-mesh",
      size: "size-m",
    };

    const quantity = 100;
    const price = calculateProductPrice(
      testProduct,
      selectedVariants,
      quantity,
    );
    const unitPrice = testProduct.basePrice;
    const subtotal = unitPrice * quantity;
    const discount = Math.round(subtotal * 0.15); // 15% for 10+
    const expected = subtotal - discount;

    expect(price).toBe(expected);
  });

  test("should handle promo code with cart total at exact minimum", () => {
    const result = validatePromoCode("WELCOME10", 5000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500);
  });

  test("should handle promo code with cart total just below minimum", () => {
    const result = validatePromoCode("WELCOME10", 4999);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("Minimum purchase");
  });

  test("should round discount amounts correctly", () => {
    const result = validatePromoCode("WELCOME10", 5555);
    // 10% of 5555 = 555.5, should round to 556
    expect(result.discount).toBe(Math.round(5555 * 0.1));
  });
});

describe("Data Validation", () => {
  test("all products should have valid structure", () => {
    mockProducts.forEach((product) => {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("basePrice");
      expect(product).toHaveProperty("variants");
      expect(product.variants).toHaveProperty("colors");
      expect(product.variants).toHaveProperty("materials");
      expect(product.variants).toHaveProperty("sizes");
      expect(Array.isArray(product.variants.colors)).toBe(true);
      expect(Array.isArray(product.variants.materials)).toBe(true);
      expect(Array.isArray(product.variants.sizes)).toBe(true);
    });
  });

  test("all promo codes should have valid structure", () => {
    mockPromoCodes.forEach((promo) => {
      expect(promo).toHaveProperty("code");
      expect(promo).toHaveProperty("discountType");
      expect(promo).toHaveProperty("discountValue");
      expect(promo).toHaveProperty("validUntil");
      expect(["percentage", "fixed"]).toContain(promo.discountType);
      expect(promo.discountValue).toBeGreaterThan(0);
    });
  });

  test("all variants should have required properties", () => {
    mockProducts.forEach((product) => {
      [
        ...product.variants.colors,
        ...product.variants.materials,
        ...product.variants.sizes,
      ].forEach((variant) => {
        expect(variant).toHaveProperty("id");
        expect(variant).toHaveProperty("name");
        expect(variant).toHaveProperty("priceModifier");
        expect(variant).toHaveProperty("stock");
        expect(typeof variant.stock).toBe("number");
        expect(variant.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
