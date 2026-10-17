// src/components/CashfreeButton.tsx
import React, { useState } from "react";
// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js";
import axios from "axios";

const CashfreeButton: React = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Call your NestJS backend to create order
      const apiBase = process.env.REACT_APP_API_BASE_URL || "https://api.bhaktibhav.app/api/v1/frontend/";
      const { data } = await axios.post(`${apiBase.replace(/\/$/, "")}/cashfree/create-order`, {
        order_id: "ORD123", // you can generate dynamically
        order_amount: 500,
        customer_details: {
          customer_id: "CUST1",
          customer_name: "Akash",
          customer_email: "test@example.com",
          customer_phone: "1234567890",
        },
        order_note: "Test Order",
        return_url: `${window.location.origin}/payment-status?order_id=ORD123`,
      });

      const sessionId = data.data.payment_session_id;

      // 2️⃣ Load SDK
      const cashfree = await load({ mode: process.env.REACT_APP_CASHFREE_MODE || "production" });

      // 3️⃣ Open checkout
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self", // redirect to return_url after payment
      });

    } catch (error) {
      console.error("Cashfree error:", error);
      alert("Something went wrong with payment!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? "Processing..." : "Pay with Cashfree"}
    </button>
  );
};

export default CashfreeButton;
