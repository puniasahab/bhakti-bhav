import { useEffect, useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { useNavigate } from "react-router-dom";

// Dynamic import for Cashfree SDK to handle loading errors
let cashfreeLoad = null;

const loadCashfreeSDK = async () => {
  try {
    if (!cashfreeLoad) {
      const cashfreeModule = await import("cashfree-dropjs");
      cashfreeLoad = cashfreeModule.load;
    }
    return cashfreeLoad;
  } catch (error) {
    console.error("Failed to load Cashfree SDK:", error);
    throw new Error("Cashfree SDK not available");
  }
};

export default function PaymentPage() {
  const { paymentResponse, selectedPlanData, userProfile } = usePayment();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if payment data is available
    if (!paymentResponse || !paymentResponse.success) {
      console.error("No payment data available, redirecting to payment page");
      setError("No payment data found");
      // navigate("/payment");
      return;
    }

    async function initCashfree() {
      console.log("Payment Response:", paymentResponse);
      
      try {
        // setLoading(true);
        // setError(null);

        // Load Cashfree SDK dynamically
        console.log("Loading Cashfree SDK...");
        const load = await loadCashfreeSDK();
        // debugger;
        if (typeof load !== 'function') {
          throw new Error("Cashfree SDK load function not available");
        }

        console.log("Initializing Cashfree...");
        
        const cashfree = await load({
          mode: "sandbox" // or "production"
        });

        console.log("Cashfree SDK loaded successfully:", cashfree);

        // Use the payment session ID from the API response
        const paymentSessionId = paymentResponse.data?.cashfree?.payment_session_id || 
                                paymentResponse.payment_session_id ||
                                paymentResponse.sessionId ||
                                paymentResponse.data?.sessionId;

        console.log("Looking for session ID in:", paymentResponse);
        console.log("Found session ID:", paymentSessionId);

        if (!paymentSessionId) {
          throw new Error("No payment session ID found in response");
        }

        console.log("Initializing Cashfree with session ID:", paymentSessionId);
        console.log("Selected Plan:", selectedPlanData);
        console.log("User Profile:", userProfile);

        // Initialize Cashfree checkout
        const checkoutResult = cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self", // or "_blank" for new tab
        });

        console.log("Cashfree checkout initialized:", checkoutResult);

      } catch (error) {
        // console.error("Detailed error in Cashfree initialization:", error);
        // console.error("Error name:", error.name);
        // console.error("Error message:", error.message);
        // console.error("Error stack:", error.stack);
        
        // setError(error.message || "Payment initialization failed");
        
        // // More specific error handling
        // if (error.message && error.message.includes('load')) {
        //   setError("Failed to load payment system. Please check your internet connection and try again.");
        // } else if (error.message && error.message.includes('session')) {
        //   setError("Invalid payment session. Please try again.");
        // } else if (error.message && error.message.includes('SDK')) {
        //   setError("Payment system not available. Please try again later.");
        // }
        
      } finally {
        setLoading(false);
      }
    };

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
        <h1 className="text-2xl font-bold text-[#9A283D] mb-4 font-eng">Processing Payment...</h1>
        <p className="text-gray-600 mb-2 font-eng">Plan: {selectedPlanData?.name}</p>
        <p className="text-gray-600 mb-2 font-eng">Amount: ₹{selectedPlanData?.price}</p>
        <p className="text-gray-600 font-eng">Redirecting to Cashfree...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A283D] mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
