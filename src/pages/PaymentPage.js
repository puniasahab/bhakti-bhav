
import React, { useEffect, useRef, useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { useNavigate } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";  // ✅ Proper import
import { paymentApis } from "../api";
import Header from "../components/Header";
import PageTitleCard from "../components/PageTitleCard";

export default function PaymentDrop() {
  const { paymentResponse, selectedPlanData, userProfile } = usePayment();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  console.log("Payment", paymentResponse.data.cashfree.payment_session_id);
  let cashfree;
  let initializeSDK = async () => {
    cashfree = await load({
      mode: 'sandbox',
    })
  }
  initializeSDK();

  const getSessionId = async () => {
    if (paymentResponse.data) {
      setOrderId(paymentResponse.data.cashfree.order_id);
      return paymentResponse.data.cashfree.payment_session_id;
    }
  }



  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionId = getSessionId();
      console.log("SessionId", sessionId);
      
      let checkoutOptions = {
        paymentSessionId: paymentResponse.data.cashfree.payment_session_id,
        redirectTarget: "_modal", // this is open popup on out website
      }

      cashfree.checkout(checkoutOptions).then((res) => {
        console.log("Cashfree checkout result:", res);
        setPaymentProcessing(true);
        
        const verifyPayment = async () => {
          try {
            const resp = await paymentApis.verifyPayments({
              order_id: paymentResponse.data.cashfree.order_id
            });
            console.log("Payment verification response:", resp);
            
            if (resp && resp.success) {
              // Payment verification successful
              console.log("Payment verified successfully");
              
              // Show success message briefly
              setTimeout(() => {
                // Redirect to transactions page
                navigate('/transactions', { 
                  state: { 
                    paymentSuccess: true, 
                    orderId: paymentResponse.data.cashfree.order_id,
                    message: 'Payment completed successfully!' 
                  } 
                });
              }, 1500);
            } else {
              // Payment verification failed
              setError("Payment verification failed. Please contact support.");
              setPaymentProcessing(false);
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            setError("Unable to verify payment. Please contact support if amount was deducted.");
            setPaymentProcessing(false);
          }
        };
        
        verifyPayment();
      }).catch((checkoutError) => {
        console.error("Checkout error:", checkoutError);
        setError("Payment process failed. Please try again.");
        setLoading(false);
        setPaymentProcessing(false);
      });
    }
    catch (error) {
      console.error("Payment initiation error:", error);
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
      setPaymentProcessing(false);
    }
  }

  // useEffect(() => {
  //   let cashfree;
  //   let initializeSDK = async () => {
  //     cashfree = await load({
  //       mode: 'sandbox',
  //     })
  //   }
  //   initializeSDK();
  //   console.log("paymentResponse", paymentResponse?.data?.cashfree?.payment_session_id);


  // }, [])
  return (
    <>
      <Header pageName={{ hi: "पेमेंट", en: "Payment" }} />
      <PageTitleCard
        titleHi={"पेमेंट"}
        titleEn={"Payment"} 
        customEngFontSize={"14px"}
        customFontSize={"21px"}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Plan Information Header */}
          <div className="bg-[#9A283D] text-white p-4">
            <h2 className="text-xl font-bold text-center font-eng">Selected Plan</h2>
          </div>
          
          {/* Plan Details */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#9A283D] mb-2 font-eng">
                {selectedPlanData?.name || "Premium Plan"}
              </h3>
              <div className="text-3xl font-bold text-gray-800 mb-1 font-eng">
                ₹{selectedPlanData?.price || paymentResponse?.data?.cashfree?.order_amount}
              </div>
              <p className="text-gray-500 text-sm font-eng">
                {selectedPlanData?.duration || "Monthly Subscription"}
              </p>
            </div>

            {/* Plan Features */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 font-eng">Plan Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600 font-eng">
                  <span className="text-green-500 mr-2">✓</span>
                  Premium Content Access
                </li>
                <li className="flex items-center text-gray-600 font-eng">
                  <span className="text-green-500 mr-2">✓</span>
                  Ad-free Experience
                </li>
                <li className="flex items-center text-gray-600 font-eng">
                  <span className="text-green-500 mr-2">✓</span>
                  Offline Downloads
                </li>
                <li className="flex items-center text-gray-600 font-eng">
                  <span className="text-green-500 mr-2">✓</span>
                  24/7 Support
                </li>
              </ul>
            </div>

            {/* User Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 font-eng">Billing Information:</h4>
              <p className="text-gray-600 font-eng">
                <span className="font-medium">Name:</span> {userProfile?.name || "User"}
              </p>
              <p className="text-gray-600 font-eng">
                <span className="font-medium">Email:</span> {userProfile?.email || paymentResponse?.data?.cashfree?.customer_details?.customer_email}
              </p>
              <p className="text-gray-600 font-eng">
                <span className="font-medium">Phone:</span> {userProfile?.phone || paymentResponse?.data?.cashfree?.customer_details?.customer_phone}
              </p>
            </div>

            {/* Order Information */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-700 mb-2 font-eng">Order Details:</h4>
              <p className="text-gray-600 text-sm font-eng">
                <span className="font-medium">Order ID:</span> {paymentResponse?.data?.cashfree?.order_id}
              </p>
              <p className="text-gray-600 text-sm font-eng">
                <span className="font-medium">Amount:</span> ₹{paymentResponse?.data?.cashfree?.order_amount}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-eng">{error}</p>
              </div>
            )}

            {/* Confirm Payment Button */}
            <button 
              onClick={handleClick} 
              disabled={loading || paymentProcessing}
              className={`w-full py-3 px-6 rounded-full font-bold text-white transition-all duration-200 font-eng ${
                loading || paymentProcessing
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#9A283D] hover:bg-[#7A1F2D] active:bg-[#5A1721] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Initializing Payment...
                </div>
              ) : paymentProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying Payment...
                </div>
              ) : (
                "Confirm Payment"
              )}
            </button>

            {/* Payment Success Message */}
            {paymentProcessing && !error && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm font-eng text-center">
                  ✅ Payment successful! Redirecting to transactions...
                </p>
              </div>
            )}

            {/* Security Note */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 font-eng">
                🔒 Your payment is secured by Cashfree
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
