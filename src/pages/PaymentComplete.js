import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import logo from "../assets/img/logo.png";

export default function PaymentComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Read status — from location.state (PaymentPage redirect) OR query params (Cashfree redirect)
  const stateData = location.state || {};
  const orderStatus = stateData.paymentSuccess ? "PAID" : (searchParams.get("order_status") || "PAID");
  const orderId = stateData.orderId || searchParams.get("order_id") || "";

  const isSuccess = orderStatus === "PAID" || orderStatus === "SUCCESS";

  // Animation steps: ring → checkmark / cross → content
  const [ringVisible, setRingVisible] = useState(false);
  const [iconVisible, setIconVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Countdown state for auto-redirect (only on success)
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t1 = setTimeout(() => setRingVisible(true), 100);
    const t2 = setTimeout(() => setIconVisible(true), 600);
    const t3 = setTimeout(() => setContentVisible(true), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Auto-redirect to home after 3 seconds on success
  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSuccess, navigate]);

  return (
    <div
      className="bg-cover bg-top bg-no-repeat min-h-screen w-full"
      style={{ backgroundImage: "url('/img/home_bg.png')" }}
    >
      {/* Simple header — no back button, just logo + title */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 bg-white shadow-sm" style={{ height: "80px" }}>
        <div className="container mx-auto hd_bg rounded-xl h-full">
          <div className="flex items-center justify-center h-full px-4">
            <img src={logo} alt="Logo" width="108" height="27" className="mr-3" />
            <span className="font-eng text-base font-semibold text-[#9A283D] border-l border-[#9A283D]/30 pl-3">
              Payment Status
            </span>
          </div>
        </div>
      </header>
      {/* Spacer matching header height */}
      <div className="h-20 w-full" />

      {/* Page body — semi-transparent card over faded bg */}
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-5 py-10">

        {/* Card container */}
        <div className="w-full max-w-sm bg-[rgba(255,250,244,0.88)] backdrop-blur-sm rounded-3xl shadow-xl px-6 py-8 flex flex-col items-center">

        {/* Animated icon ring */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer pulsing ring */}
          <span
            className={`absolute rounded-full transition-all duration-700 ease-out ${
              isSuccess ? "bg-[#9A283D]/10" : "bg-gray-300/40"
            } ${ringVisible ? "w-40 h-40 opacity-100" : "w-10 h-10 opacity-0"}`}
          />
          {/* Middle ring */}
          <span
            className={`absolute rounded-full transition-all duration-700 ease-out delay-100 ${
              isSuccess ? "bg-[#9A283D]/20" : "bg-gray-300/60"
            } ${ringVisible ? "w-28 h-28 opacity-100" : "w-6 h-6 opacity-0"}`}
          />
          {/* Inner circle with icon */}
          <div
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ease-out ${
              isSuccess ? "bg-[#9A283D]" : "bg-gray-400"
            } ${iconVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
          >
            {isSuccess ? (
              /* Animated checkmark SVG */
              <svg
                viewBox="0 0 52 52"
                className="w-10 h-10"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline
                  points="14,27 22,35 38,18"
                  className="checkmark-path"
                  style={{
                    strokeDasharray: 40,
                    strokeDashoffset: iconVisible ? 0 : 40,
                    transition: "stroke-dashoffset 0.5s ease 0.2s",
                  }}
                />
              </svg>
            ) : (
              /* X mark for failure */
              <svg
                viewBox="0 0 52 52"
                className="w-10 h-10"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <line
                  x1="16" y1="16" x2="36" y2="36"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: iconVisible ? 0 : 30,
                    transition: "stroke-dashoffset 0.4s ease 0.1s",
                  }}
                />
                <line
                  x1="36" y1="16" x2="16" y2="36"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: iconVisible ? 0 : 30,
                    transition: "stroke-dashoffset 0.4s ease 0.25s",
                  }}
                />
              </svg>
            )}
          </div>
        </div>

        {/* Text content */}
        <div
          className={`text-center transition-all duration-700 ease-out ${
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {isSuccess ? (
            <>
              <p className="font-eng text-[#9A283D] text-base font-medium text-2xl mb-4">
                Payment Successful
              </p>
              <p className="font-hindi text-gray-600 text-lg mb-1">
                आपका सब्सक्रिप्शन एक्टिव हो गया है।
              </p>
              <p className="font-eng text-gray-500 text-sm mb-6">
                Your subscription is now active. Enjoy unlimited devotional content!
              </p>
            </>
          ) : (
            <>
              <p className="font-eng text-gray-600 text-base font-medium mb-4">
                Payment Failed
              </p>
              <p className="font-hindi text-gray-500 text-lg mb-1">
                कोई राशि नहीं काटी गई है।
              </p>
              <p className="font-eng text-gray-400 text-sm mb-6">
                No amount has been deducted. Please try again.
              </p>
            </>
          )}

          {/* Order ID badge */}
          {orderId && (
            <div className="inline-block bg-white border border-[#9A283D]/20 rounded-xl px-4 py-2 mb-7 shadow-sm">
              <p className="font-eng text-xs text-gray-400 mb-0.5">Order ID</p>
              <p className="font-eng text-sm text-[#9A283D] font-semibold tracking-wide">
                {orderId}
              </p>
            </div>
          )}

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="h-px w-16 bg-[#9A283D]/20" />
            <img src="/img/logo.png" alt="logo" className="w-20 h-8 opacity-60" />
            <span className="h-px w-16 bg-[#9A283D]/20" />
          </div>

          {/* Countdown + progress bar (success only) */}
          {isSuccess && (
            <div className="w-full mb-5">
              <p className="text-center font-eng text-sm text-gray-400 mb-2">
                Redirecting to home in{" "}
                <span className="font-semibold text-[#9A283D]">{countdown}s</span>…
              </p>
              {/* Progress bar — shrinks over 3s */}
              <div className="w-full h-1.5 bg-[#9A283D]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9A283D] rounded-full"
                  style={{
                    width: `${(countdown / 3) * 100}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full">
            {isSuccess ? (
              <button
                onClick={() => navigate("/", { replace: true })}
                className="w-full bg-[#9A283D] text-white font-eng font-semibold py-3 rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
              >
                🙏 Start Exploring
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/payment")}
                  className="w-full bg-[#9A283D] text-white font-eng font-semibold py-3 rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/", { replace: true })}
                  className="w-full bg-white border border-[#9A283D]/30 text-[#9A283D] font-eng font-semibold py-3 rounded-2xl shadow-sm hover:scale-105 transition-all duration-300"
                >
                  Go to Home
                </button>
              </>
            )}
          </div>
        </div>

        </div>{/* end card */}
      </div>
    </div>
  );
}
