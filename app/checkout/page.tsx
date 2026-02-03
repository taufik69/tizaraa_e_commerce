"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/features/store/hooks/hooks";
import {
  selectCartItems,
  selectCartDerived,
} from "@/features/slices/cartSelectors";
import { getProductById } from "@/data/mockData";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function Checkout() {
  const items = useAppSelector(selectCartItems);
  const {
    cartCount,
    subtotal,
    quantityDiscount,
    appliedPromoCode,
    promoDiscount,
    total,
    totalSavings,
  } = useAppSelector(selectCartDerived);

  // Shipping info state
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
  });

  // Payment info state
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // UI state
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate shipping cost
  const shippingCost =
    total >= 20000 ? 0 : shippingMethod === "express" ? 300 : 100;
  const grandTotal = total + shippingCost;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      // In real app, redirect to cart
      console.log("Cart is empty, redirect to /cart");
    }
  }, [items]);

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    let formattedValue = value;

    // Format card number
    if (field === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    // Format expiry date
    if (field === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }

    // Format CVV
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setPaymentInfo((prev) => ({ ...prev, [field]: formattedValue }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate shipping info
    if (!shippingInfo.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!shippingInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email))
      newErrors.email = "Invalid email format";
    if (!shippingInfo.phone.trim()) newErrors.phone = "Phone is required";
    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    // Validate payment info if card payment
    if (paymentMethod === "card") {
      if (!paymentInfo.cardNumber.replace(/\s/g, "").trim())
        newErrors.cardNumber = "Card number is required";
      else if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16)
        newErrors.cardNumber = "Card number must be 16 digits";

      if (!paymentInfo.cardName.trim())
        newErrors.cardName = "Cardholder name is required";

      if (!paymentInfo.expiryDate.trim())
        newErrors.expiryDate = "Expiry date is required";
      else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate))
        newErrors.expiryDate = "Invalid format (MM/YY)";

      if (!paymentInfo.cvv.trim()) newErrors.cvv = "CVV is required";
      else if (paymentInfo.cvv.length !== 3)
        newErrors.cvv = "CVV must be 3 digits";
    }

    // Validate terms
    if (!agreedToTerms)
      newErrors.terms = "You must agree to terms & conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(".error-field");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Prepare order data
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      items: items.map((item) => {
        const product = getProductById(item.productId);
        return {
          productId: item.productId,
          productName: product?.name,
          variants: item.selectedVariants,
          quantity: item.quantity,
        };
      }),
      shippingInfo,
      paymentMethod,
      pricing: {
        subtotal,
        quantityDiscount,
        promoCode: appliedPromoCode?.code,
        promoDiscount,
        shipping: shippingCost,
        total: grandTotal,
      },
      placedAt: new Date().toISOString(),
    };

    console.log("Order placed:", orderData);

    // Show success (in real app, redirect to confirmation page)
    alert(
      `Order placed successfully!\n\nOrder ID: ${orderData.orderId}\nTotal: ৳${grandTotal.toLocaleString()}\n\nCheck console for full order details.`,
    );

    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            Your cart is empty
          </h2>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <a
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Cart
          </a>
          <h1 className="text-5xl font-bold text-black mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">
            Complete your order - {cartCount} items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Shipping Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      handleShippingChange("fullName", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white ${errors.fullName ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleShippingChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-white ${errors.email ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleShippingChange("phone", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-white ${errors.phone ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                      placeholder="+880 1234-567890"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      handleShippingChange("address", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white ${errors.address ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                    placeholder="123 Main Street, Apartment 4B"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleShippingChange("city", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-white ${errors.city ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                      placeholder="Dhaka"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      State/Division
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        handleShippingChange("state", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border-b border-gray-300 focus:border-b-2 focus:border-black focus:outline-none transition-colors"
                      placeholder="Dhaka Division"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) =>
                        handleShippingChange("zipCode", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-white ${errors.zipCode ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                      placeholder="1000"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Country *
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) =>
                      handleShippingChange("country", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-b border-gray-300 focus:border-b-2 focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Nepal">Nepal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white p-8 mt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Shipping Method
                </h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-semibold text-black">
                        Standard Shipping
                      </p>
                      <p className="text-sm text-gray-600">5-7 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-black">
                    {total >= 20000 ? "FREE" : "৳100"}
                  </span>
                </label>

                <label className="flex items-center justify-between p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-semibold text-black">
                        Express Shipping
                      </p>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-black">৳300</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 mt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h2 className="text-2xl font-bold text-black">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-6">
                {/* Payment Type Selection */}
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-semibold text-black">
                        Credit / Debit Card
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-semibold text-black">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile"
                      checked={paymentMethod === "mobile"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-semibold text-black">
                        Mobile Banking (bKash, Nagad)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Card Details Form */}
                {paymentMethod === "card" && (
                  <div className="mt-8 p-6 bg-gray-50 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) =>
                          handlePaymentChange("cardNumber", e.target.value)
                        }
                        className={`w-full px-4 py-3 bg-white ${errors.cardNumber ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardName}
                        onChange={(e) =>
                          handlePaymentChange("cardName", e.target.value)
                        }
                        className={`w-full px-4 py-3 bg-white ${errors.cardName ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                        placeholder="JOHN DOE"
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cardName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) =>
                            handlePaymentChange("expiryDate", e.target.value)
                          }
                          className={`w-full px-4 py-3 bg-white ${errors.expiryDate ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) =>
                            handlePaymentChange("cvv", e.target.value)
                          }
                          className={`w-full px-4 py-3 bg-white ${errors.cvv ? "border-b-2 border-red-500 error-field" : "border-b border-gray-300"} focus:border-b-2 focus:border-black focus:outline-none transition-colors`}
                          placeholder="123"
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "mobile" && (
                  <div className="mt-8 p-6 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      You will receive payment instructions via SMS after
                      placing your order.
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="mt-8 p-6 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Pay with cash when your order is delivered. Please keep
                      exact amount ready.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white p-6 mt-12">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={`mt-1 w-5 h-5 ${errors.terms ? "border-red-500" : ""}`}
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-black underline hover:no-underline"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-black underline hover:no-underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-2">{errors.terms}</p>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 sticky top-4 space-y-6">
              <h2 className="text-2xl font-bold text-black">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={item.key}
                      className="flex gap-3 pb-4 border-b border-gray-200"
                    >
                      <div className="w-16 h-16 bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-black truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>

                {quantityDiscount > 0 && (
                  <div className="flex justify-between text-black font-medium">
                    <span>Quantity Discount</span>
                    <span>-৳{quantityDiscount.toLocaleString()}</span>
                  </div>
                )}

                {appliedPromoCode && (
                  <div className="flex justify-between text-black font-medium">
                    <span>Promo: {appliedPromoCode.code}</span>
                    <span>-৳{promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingMethod})</span>
                  <span
                    className={
                      shippingCost === 0 ? "text-black font-medium" : ""
                    }
                  >
                    {shippingCost === 0 ? "FREE" : `৳${shippingCost}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-black">
                {totalSavings > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    Total Savings: ৳{totalSavings.toLocaleString()}
                  </p>
                )}
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-lg font-bold text-black">
                    Grand Total
                  </span>
                  <span className="text-3xl font-bold text-black">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Place Order`
                  )}
                </button>

                {/* Security Badge */}
                <div className="text-center pt-6 border-t border-gray-200 mt-6">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
