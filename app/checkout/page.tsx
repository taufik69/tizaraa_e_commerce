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

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost =
    total >= 20000 ? 0 : shippingMethod === "express" ? 300 : 100;
  const grandTotal = total + shippingCost;

  useEffect(() => {
    if (items.length === 0) console.log("Cart is empty, redirect to /cart");
  }, [items]);

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    if (field === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }

    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setPaymentInfo((prev) => ({ ...prev, [field]: formattedValue }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    if (!agreedToTerms)
      newErrors.terms = "You must agree to terms & conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      const firstError = document.querySelector(".error-field");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
    alert(
      `Order placed successfully!\n\nOrder ID: ${orderData.orderId}\nTotal: ৳${grandTotal.toLocaleString()}\n\nCheck console for full order details.`,
    );

    setIsProcessing(false);
  };

  const inputBase =
    "w-full bg-white border-b focus:outline-none transition-colors";
  const inputPad = "px-3 py-3 sm:px-4"; // mobile a bit tighter
  const inputFocus = "focus:border-b-2 focus:border-black";
  const inputBorderOk = "border-gray-300";
  const inputBorderErr = "border-red-500 border-b-2 error-field";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <a
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-black mb-4 sm:mb-6 transition-colors"
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

          <h1 className="text-3xl sm:text-5xl font-bold text-black mb-2">
            Checkout
          </h1>

          <p className="text-gray-600 text-sm sm:text-lg">
            Complete your order - {cartCount} items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white p-4 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white flex items-center justify-center font-bold text-base sm:text-lg">
                  1
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  Shipping Information
                </h2>
              </div>

              <div className="space-y-5 sm:space-y-6">
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
                    className={[
                      inputBase,
                      inputPad,
                      errors.fullName ? inputBorderErr : inputBorderOk,
                      inputFocus,
                    ].join(" ")}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
                      className={[
                        inputBase,
                        inputPad,
                        errors.email ? inputBorderErr : inputBorderOk,
                        inputFocus,
                      ].join(" ")}
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
                      className={[
                        inputBase,
                        inputPad,
                        errors.phone ? inputBorderErr : inputBorderOk,
                        inputFocus,
                      ].join(" ")}
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
                    className={[
                      inputBase,
                      inputPad,
                      errors.address ? inputBorderErr : inputBorderOk,
                      inputFocus,
                    ].join(" ")}
                    placeholder="123 Main Street, Apartment 4B"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
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
                      className={[
                        inputBase,
                        inputPad,
                        errors.city ? inputBorderErr : inputBorderOk,
                        inputFocus,
                      ].join(" ")}
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
                      className={[
                        inputBase,
                        inputPad,
                        inputBorderOk,
                        inputFocus,
                      ].join(" ")}
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
                      className={[
                        inputBase,
                        inputPad,
                        errors.zipCode ? inputBorderErr : inputBorderOk,
                        inputFocus,
                      ].join(" ")}
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
                    className={[
                      inputBase,
                      inputPad,
                      inputBorderOk,
                      inputFocus,
                    ].join(" ")}
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
            <div className="bg-white p-4 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white flex items-center justify-center font-bold text-base sm:text-lg">
                  2
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  Shipping Method
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                  <div className="flex items-start sm:items-center gap-4">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 sm:mt-0 w-5 h-5"
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

                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                  <div className="flex items-start sm:items-center gap-4">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mt-1 sm:mt-0 w-5 h-5"
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
            <div className="bg-white p-4 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white flex items-center justify-center font-bold text-base sm:text-lg">
                  3
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {/* Payment Type Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-start sm:items-center gap-4 p-4 sm:p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 sm:mt-0 w-5 h-5"
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

                  <label className="flex items-start sm:items-center gap-4 p-4 sm:p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 sm:mt-0 w-5 h-5"
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

                  <label className="flex items-start sm:items-center gap-4 p-4 sm:p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile"
                      checked={paymentMethod === "mobile"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 sm:mt-0 w-5 h-5"
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
                  <div className="mt-2 sm:mt-4 p-4 sm:p-6 bg-gray-50 space-y-5 sm:space-y-6 border border-gray-100">
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
                        className={[
                          inputBase,
                          inputPad,
                          errors.cardNumber ? inputBorderErr : inputBorderOk,
                          inputFocus,
                        ].join(" ")}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        autoComplete="cc-number"
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
                        className={[
                          inputBase,
                          inputPad,
                          errors.cardName ? inputBorderErr : inputBorderOk,
                          inputFocus,
                        ].join(" ")}
                        placeholder="JOHN DOE"
                        autoComplete="cc-name"
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cardName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
                          className={[
                            inputBase,
                            inputPad,
                            errors.expiryDate ? inputBorderErr : inputBorderOk,
                            inputFocus,
                          ].join(" ")}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
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
                          type="password"
                          value={paymentInfo.cvv}
                          onChange={(e) =>
                            handlePaymentChange("cvv", e.target.value)
                          }
                          className={[
                            inputBase,
                            inputPad,
                            errors.cvv ? inputBorderErr : inputBorderOk,
                            inputFocus,
                          ].join(" ")}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
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
                  <div className="mt-2 sm:mt-4 p-4 sm:p-6 bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-600">
                      You will receive payment instructions via SMS after
                      placing your order.
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="mt-2 sm:mt-4 p-4 sm:p-6 bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-600">
                      Pay with cash when your order is delivered. Please keep
                      exact amount ready.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white p-4 sm:p-6 border border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={`mt-1 w-5 h-5 ${errors.terms ? "ring-2 ring-red-500" : ""}`}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
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
            <div className="bg-white p-4 sm:p-8 border border-gray-100 lg:sticky lg:top-4 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                Order Summary
              </h2>

              {/* Cart Items Preview */}
              <div className="space-y-4 max-h-48 sm:max-h-56 lg:max-h-60 overflow-y-auto pr-1">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={item.key}
                      className="flex gap-3 pb-4 border-b border-gray-200"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 overflow-hidden shrink-0">
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
                <div className="flex justify-between gap-3 text-gray-600">
                  <span className="truncate">Subtotal ({cartCount} items)</span>
                  <span className="shrink-0">৳{subtotal.toLocaleString()}</span>
                </div>

                {quantityDiscount > 0 && (
                  <div className="flex justify-between gap-3 text-black font-medium">
                    <span>Quantity Discount</span>
                    <span className="shrink-0">
                      -৳{quantityDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                {appliedPromoCode && (
                  <div className="flex justify-between gap-3 text-black font-medium">
                    <span className="truncate">
                      Promo: {appliedPromoCode.code}
                    </span>
                    <span className="shrink-0">
                      -৳{promoDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3 text-gray-600">
                  <span className="truncate">Shipping ({shippingMethod})</span>
                  <span
                    className={
                      shippingCost === 0
                        ? "text-black font-medium shrink-0"
                        : "shrink-0"
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

                <div className="flex justify-between items-baseline gap-3 mb-5 sm:mb-6">
                  <span className="text-base sm:text-lg font-bold text-black">
                    Grand Total
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-black shrink-0">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-3.5 sm:py-4 bg-black hover:bg-gray-800 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {/* Security Badge */}
                <div className="text-center pt-5 sm:pt-6 border-t border-gray-200 mt-5 sm:mt-6">
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

            {/* (Optional) Mobile friendly spacer */}
            <div className="h-4 lg:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
