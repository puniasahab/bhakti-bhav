import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginApis, paymentApis, profileApis } from "../api";
import { getIsLoggedIn, getMobileNoFromLS, getUserIdFromLS, setIsLoggedIn, setMobileNoInLS, setSubscriptionStatusInLS, setTokenInLS, setUserIdInLS } from "../commonFunctions";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";
import mandalaImg from "../assets/img/mandala.png";

const SUBSCRIPTION_SUCCESS_STATUSES = ["ACTIVE"];
const SUBSCRIPTION_FAILURE_STATUSES = ["FAILED", "CANCELLED", "AUTHORIZATION_CANCELLED", "EXPIRED"];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DESKTOP_VIEWPORT_CONTENT = "width=1180";

const AppEvents1 = () => {
  const [selectedPlan, setSelectedPlan] = useState(2);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showEventLogin, setShowEventLogin] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [proceedToPayment, setProceedToPayment] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { deviceType, redirectToStore, storeUrls } = useAppStoreRedirect();

  useLayoutEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewportContent = viewportMeta?.getAttribute("content") || "";
    const originalBodyMinWidth = document.body.style.minWidth;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    if (viewportMeta) {
      viewportMeta.setAttribute("content", DESKTOP_VIEWPORT_CONTENT);
    }

    document.body.style.minWidth = "1180px";
    document.body.style.overflowX = "auto";
    document.documentElement.style.overflowX = "auto";

    return () => {
      if (viewportMeta) {
        viewportMeta.setAttribute("content", originalViewportContent || "width=device-width, initial-scale=1");
      }

      document.body.style.minWidth = originalBodyMinWidth;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");
    const cfStatus = searchParams.get("cf_status") || searchParams.get("payment_status");

    if (subscriptionId) {
      localStorage.setItem("cashfreeSubscriptionId", subscriptionId);
      setPaymentStatus((cfStatus || localStorage.getItem("cashfreeSubscriptionStatus") || "PENDING").toUpperCase());
      setShowDownloadPopup(true);
      setShowLoginPrompt(false);
      return;
    }

    if (sessionStorage.getItem("appEvents1PaymentCompleted") === "true") {
      sessionStorage.removeItem("appEvents1PaymentCompleted");
      setPaymentStatus((localStorage.getItem("cashfreeSubscriptionStatus") || "PENDING").toUpperCase());
      setShowDownloadPopup(true);
      setShowLoginPrompt(false);
      return;
    }

    // removed auto-login prompt so user can view plans first
  }, [searchParams]);

  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id") || localStorage.getItem("cashfreeSubscriptionId");
    if (!subscriptionId || !showDownloadPopup) return;

    let isMounted = true;
    const fetchSubscriptionStatus = async () => {
      setPaymentStatusLoading(true);
      let lastStatus = (paymentStatus || localStorage.getItem("cashfreeSubscriptionStatus") || "").toUpperCase();

      for (let attempt = 0; attempt < 6; attempt += 1) {
        if (attempt > 0) {
          await delay(2000);
        }

        try {
          const response = await paymentApis.getSubscriptionStatus(subscriptionId);
          const status = (
            response?.data?.status ||
            response?.data?.subscription_status ||
            response?.status ||
            response?.subscription_status ||
            ""
          ).toUpperCase();

          if (status) {
            lastStatus = status;
            localStorage.setItem("cashfreeSubscriptionStatus", status);
            if (isMounted) {
              setPaymentStatus(status);
            }
          }

          if (SUBSCRIPTION_SUCCESS_STATUSES.includes(status)) {
            setSubscriptionStatusInLS("true");
            break;
          }

          if (SUBSCRIPTION_FAILURE_STATUSES.includes(status)) {
            setSubscriptionStatusInLS("false");
            break;
          }
        } catch (error) {
          console.error("Unable to fetch subscription status:", error);
        }

        try {
          const profileResponse = await profileApis.getProfile();
          if (profileResponse?.hasActivePlan) {
            setSubscriptionStatusInLS("true");
            lastStatus = lastStatus || "ACTIVE";
            localStorage.setItem("cashfreeSubscriptionStatus", lastStatus);
            if (isMounted) {
              setPaymentStatus(lastStatus);
            }
            break;
          }
        } catch (profileError) {
          console.error("Unable to confirm active profile subscription:", profileError);
        }
      }

      if (isMounted) {
        setPaymentStatus(lastStatus || "PENDING");
        setPaymentStatusLoading(false);
      }
    };

    fetchSubscriptionStatus();
    return () => {
      isMounted = false;
    };
  }, [searchParams, showDownloadPopup]);

  useEffect(() => {
    if (!showOtpPopup || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [showOtpPopup, timeLeft]);

  useEffect(() => {
    if (window.location.hash === '#login') {
      setShowEventLogin(true);
    } else if (window.location.hash === '#otp') {
      setShowOtpPopup(true);
    }
  }, []);

  useEffect(() => {
    if (showEventLogin) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#login');
    } else if (showOtpPopup) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#otp');
    } else if (window.location.hash === '#login' || window.location.hash === '#otp') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [showEventLogin, showOtpPopup]);

  const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (deviceId) return deviceId;

    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  };

  const openEventLogin = () => {
    if (getIsLoggedIn()) {
      setShowLoginPrompt(false);
      return;
    }

    setShowLoginPrompt(false);
    setShowEventLogin(true);
  };

  const handleEventLoginSubmit = async (e) => {
    e.preventDefault();

    if (!mobile || mobile.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await loginApis.generateOtp(mobile, getOrCreateDeviceId(), getUserIdFromLS());
      setUserIdInLS(response?.userId);

      if (response.success) {
        setMobileNoInLS(mobile);
        sessionStorage.setItem("loginSource", "app-events1-payment");
        setShowEventLogin(false);
        setShowOtpPopup(true);
        setTimeLeft(30);
        setOtp(["", "", "", ""]);
      } else {
        alert(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Event login API error:", error);
      alert("Something went wrong!");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`app-event-otp-${index + 1}`)?.focus();
    }

    if (value && updatedOtp.every((digit) => digit !== "")) {
      setTimeout(() => document.getElementById("app-event-verify-btn")?.click(), 100);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`app-event-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, otp.length);
    if (!pasteData) return;

    const updatedOtp = [...otp];
    pasteData.split("").forEach((char, index) => {
      updatedOtp[index] = char;
    });
    setOtp(updatedOtp);

    const focusIndex = Math.min(pasteData.length - 1, otp.length - 1);
    document.getElementById(`app-event-otp-${focusIndex}`)?.focus();

    if (updatedOtp.every((digit) => digit !== "")) {
      setTimeout(() => document.getElementById("app-event-verify-btn")?.click(), 100);
    }
  };

  const resendOtp = async () => {
    const savedMobile = getMobileNoFromLS() || mobile;
    if (!savedMobile) return;

    setTimeLeft(30);
    try {
      const response = await loginApis.generateOtp(savedMobile, getOrCreateDeviceId(), getUserIdFromLS());
      setUserIdInLS(response?.userId);
    } catch (error) {
      console.error("Event login resend OTP error:", error);
    }
  };

  const handleOtpVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("https://api.bhaktibhav.app/frontend/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: getMobileNoFromLS() || mobile, otp: otpCode, source: "web", deviceId: getOrCreateDeviceId() }),
      });
      const data = await res.json();

      if (res.status === 400) {
        alert(data.message || "OTP verification failed");
        return;
      }

      if (data && data?.token?.length > 0) {
        setTokenInLS(data.token);
        setIsLoggedIn();
        sessionStorage.removeItem("loginSource");
        setShowOtpPopup(false);
        if (proceedToPayment) {
          navigate("/payment");
        }
      }
    } catch (error) {
      console.error("Event login verify OTP error:", error);
      alert("Network error occurred. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDownloadApp = () => {
    const normalizedStatus = (paymentStatus || "").toUpperCase();
    const isSubscriptionConfirmed = SUBSCRIPTION_SUCCESS_STATUSES.includes(normalizedStatus);

    if (!isSubscriptionConfirmed) {
      navigate("/payment");
      return;
    }

    if (deviceType === "ios" || deviceType === "android") {
      redirectToStore();
      return;
    }

    window.location.href = storeUrls.android;
  };

  const normalizedPaymentStatus = (paymentStatus || "").toUpperCase();
  const isSubscriptionConfirmed = SUBSCRIPTION_SUCCESS_STATUSES.includes(normalizedPaymentStatus);
  const isSubscriptionFailed = SUBSCRIPTION_FAILURE_STATUSES.includes(normalizedPaymentStatus);

  const handlePlanClick = (planId) => {
    setSelectedPlan(planId);
    if (getIsLoggedIn()) {
      navigate("/payment");
    } else {
      setProceedToPayment(true);
      setShowEventLogin(true);
    }
  };

  return (
    <div className="min-h-screen min-w-[1180px] bg-[#fff8f0] font-sans text-gray-800">
      <style>{`
        * {
          letter-spacing: normal !important;
        }
      `}</style>
      {/* 2. Hero Section (Two Columns, Tight Spacing) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff8f0] to-white px-12 py-10 pt-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Beautiful Logo in Top Right */}
        <div className="fixed top-8 right-8 z-50 flex flex-col items-end cursor-default bg-white/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] to-[#e64a66] font-black text-5xl leading-none drop-shadow-sm">भक्ति भाव</span>
          <span className="text-lg font-bold text-gray-500 mt-2">हर दिन भक्ति, हर कदम शांति</span>
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1000px] flex-row items-center justify-center gap-12 mt-8">
          
          {/* Left Column (Text & Buttons) */}
          <div className="flex-1 max-w-lg">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-800 text-xl px-5 py-2.5 rounded-full mb-6 font-bold border border-orange-100 shadow-sm">
              <span className="text-orange-500 text-2xl leading-none animate-pulse">❖</span> आपकी आध्यात्मिक यात्रा का साथी
            </div>
            
            <h1 className="mb-10 text-[4.5rem] font-extrabold leading-[1.15] text-gray-900 tracking-tight">
              हर व्रत, पूजा और त्योहार की <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] to-[#e64a66]">पूरी जानकारी</span> <br/>
              एक ही जगह
            </h1>
            
            <div className="mb-12">
              <a href="#plans" className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#9A283D] to-[#7a1f30] px-10 py-5 text-3xl font-bold text-white shadow-xl shadow-red-900/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-900/30">
                अपनी यात्रा शुरू करें <span className="text-4xl leading-none transition-transform group-hover:translate-x-2">→</span>
              </a>
            </div>

            <div className="flex max-w-max items-center gap-8 rounded-[2rem] border border-white/60 bg-white/70 p-5 px-8 text-center shadow-lg shadow-gray-200/50 backdrop-blur-md">
              <div className="flex flex-col items-center">
                <span className="text-[#9A283D] font-extrabold text-3xl flex items-center gap-2"><span className="text-3xl">👥</span> 50K+</span>
                <span className="text-lg mt-1 text-gray-600 font-bold whitespace-nowrap">भक्तों का विश्वास</span>
              </div>
              <div className="w-[2px] h-14 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500 font-extrabold text-3xl flex items-center gap-2"><span className="text-3xl">🛡️</span> 100%</span>
                <span className="text-lg mt-1 text-gray-600 font-bold whitespace-nowrap">सुरक्षित भुगतान</span>
              </div>
              <div className="w-[2px] h-14 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex flex-col items-center">
                <span className="text-yellow-500 font-extrabold text-3xl flex items-center gap-2"><span className="text-3xl">⭐</span> 4.8/5</span>
                <span className="text-lg mt-1 text-gray-600 font-bold whitespace-nowrap">Play Store</span>
              </div>
            </div>
          </div>

          {/* Right Column (Phone Mockup) */}
          <div className="flex-none w-[240px]">
            <div className="relative w-full shadow-2xl rounded-[3rem] border-[10px] border-gray-900 bg-white overflow-hidden aspect-[9/19.5]">
              <img src="/app-mockup.png" alt="App Screen" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features (5 Columns, Large Text) */}
      <section className="relative border-y border-gray-200 bg-white px-12 py-8 shadow-sm">
        <div className="mx-auto flex max-w-[1100px] flex-row justify-between gap-6">
          {[
            { icon: "📅", name: "पंचांग" },
            { icon: "🏺", name: "व्रत और त्योहार" },
            { icon: "📿", name: "नाम जाप" },
            { icon: "🪔", name: "आरती" },
            { icon: "📖", name: "कथा" },
          ].map((feature, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-100 rounded-[2rem] shadow-sm bg-white hover:shadow-md transition-shadow">
              <span className="mb-3 text-7xl">{feature.icon}</span>
              <span className="text-center text-3xl font-extrabold text-gray-800">{feature.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Plans (Side by Side) */}
      <section id="plans" className="bg-[#fff8f0] px-12 py-12">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="relative mb-12 flex items-center justify-center text-center text-[4rem] font-extrabold text-[#9A283D]">
            <span className="bg-[#fff8f0] px-10 z-10">अपने लिए सही प्लान चुनें</span>
            <div className="absolute left-0 right-0 h-[3px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="flex flex-row items-center justify-center gap-14">
            
            {/* Plan 1 */}
            <div 
              onClick={() => handlePlanClick(1)}
              className={`relative w-full max-w-[460px] flex-1 cursor-pointer rounded-[2.5rem] bg-white p-12 pt-20 shadow-sm transition-all ${selectedPlan === 1 ? 'border-[5px] border-[#7a1f30] -translate-y-4 shadow-xl' : 'border-4 border-gray-200'}`}
            >
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-2xl font-bold px-5 py-2 rounded-lg">16% बचत</div>
              
              <h3 className="text-4xl font-bold text-[#9A283D] mb-6 text-center">3 महीने का प्लान</h3>
              
              <div className="flex justify-center items-end gap-4 mb-8">
                <span className={`text-[6rem] leading-none font-extrabold ${selectedPlan === 1 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹251</span>
                <span className="text-4xl text-gray-400 line-through mb-2">₹299</span>
              </div>
              
              <button className={`w-full font-bold py-6 rounded-2xl transition-colors text-4xl mt-6 ${selectedPlan === 1 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-4 border-[#7a1f30]'}`}>
                {selectedPlan === 1 ? 'आगे बढ़ें' : 'प्लान चुनें'}
              </button>
            </div>

            {/* Plan 2 (Popular) */}
            <div 
              onClick={() => handlePlanClick(2)}
              className={`relative w-full max-w-[460px] flex-1 cursor-pointer rounded-[2.5rem] bg-white p-12 pt-20 transition-all ${selectedPlan === 2 ? 'border-[5px] border-[#7a1f30] -translate-y-4 shadow-xl' : 'border-4 border-gray-200 shadow-sm'}`}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-2xl font-bold px-10 py-4 rounded-full shadow-lg uppercase tracking-wide whitespace-nowrap">सबसे लोकप्रिय</div>
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-2xl font-bold px-5 py-2 rounded-lg">28% बचत</div>
              
              <h3 className="text-4xl font-bold text-[#9A283D] mb-6 text-center mt-2">1 साल का प्लान</h3>
              
              <div className="flex justify-center items-end gap-4 mb-8">
                <span className={`text-[6rem] leading-none font-extrabold ${selectedPlan === 2 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹501</span>
                <span className="text-4xl text-gray-400 line-through mb-2">₹699</span>
              </div>
              
              <button className={`w-full font-bold py-6 rounded-2xl transition-colors text-4xl mt-6 ${selectedPlan === 2 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-4 border-[#7a1f30]'}`}>
                {selectedPlan === 2 ? 'आगे बढ़ें' : 'प्लान चुनें'}
              </button>
            </div>

          </div>

          {/* Guarantees */}
          <div className="mx-auto mt-12 flex w-full flex-row justify-evenly items-center rounded-[2rem] border-2 border-gray-200 bg-white p-6 px-8 shadow-sm">
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔒</span> 100% सुरक्षित भुगतान</div>
            <div className="w-[2px] h-10 bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔓</span> कभी भी रद्द करें</div>
            <div className="w-[2px] h-10 bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🎧</span> त्वरित सहायता</div>
          </div>
        </div>
      </section>

      {/* 5. How it Works (Horizontal Steps) */}
      <section className="border-t border-gray-100 bg-white px-12 py-12">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="relative mb-12 flex items-center justify-center text-center text-[4rem] font-extrabold text-[#9A283D]">
            <span className="bg-white px-10 z-10">कैसे काम करता है?</span>
            <div className="absolute left-0 right-0 h-[3px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="relative mx-auto flex max-w-6xl flex-row items-start justify-between gap-10">
            {/* Dashed line connecting steps */}
            <div className="absolute left-24 right-24 top-16 z-0 h-1 border-t-[6px] border-dashed border-gray-300"></div>

            <div className="relative z-10 flex w-56 flex-col items-center text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-[#9A283D] bg-white text-6xl shadow-lg">💳</div>
              <h4 className="text-4xl font-extrabold text-[#9A283D]">चुनें</h4>
              <p className="mt-3 text-3xl font-bold text-gray-500">प्लान चुनें</p>
            </div>
            
            <div className="relative z-10 flex w-56 flex-col items-center text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-[#9A283D] bg-white text-6xl shadow-lg">🛡️</div>
              <h4 className="text-4xl font-extrabold text-[#9A283D]">भुगतान करें</h4>
              <p className="mt-3 text-3xl font-bold text-gray-500">सुरक्षित भुगतान करें</p>
            </div>
            
            <div className="relative z-10 flex w-56 flex-col items-center text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-[#9A283D] bg-white text-6xl shadow-lg">⬇️</div>
              <h4 className="text-4xl font-extrabold text-[#9A283D]">डाउनलोड करें</h4>
              <p className="mt-3 text-3xl font-bold text-gray-500">ऐप डाउनलोड करें</p>
            </div>
            
            <div className="relative z-10 flex w-56 flex-col items-center text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-[#9A283D] bg-white text-6xl shadow-lg">👤</div>
              <h4 className="text-4xl font-extrabold text-[#9A283D]">लॉगिन करें</h4>
              <p className="mt-3 text-3xl font-bold text-gray-500">और शुरू करें भक्ति</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (3 Cards Horizontal) */}
      <section className="bg-[#fff8f0] px-12 py-12">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="mb-12 text-center text-[4rem] font-extrabold text-[#9A283D]">भक्तों के अनुभव</h2>
          
          <div className="flex flex-row justify-center gap-10">
            
            {/* Card 1 */}
            <div className="flex-1 bg-white p-12 rounded-[2.5rem] shadow-sm border-2 border-gray-100">
              <div className="text-yellow-400 text-5xl mb-8">★★★★★</div>
              <p className="text-3xl text-gray-700 italic mb-10 font-medium leading-relaxed">"भक्ति भाव ने मेरी रोजमर्रा की भक्ति को बहुत आसान बना दिया है।"</p>
              <div className="flex items-center gap-6">
                <img src="https://ui-avatars.com/api/?name=Neha+Sharma&background=random" alt="User" className="w-20 h-20 rounded-full" />
                <div>
                  <h5 className="text-3xl font-bold text-[#9A283D]">नेहा शर्मा</h5>
                  <p className="text-2xl mt-1 text-gray-500 font-bold">दिल्ली</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="flex-1 bg-white p-12 rounded-[2.5rem] shadow-sm border-2 border-gray-100">
              <div className="text-yellow-400 text-5xl mb-8">★★★★★</div>
              <p className="text-3xl text-gray-700 italic mb-10 font-medium leading-relaxed">"नाम जाप फीचर बहुत ही अद्भुत है। 108 नाम करने की आदत बन गई है।"</p>
              <div className="flex items-center gap-6">
                <img src="https://ui-avatars.com/api/?name=Rohit+Verma&background=random" alt="User" className="w-20 h-20 rounded-full" />
                <div>
                  <h5 className="text-3xl font-bold text-[#9A283D]">रोहित वर्मा</h5>
                  <p className="text-2xl mt-1 text-gray-500 font-bold">जयपुर</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-1 bg-white p-12 rounded-[2.5rem] shadow-sm border-2 border-gray-100">
              <div className="text-yellow-400 text-5xl mb-8">★★★★★</div>
              <p className="text-3xl text-gray-700 italic mb-10 font-medium leading-relaxed">"बहुत उपयोगी ऐप है। आरती, मंत्र और कथा सब कुछ एक ही जगह पर मिलता है।"</p>
              <div className="flex items-center gap-6">
                <img src="https://ui-avatars.com/api/?name=Anjali+Patel&background=random" alt="User" className="w-20 h-20 rounded-full" />
                <div>
                  <h5 className="text-3xl font-bold text-[#9A283D]">अंजलि पटेल</h5>
                  <p className="text-2xl mt-1 text-gray-500 font-bold">अहमदाबाद</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer / Final CTA */}
      <section id="download" className="relative overflow-hidden bg-[#590f1d] px-12 py-16 text-white">
        <div className="relative z-10 mx-auto flex max-w-[1100px] flex-row items-center justify-center gap-12">
          
          <div className="flex items-center gap-10">
            <div className="text-[140px] drop-shadow-[0_0_20px_rgba(252,211,77,0.8)] leading-none">🪔</div>
            <h2 className="text-[3rem] font-extrabold leading-tight whitespace-nowrap">आज ही जुड़ें और अपनी आध्यात्मिक<br/>यात्रा को बनाएं और भी खास</h2>
          </div>
          
        </div>
      </section>

      {/* Bottom Legal */}
      <footer className="border-t border-gray-200 bg-white px-12 py-4 text-2xl text-gray-500">
        <div className="mx-auto flex max-w-[1100px] flex-row items-center justify-between">
          <span className="font-bold whitespace-nowrap">© 2026 भक्ति भाव. सर्वाधिकार सुरक्षित.</span>
          <div className="flex items-center gap-6 font-bold">
            <Link to="/privacyPolicy" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">गोपनीयता नीति</Link>
            <span className="text-gray-300">|</span>
            <Link to="/termsAndConditions" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">नियम और शर्तें</Link>
            <span className="text-gray-300">|</span>
            <Link to="/contact-us" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">संपर्क करें</Link>
          </div>
        </div>
      </footer>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#F9D99A]">
          {/* Background Decor */}
          <img
            src={mandalaImg}
            alt=""
            className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 animate-[spin_60s_linear_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F9D99A]/50" />

          <div className="relative z-10 w-full max-w-[800px] px-6 text-center">
            <div className="relative mx-auto flex justify-center">
              <img
                src="/img/bell-img.png"
                alt=""
                className="relative z-20 h-48 w-36 object-contain drop-shadow-2xl sm:h-56 sm:w-44"
              />
              <div className="absolute top-[60px] z-10 h-56 w-48 rounded-t-full bg-white/50 shadow-[0_0_80px_rgba(255,255,255,1)] sm:top-[70px] sm:h-64 sm:w-56" />
            </div>

            <div className="relative z-20 mx-auto mt-12 sm:mt-16">
              <h2 className="font-eng text-5xl font-extrabold leading-tight text-[#760914] drop-shadow-sm sm:text-7xl">
                Unlock Bhakti Bhav Plus
              </h2>
              <p className="mt-5 font-hindi text-4xl font-bold leading-tight text-[#760914] drop-shadow-sm sm:mt-8 sm:text-6xl">
                रोज की भक्ति बिना रुकावट
              </p>

              <button
                type="button"
                onClick={openEventLogin}
                className="mx-auto mt-16 block w-full max-w-[600px] rounded-[32px] bg-[#A72440] px-8 py-6 font-eng text-4xl font-extrabold tracking-wide text-white shadow-[0_10px_40px_rgba(167,36,64,0.4)] transition-transform hover:scale-105 hover:bg-[#86182f] sm:mt-20 sm:py-8 sm:text-5xl"
              >
                Free Login
              </button>

              <p className="mt-12 font-eng text-2xl font-bold tracking-wide text-[#A72440]/80 sm:mt-16 sm:text-3xl">
                Trusted by Lakhs of Devotees
              </p>
            </div>
          </div>
        </div>
      )}

      {showEventLogin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-[#FFF8F0] bg-cover bg-center" style={{ backgroundImage: "url('./img/home_bg.png')" }}>

          <div className="relative z-10 w-full max-w-[950px] px-8 text-center pt-16">
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setShowEventLogin(false);
                setProceedToPayment(false);
              }}
              className="absolute right-8 top-0 z-20 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-[4rem] text-white shadow-xl backdrop-blur hover:bg-white/20 pb-2 border border-white/20"
            >
              ×
            </button>

            <div className="relative z-10 mx-auto flex flex-col items-center">
              <img src="./img/logo_splash.png" alt="Bhakti Bhav" className="h-[280px] w-[300px] drop-shadow-2xl sm:h-[320px] sm:w-[340px]" />
              <div className="-mt-8 rounded-full border-[8px] border-white bg-[#FFE4B3] px-14 py-6 font-eng text-[2rem] font-extrabold tracking-widest text-[#9A283D] shadow-2xl sm:text-[2.5rem]">
                BHAKTI BHAV FAMILY
              </div>
            </div>

            <form onSubmit={handleEventLoginSubmit} className="relative z-10 mx-auto mt-20 w-full max-w-[850px] rounded-[3.5rem] bg-white/95 p-16 shadow-2xl backdrop-blur-sm sm:p-20">
              <h2 className="font-eng text-[5rem] font-extrabold text-[#A72440] sm:text-[6rem]">Sign In</h2>
              <p className="mt-6 font-eng text-[3rem] font-bold text-gray-500 sm:text-[3.5rem]">Enter your Phone Number</p>

              <div className="mt-16 flex h-32 items-center rounded-[2.5rem] bg-[#F8F9FA] px-8 shadow-inner border-[3px] border-gray-100 sm:h-36 sm:px-10">
                <span className="border-r-[4px] border-gray-300 pr-5 font-eng text-[3rem] font-extrabold text-black sm:pr-6 sm:text-[3.5rem]">+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="XXXXXXXXXX"
                  className="min-w-0 flex-1 bg-transparent px-5 font-eng text-[3rem] font-bold text-[#9A283D] placeholder:text-[#C98B9A] focus:outline-none sm:px-6 sm:text-[3.5rem] tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-20 w-full rounded-[3rem] bg-gradient-to-r from-[#A72440] to-[#9A283D] py-10 font-eng text-[3.5rem] font-extrabold tracking-wide text-white shadow-[0_15px_40px_rgba(167,36,64,0.4)] transition hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-60 sm:py-12 sm:text-[4rem]"
              >
                {loginLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#FFF8F0] bg-cover bg-center" style={{ backgroundImage: "url('./img/home_bg.png')" }}>

          <div className="relative z-10 w-full max-w-[950px] px-8 text-center pt-16">
            <button
              type="button"
              aria-label="Back to Phone Input"
              onClick={() => {
                setShowOtpPopup(false);
                setShowEventLogin(true);
              }}
              className="absolute left-8 top-0 z-20 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-[3.5rem] text-white shadow-xl backdrop-blur hover:bg-white/20 border border-white/20"
            >
              ←
            </button>

            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setShowOtpPopup(false);
                setProceedToPayment(false);
              }}
              className="absolute right-8 top-0 z-20 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-[4rem] text-white shadow-xl backdrop-blur hover:bg-white/20 pb-2 border border-white/20"
            >
              ×
            </button>

            <img src="./img/logo_splash.png" alt="Bhakti Bhav" className="mx-auto h-[280px] w-[300px] drop-shadow-2xl sm:h-[320px] sm:w-[340px]" />
            
            <div className="relative z-10 mx-auto mt-20 w-full max-w-[850px] rounded-[3.5rem] bg-white/95 p-16 shadow-2xl backdrop-blur-sm sm:p-20">
              <h2 className="font-eng text-[5rem] font-extrabold text-[#A72440] sm:text-[6rem]">Verify OTP</h2>
              <p className="mt-6 font-eng text-[2.8rem] font-medium text-gray-500 sm:text-[3.2rem]">
                We've sent a code to <span className="font-bold text-[#A72440]">{getMobileNoFromLS() || mobile}</span>
              </p>

              <div className="mt-16 flex justify-center gap-6 sm:gap-8" onPaste={handleOtpPaste}>
                {otp.map((value, index) => (
                  <input
                    key={index}
                    id={`app-event-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="h-32 w-32 rounded-[2.5rem] border-[4px] border-[#E6C1C8] bg-[#F8F9FA] text-center font-eng text-[4.5rem] font-bold text-[#9A283D] focus:border-[#9A283D] focus:bg-white focus:outline-none focus:ring-[6px] focus:ring-[#9A283D]/20 transition-all sm:h-36 sm:w-36 sm:text-[5rem]"
                  />
                ))}
              </div>

              <div className="mt-14 flex items-center justify-between px-4 font-eng text-[2.5rem] font-medium text-gray-500 sm:text-[2.8rem]">
                <button
                  type="button"
                  disabled={timeLeft > 0}
                  onClick={resendOtp}
                  className={timeLeft > 0 ? "text-gray-400" : "font-bold text-[#9A283D] underline hover:text-[#7A1F30]"}
                >
                  Resend OTP
                </button>
                <span className="font-bold text-gray-700">{timeLeft > 0 ? `${timeLeft}s` : "0s"}</span>
              </div>

              <button
                id="app-event-verify-btn"
                type="button"
                onClick={handleOtpVerify}
                disabled={otpLoading}
                className="mt-20 w-full rounded-[3rem] bg-gradient-to-r from-[#A72440] to-[#9A283D] py-10 font-eng text-[3.5rem] font-extrabold tracking-wide text-white shadow-[0_15px_40px_rgba(167,36,64,0.4)] transition hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-60 sm:py-12 sm:text-[4rem]"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDownloadPopup && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 px-4 py-6">
          <div className="relative w-full max-w-[420px] rounded-[32px] bg-[#FFF8F0] px-6 py-8 text-center shadow-2xl">
            <button
              type="button"
              aria-label="Close download popup"
              onClick={() => setShowDownloadPopup(false)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-4xl leading-none text-[#9A283D] shadow"
            >
              ×
            </button>

            <img src="./img/logo_splash.png" alt="Bhakti Bhav" className="mx-auto h-28 w-32" />
            <h2 className="mt-5 font-eng text-3xl font-extrabold text-[#9A283D]">Download Bhakti Bhav App</h2>
            <p className="mt-3 font-hindi text-2xl font-bold text-[#7a1f30]">
              आपकी भक्ति यात्रा अब ऐप में जारी रखें
            </p>
            <p className="mt-4 font-eng text-sm text-gray-600">
              {paymentStatusLoading ? "Checking payment status..." : `Subscription status: ${normalizedPaymentStatus || "PROCESSING"}`}
            </p>
            {!paymentStatusLoading && !isSubscriptionConfirmed && (
              <p className={`mt-3 font-eng text-sm ${isSubscriptionFailed ? "text-red-600" : "text-[#9A283D]"}`}>
                {isSubscriptionFailed
                  ? "Payment was not confirmed. Please try again."
                  : "We are waiting for mandate confirmation. Please retry after a moment."}
              </p>
            )}

            <button
              type="button"
              onClick={handleDownloadApp}
              className="mt-8 w-full rounded-2xl bg-[#A72440] py-4 font-eng text-2xl font-bold text-white shadow-xl transition hover:bg-[#86182f]"
            >
              {isSubscriptionConfirmed ? "Download App" : "Retry Payment"}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AppEvents1;
