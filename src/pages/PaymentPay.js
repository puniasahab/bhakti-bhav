import React, { useState } from "react";

function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Call your NestJS backend to create order
      const response = await fetch("http://localhost:3007/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORD123",
          amount: 500,
          customer: {
            id: "CUST12",
            email: "test@example.com",
            phone: "1234567890",
            name: "Akash",
          },
        }),
      });

      const result = await response.json();
      console.log("Order Response:", result);

      if (result.success) {
        const sessionId = result.data.payment_session_id;

        // Load Cashfree SDK
        const cashfree = new window.Cashfree({
          mode: "sandbox", // change to "production" when live
        });

        // Open checkout page
        cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: "_self", // or "_blank" for new tab
        });
      } else {
        alert("Order creation failed: " + result.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong, check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Cashfree Payment Demo</h2>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}

export default CheckoutPage;
