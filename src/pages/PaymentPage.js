import { useEffect } from "react";
import { load } from "cashfree-dropjs"; // Cashfree SDK
import { usePayment } from "../contexts/PaymentContext";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { paymentResponse, selectedPlanData, userProfile } = usePayment();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if payment data is available
    if (!paymentResponse || !paymentResponse.success) {
      console.error("No payment data available, redirecting to payment page");
      // navigate("/payment");
      return;
    }

    async function initCashfree() {
      console.log("opop", paymentResponse);
      debugger;
      try {
        const cashfree = await load({
          mode: "sandbox" // or "production"
        });
        // Use the payment session ID from the API response
        const paymentSessionId = paymentResponse.data?.payment_session_id || 
                                paymentResponse.payment_session_id ||
                                paymentResponse.sessionId;

        if (!paymentSessionId) {
          console.error("No payment session ID found in response:", paymentResponse);
          alert("Payment session not found. Please try again.");
          navigate("/payment");
          return;
        }

        console.log("Initializing Cashfree with session ID:", paymentSessionId);
        console.log("Selected Plan:", selectedPlanData);
        console.log("User Profile:", userProfile);

        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self", // or "_blank" for new tab
        });
      } catch (error) {
        console.error("Error initializing Cashfree:", error);
        alert("Payment initialization failed. Please try again.");
        navigate("/payment");
      }
    }

    initCashfree();
  }, [paymentResponse, selectedPlanData, userProfile, navigate]);

  if (!paymentResponse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl text-red-500">No payment data found</h1>
          <p className="mt-2">Redirecting to payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#9A283D] mb-4">Processing Payment...</h1>
        <p className="text-gray-600 mb-2">Plan: {selectedPlanData?.name}</p>
        <p className="text-gray-600 mb-2">Amount: ₹{selectedPlanData?.price}</p>
        <p className="text-gray-600">Redirecting to Cashfree...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A283D] mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
