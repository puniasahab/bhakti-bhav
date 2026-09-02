
import React, { useEffect, useRef, useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { useNavigate } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";  // ✅ Proper import
import { paymentApis } from "../api";
import Header from "../components/Header";
import PageTitleCard from "../components/PageTitleCard";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import { getMobileNoFromLS } from "../commonFunctions";

export default function PaymentDrop() {
  const { paymentResponse, selectedPlanData, userProfile } = usePayment();
  const navigate = useNavigate();
  const cashfreeRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);


  const baseParams = useGA4BaseParams("Payment Drop Screen");
  const { trackEvent } = useGA4Tracker(baseParams);


  const parseStoredJson = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (err) {
      console.error(`Unable to parse ${key} from localStorage`, err);
      return null;
    }
  };

  const storedPaymentResponse = paymentResponse || parseStoredJson("cashfreeSubscriptionResponse");
  const storedPlanData = selectedPlanData || parseStoredJson("cashfreeSelectedPlanData");
  const storedUserProfile = userProfile || parseStoredJson("cashfreeBillingProfile");
  const cashfreeData = storedPaymentResponse?.data?.cashfree || {};
  const subscriptionSessionId = storedPaymentResponse?.data?.subscriptionSessionId || cashfreeData?.subscription_session_id;
  const paymentSessionId = cashfreeData?.payment_session_id;
  const currentOrderId = cashfreeData?.order_id || storedPaymentResponse?.data?.subscriptionId;
  const currentAmount = storedPaymentResponse?.data?.amount || cashfreeData?.order_amount || storedPlanData?.price;
  const currentStatus = storedPaymentResponse?.data?.status || cashfreeData?.subscription_status;
  const currentSubscriptionId = storedPaymentResponse?.data?.subscriptionId || currentOrderId;

  useEffect(() => {
    let isMounted = true;
    const initializeSDK = async () => {
      cashfreeRef.current = await load({
        mode: 'production', // Use 'sandbox' for testing and 'production' for live transactions
      });
    };

    initializeSDK().catch((sdkError) => {
      console.error("Cashfree SDK initialization error:", sdkError);
      if (isMounted) {
        setError("Unable to initialize payment. Please try again.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getSessionId = async () => {
    if (storedPaymentResponse?.data) {
      return subscriptionSessionId || paymentSessionId;
    }
  }

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_INITIATED, { message: "User initiated payment", mobileNumber: getMobileNoFromLS() });
      trackEvent(GA4Events.subscription_start_cta_clicked, { event_label: "subscription_start_cta_clicked_from_payment_drop_screen" });
      
      const sessionId = await getSessionId();
      console.log("SessionId", sessionId);
      if (!sessionId || !cashfreeRef.current) {
        setError("Payment session is not available. Please try again.");
        setLoading(false);
        return;
      }
      
      const checkoutOptions = subscriptionSessionId
        ? {
          subsSessionId: subscriptionSessionId,
          redirectTarget: "_modal",
        }
        : {
          paymentSessionId,
          redirectTarget: "_modal", // this is open popup on out website
        };

      const checkout = subscriptionSessionId
        ? cashfreeRef.current.subscriptionsCheckout(checkoutOptions)
        : cashfreeRef.current.checkout(checkoutOptions);

      checkout.then((res) => {
        console.log("Cashfree checkout result:", res);
        if (res?.error) {
          trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: res.error?.message || "Cashfree subscription authorization cancelled", orderId: currentOrderId, mobileNumber: getMobileNoFromLS() });
          localStorage.setItem("cashfreeSubscriptionStatus", "AUTHORIZATION_CANCELLED");
          setError(res.error?.message || "Mandate authorization was not completed. Please try again.");
          setLoading(false);
          setPaymentProcessing(false);
          return;
        }

        setPaymentProcessing(true);

        if (subscriptionSessionId) {
          const subscriptionId = currentSubscriptionId || localStorage.getItem("cashfreeSubscriptionId");
          localStorage.setItem("cashfreeSubscriptionStatus", "PENDING");
          navigate(`/PaymentPay?subscription_id=${encodeURIComponent(subscriptionId || "")}`, { replace: true });
          return;
        }
        
        const verifyPayment = async () => {
          try {
            const resp = await paymentApis.verifyPayments({
              order_id: currentOrderId,
              source: "web",
            });
            console.log("Payment verification response:", resp);
            
            if (resp && resp.success) {
              // Payment verification successful
              console.log("Payment verified successfully");
              
              // Navigate to payment complete page
              navigate('/payment-complete', { 
                state: { 
                  paymentSuccess: true, 
                  orderId: currentOrderId,
                } 
              });
            } else {
              // Payment verification failed
              trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: "Payment verification failed", orderId: currentOrderId, mobileNumber: getMobileNoFromLS() });
              setError("Payment verification failed. Please contact support.");
              setPaymentProcessing(false);
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: verifyError?.message || "Payment verification API error", orderId: currentOrderId, mobileNumber: getMobileNoFromLS() });
            setError("Unable to verify payment. Please contact support if amount was deducted.");
            setPaymentProcessing(false);
          }
        };
        
        verifyPayment();
      }).catch((checkoutError) => {
        console.error("Checkout error:", checkoutError);
        localStorage.setItem("cashfreeSubscriptionStatus", "AUTHORIZATION_CANCELLED");
        trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: checkoutError?.message || "Cashfree checkout failed or dismissed", orderId: currentOrderId, mobileNumber: getMobileNoFromLS() });
        setError("Payment process failed. Please try again.");
        setLoading(false);
        setPaymentProcessing(false);
      });
    }
    catch (error) {
      console.error("Payment initiation error:", error);
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: error?.message || "Failed to initiate payment", mobileNumber: getMobileNoFromLS() });
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
                {storedPlanData?.name || storedPaymentResponse?.data?.cashfree?.plan_details?.plan_name || "Premium Plan"}
              </h3>
              <div className="text-3xl font-bold text-gray-800 mb-1 font-eng">
                ₹{currentAmount}
              </div>
              <p className="text-gray-500 text-sm font-eng">
                {storedPlanData?.duration || `${storedPaymentResponse?.data?.intervals || ""} ${storedPaymentResponse?.data?.intervalType || "Monthly Subscription"}`.trim()}
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
                <span className="font-medium">Name:</span> {storedUserProfile?.name || cashfreeData?.customer_details?.customer_name || "User"}
              </p>
              <p className="text-gray-600 font-eng">
                <span className="font-medium">Email:</span> {storedUserProfile?.email || cashfreeData?.customer_details?.customer_email}
              </p>
              <p className="text-gray-600 font-eng">
                <span className="font-medium">Phone:</span> {storedUserProfile?.phone || storedUserProfile?.mobileNumber || cashfreeData?.customer_details?.customer_phone}
              </p>
            </div>

            {/* Order Information */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-700 mb-2 font-eng">Order Details:</h4>
              <p className="text-gray-600 text-sm font-eng">
                <span className="font-medium">{subscriptionSessionId ? "Subscription ID" : "Order ID"}:</span> {currentOrderId}
              </p>
              <p className="text-gray-600 text-sm font-eng">
                <span className="font-medium">Amount:</span> ₹{currentAmount}
              </p>
              {currentStatus && (
                <p className="text-gray-600 text-sm font-eng">
                  <span className="font-medium">Status:</span> {currentStatus}
                </p>
              )}
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
                  Redirecting to payment verification...
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
