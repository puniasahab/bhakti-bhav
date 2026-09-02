import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginApis, paymentApis, profileApis } from "../api";
import { getIsLoggedIn, getMobileNoFromLS, getUserIdFromLS, setIsLoggedIn, setMobileNoInLS, setSubscriptionStatusInLS, setTokenInLS, setUserIdInLS } from "../commonFunctions";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";
import mandalaImg from "../assets/img/mandala.png";

const SUBSCRIPTION_SUCCESS_STATUSES = ["ACTIVE"];
const SUBSCRIPTION_FAILURE_STATUSES = ["FAILED", "CANCELLED", "AUTHORIZATION_CANCELLED", "EXPIRED"];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DESKTOP_VIEWPORT_CONTENT = "width=1180, initial-scale=1";

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

    if (!getIsLoggedIn()) {
      setShowLoginPrompt(true);
    }
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
      navigate("/payment");
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
        navigate("/payment");
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

  return (
    <div className="min-h-screen min-w-[1180px] bg-[#fff8f0] font-sans text-gray-800">
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-white px-12 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[#9A283D] font-bold text-4xl leading-tight">भक्ति भाव</span>
            <span className="text-base text-gray-500 leading-none mt-1">हर दिन भक्ति, हर कदम शांति</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-xl font-bold text-gray-600">
          <a href="#" className="text-[#9A283D] border-b-2 border-[#9A283D] pb-1">होम</a>
          <a href="#plans" className="hover:text-[#9A283D] transition-colors">प्लान</a>
          <a href="#download" className="hover:text-[#9A283D] transition-colors">डाउनलोड</a>
          <a href="#" className="hover:text-[#9A283D] transition-colors">सहायता</a>
        </div>

        <a href="#download" className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#590f1d] px-8 py-3 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#360810]">
          ऐप डाउनलोड करें
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </a>
      </nav>

      {/* 2. Hero Section (Two Columns, Tight Spacing) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#fff8f0] to-[#f9ede1] px-12 pb-10 pt-16">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 bg-cover bg-center pointer-events-none" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kashi_Vishwanath_Temple_Varanasi.jpg/800px-Kashi_Vishwanath_Temple_Varanasi.jpg)' }}></div>
        
        <div className="relative z-10 mx-auto flex max-w-[1100px] flex-row items-center justify-center gap-10">
          
          {/* Left Column (Text & Buttons) */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-base px-4 py-2 rounded-md mb-6 font-bold border border-yellow-200">
              <span className="text-yellow-500 text-2xl leading-none">❖</span> आपकी आध्यात्मिक यात्रा का साथी
            </div>
            
            <h1 className="mb-10 text-6xl font-extrabold leading-[1.15] text-gray-900">
              हर व्रत, पूजा और त्योहार की <br/>
              <span className="text-[#9A283D]">पूरी जानकारी</span> <br/>
              एक ही जगह
            </h1>
            
            <div className="mb-12 flex flex-row gap-4">
              <a href="#plans" className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#7a1f30] px-8 py-4 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-[#590f1d]">
                अपनी यात्रा शुरू करें <span className="text-3xl leading-none">→</span>
              </a>
              <button className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-[#7a1f30] bg-white px-8 py-4 text-2xl font-bold text-[#7a1f30] transition-colors hover:bg-gray-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                वीडियो देखें
              </button>
            </div>

            <div className="flex max-w-max items-center gap-6 rounded-xl border border-gray-200 bg-white/80 p-4 text-center shadow-sm backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <span className="text-[#9A283D] font-bold text-3xl flex items-center gap-2"><span className="text-3xl">👥</span> 50K+</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">भक्तों का विश्वास</span>
              </div>
              <div className="w-[1px] h-12 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500 font-bold text-3xl flex items-center gap-2"><span className="text-3xl">🛡️</span> 100%</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">सुरक्षित भुगतान</span>
              </div>
              <div className="w-[1px] h-12 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500 font-bold text-3xl flex items-center gap-2"><span className="text-3xl">⭐</span> 4.8/5</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">Play Store</span>
              </div>
            </div>
          </div>

          {/* Right Column (Phone Mockup) */}
          <div className="flex-none w-[280px]">
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
            <div key={i} className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
              <span className="mb-4 text-7xl">{feature.icon}</span>
              <span className="text-center text-2xl font-extrabold text-gray-800">{feature.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Plans (Side by Side) */}
      <section id="plans" className="bg-[#fff8f0] px-12 py-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="relative mb-16 flex items-center justify-center text-center text-5xl font-extrabold text-[#9A283D]">
            <span className="bg-[#fff8f0] px-8 z-10">अपने लिए सही प्लान चुनें</span>
            <div className="absolute left-0 right-0 h-[2px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="flex flex-row items-center justify-center gap-12">
            
            {/* Plan 1 */}
            <div 
              onClick={() => setSelectedPlan(1)}
              className={`relative w-full max-w-[420px] flex-1 cursor-pointer rounded-[2rem] bg-white p-10 pt-16 shadow-sm transition-all ${selectedPlan === 1 ? 'border-[4px] border-[#7a1f30] -translate-y-4 shadow-xl' : 'border-2 border-gray-200'}`}
            >
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-xl font-bold px-4 py-2 rounded">16% बचत</div>
              
              <h3 className="text-3xl font-bold text-[#9A283D] mb-4 text-center">3 महीने का प्लान</h3>
              
              <div className="flex justify-center items-end gap-3 mb-6">
                <span className={`text-7xl font-extrabold ${selectedPlan === 1 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹251</span>
                <span className="text-3xl text-gray-400 line-through mb-2">₹299</span>
              </div>
              
              <button className={`w-full font-bold py-5 rounded-xl transition-colors text-3xl mt-4 ${selectedPlan === 1 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-2 border-[#7a1f30]'}`}>
                {selectedPlan === 1 ? 'चयनित प्लान' : 'प्लान चुनें'}
              </button>
            </div>

            {/* Plan 2 (Popular) */}
            <div 
              onClick={() => setSelectedPlan(2)}
              className={`relative w-full max-w-[420px] flex-1 cursor-pointer rounded-[2rem] bg-white p-10 pt-16 transition-all ${selectedPlan === 2 ? 'border-[4px] border-[#7a1f30] -translate-y-4 shadow-xl' : 'border-2 border-gray-200 shadow-sm'}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xl font-bold px-8 py-3 rounded-full shadow-md uppercase tracking-wide whitespace-nowrap">सबसे लोकप्रिय</div>
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-xl font-bold px-4 py-2 rounded">28% बचत</div>
              
              <h3 className="text-3xl font-bold text-[#9A283D] mb-4 text-center mt-2">1 साल का प्लान</h3>
              
              <div className="flex justify-center items-end gap-3 mb-6">
                <span className={`text-7xl font-extrabold ${selectedPlan === 2 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹501</span>
                <span className="text-3xl text-gray-400 line-through mb-2">₹699</span>
              </div>
              
              <button className={`w-full font-bold py-5 rounded-xl transition-colors text-3xl mt-4 ${selectedPlan === 2 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-2 border-[#7a1f30]'}`}>
                {selectedPlan === 2 ? 'चयनित प्लान' : 'प्लान चुनें'}
              </button>
            </div>

          </div>

          {/* Guarantees */}
          <div className="mx-auto mt-16 flex max-w-5xl flex-row justify-center gap-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🛡️</span> 7 दिन की मनी बैक</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔒</span> 100% सुरक्षित भुगतान</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔓</span> कभी भी रद्द करें</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🎧</span> त्वरित सहायता</div>
          </div>
        </div>
      </section>

      {/* 5. How it Works (Horizontal Steps) */}
      <section className="border-t border-gray-100 bg-white px-12 py-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="relative mb-20 flex items-center justify-center text-center text-5xl font-extrabold text-[#9A283D]">
            <span className="bg-white px-8 z-10">कैसे काम करता है?</span>
            <div className="absolute left-0 right-0 h-[2px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="relative mx-auto flex max-w-5xl flex-row items-start justify-between gap-8">
            {/* Dashed line connecting steps */}
            <div className="absolute left-20 right-20 top-12 z-0 h-1 border-t-4 border-dashed border-gray-300"></div>

            <div className="relative z-10 flex w-48 flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[#9A283D] bg-white text-4xl shadow-md">💳</div>
              <h4 className="text-3xl font-extrabold text-[#9A283D]">चुनें</h4>
              <p className="mt-2 text-xl font-bold text-gray-500">प्लान चुनें</p>
            </div>
            
            <div className="relative z-10 flex w-48 flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[#9A283D] bg-white text-4xl shadow-md">🛡️</div>
              <h4 className="text-3xl font-extrabold text-[#9A283D]">भुगतान करें</h4>
              <p className="mt-2 text-xl font-bold text-gray-500">सुरक्षित भुगतान करें</p>
            </div>
            
            <div className="relative z-10 flex w-48 flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[#9A283D] bg-white text-4xl shadow-md">⬇️</div>
              <h4 className="text-3xl font-extrabold text-[#9A283D]">डाउनलोड करें</h4>
              <p className="mt-2 text-xl font-bold text-gray-500">ऐप डाउनलोड करें</p>
            </div>
            
            <div className="relative z-10 flex w-48 flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[#9A283D] bg-white text-4xl shadow-md">👤</div>
              <h4 className="text-3xl font-extrabold text-[#9A283D]">लॉगिन करें</h4>
              <p className="mt-2 text-xl font-bold text-gray-500">और शुरू करें भक्ति</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (3 Cards Horizontal) */}
      <section className="bg-[#fff8f0] px-12 py-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="mb-16 text-center text-5xl font-extrabold text-[#9A283D]">भक्तों के अनुभव</h2>
          
          <div className="flex flex-row justify-center gap-8">
            
            {/* Card 1 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"भक्ति भाव ने मेरी रोजमर्रा की भक्ति को बहुत आसान बना दिया है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Neha+Sharma&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">नेहा शर्मा</h5>
                  <p className="text-lg text-gray-500 font-bold">दिल्ली</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"नाम जाप फीचर बहुत ही अद्भुत है। 108 नाम करने की आदत बन गई है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Rohit+Verma&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">रोहित वर्मा</h5>
                  <p className="text-lg text-gray-500 font-bold">जयपुर</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"बहुत उपयोगी ऐप है। आरती, मंत्र और कथा सब कुछ एक ही जगह पर मिलता है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Anjali+Patel&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">अंजलि पटेल</h5>
                  <p className="text-lg text-gray-500 font-bold">अहमदाबाद</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer / Final CTA */}
      <section id="download" className="relative overflow-hidden bg-[#590f1d] px-12 py-20 text-white">
        <div className="relative z-10 mx-auto flex max-w-[1100px] flex-row items-center justify-between gap-10">
          
          <div className="flex items-center gap-8">
            <div className="text-[100px] drop-shadow-[0_0_20px_rgba(252,211,77,0.8)] leading-none">🪔</div>
            <h2 className="text-5xl font-extrabold leading-tight">आज ही जुड़ें और अपनी <br/>आध्यात्मिक यात्रा को बनाएं <br/>और भी खास</h2>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="text-2xl text-gray-300 mb-4 font-bold">ऐप डाउनलोड करें</p>
            <div className="flex gap-6">
              <a href="#" className="hover:-translate-y-1 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-16" />
              </a>
              <a href="#" className="hover:-translate-y-1 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-16" />
              </a>
            </div>
            <button onClick={handleDownloadApp} className="mt-8 flex items-center gap-3 whitespace-nowrap rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-12 py-5 text-3xl font-bold text-gray-900 shadow-lg shadow-yellow-500/30 transition-transform hover:scale-105">
              ऐप डाउनलोड करें <span className="text-4xl leading-none">→</span>
            </button>
          </div>
          
        </div>
      </section>

      {/* Bottom Legal */}
      <footer className="flex flex-row items-center justify-between gap-4 border-t border-gray-200 bg-white px-12 py-8 text-center text-xl text-gray-500">
        <span className="font-bold">© 2026 भक्ति भाव. सर्वाधिकार सुरक्षित.</span>
        <div className="flex justify-center gap-8 font-bold">
          <Link to="/privacyPolicy" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">गोपनीयता नीति</Link>
          <span className="text-gray-300">|</span>
          <Link to="/termsAndConditions" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">नियम और शर्तें</Link>
          <span className="text-gray-300">|</span>
          <Link to="/contact-us" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">संपर्क करें</Link>
        </div>
      </footer>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45">
          <div className="relative w-full overflow-hidden rounded-t-[34px] bg-[#F9D99A] px-5 pb-8 pt-3 text-center shadow-2xl sm:rounded-t-[42px] sm:px-7 sm:pb-10">
            <button
              type="button"
              aria-label="Close login popup"
              onClick={() => setShowLoginPrompt(false)}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-4xl leading-none text-[#9A283D] shadow-md sm:h-14 sm:w-14 sm:text-5xl"
            >
              ×
            </button>

            <img
              src="/img/bell-img.png"
              alt=""
              className="mx-auto -mt-8 h-32 w-24 object-contain sm:h-36 sm:w-28"
            />
            <div className="absolute left-1/2 top-[140px] h-44 w-36 -translate-x-1/2 rounded-t-full bg-white/30 shadow-[0_0_42px_rgba(255,255,255,0.75)] sm:top-[155px] sm:h-52 sm:w-40" />
            <div className="relative z-10 mx-auto mt-8 max-w-[520px] sm:mt-12">
              <h2 className="font-eng text-3xl font-extrabold leading-tight text-[#760914] sm:text-[42px]">
                Unlock Bhakti Bhav Plus
              </h2>
              <p className="mt-3 font-hindi text-3xl leading-tight text-[#760914] sm:mt-4 sm:text-[40px]">
                रोज की भक्ति बिना रुकावट
              </p>
              <button
                type="button"
                onClick={openEventLogin}
                className="mt-10 w-full rounded-2xl bg-[#A72440] px-6 py-4 font-eng text-2xl font-medium text-white shadow-xl transition hover:bg-[#86182f] sm:mt-16 sm:py-5 sm:text-3xl"
              >
                Free Login
              </button>
              <p className="mt-10 font-eng text-lg font-medium text-[#A72440] sm:mt-16 sm:text-xl">
                Trusted by Lakhs of Devotees
              </p>
            </div>
          </div>
        </div>
      )}

      {showEventLogin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative max-h-[92vh] w-full max-w-[430px] overflow-hidden rounded-[32px] bg-white px-5 pb-8 pt-6 text-center shadow-2xl sm:px-8">
            <img
              src="/img/bell-img.png"
              alt=""
              className="absolute -left-8 -top-8 h-48 w-32 object-contain sm:h-56 sm:w-36"
            />
            <img
              src={mandalaImg}
              alt=""
              className="absolute right-0 top-10 h-48 w-48 opacity-20 sm:h-60 sm:w-60"
            />
            <button
              type="button"
              aria-label="Close login"
              onClick={() => {
                setShowEventLogin(false);
                setShowLoginPrompt(true);
              }}
              className="absolute right-5 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4dd] text-4xl leading-none text-[#9A283D] shadow"
            >
              ×
            </button>

            <div className="relative z-10 mt-32 flex flex-col items-center sm:mt-40">
              <img src="./img/logo_splash.png" alt="Bhakti Bhav" className="h-32 w-36 sm:h-[168px] sm:w-[176px]" />
              <div className="-mt-1 rounded-full border-[6px] border-white bg-[#FFE4B3] px-7 py-3 font-eng text-sm font-extrabold tracking-wide text-[#9A283D] shadow-xl sm:px-9 sm:py-4 sm:text-base">
                BHAKTI BHAV FAMILY
              </div>
            </div>

            <form onSubmit={handleEventLoginSubmit} className="relative z-10 mt-8 bg-white px-1">
              <h2 className="font-eng text-4xl font-extrabold text-[#A72440] sm:text-5xl">Sign In</h2>
              <p className="mt-2 font-eng text-2xl font-bold text-[#A72440] sm:text-3xl">Enter your Phone Number</p>

              <div className="mt-9 flex h-16 items-center rounded-2xl bg-[#F3F3F3] px-4 sm:mt-12 sm:h-20 sm:px-6">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">🇮🇳</span>
                <span className="ml-3 text-2xl text-black">⌄</span>
                <span className="ml-4 border-r border-gray-300 pr-4 font-eng text-3xl font-extrabold text-black sm:ml-6 sm:pr-5 sm:text-4xl">+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter Phone Nu..."
                  className="min-w-0 flex-1 bg-transparent px-4 font-eng text-xl font-medium text-[#9A283D] placeholder:text-[#C98B9A] focus:outline-none sm:px-6 sm:text-3xl"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-8 w-full rounded-2xl bg-[#A72440] py-4 font-eng text-3xl font-extrabold text-white shadow-xl transition hover:bg-[#86182f] disabled:opacity-60 sm:mt-10 sm:py-5 sm:text-4xl"
              >
                {loginLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative w-full max-w-[430px] rounded-[32px] bg-white px-6 py-8 text-center shadow-2xl">
            <button
              type="button"
              aria-label="Close OTP"
              onClick={() => {
                setShowOtpPopup(false);
                setShowEventLogin(true);
              }}
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4dd] text-4xl leading-none text-[#9A283D] shadow"
            >
              ×
            </button>

            <img src="./img/logo_splash.png" alt="Bhakti Bhav" className="mx-auto h-28 w-32" />
            <h2 className="mt-5 font-eng text-4xl font-extrabold text-[#A72440]">Verify OTP</h2>
            <p className="mt-2 font-eng text-base font-medium text-gray-600">
              We've sent a code to <span className="font-bold text-[#A72440]">{getMobileNoFromLS() || mobile}</span>
            </p>

            <div className="mt-8 flex justify-center gap-3" onPaste={handleOtpPaste}>
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
                  className="h-14 w-14 rounded-xl border-2 border-[#E6C1C8] text-center font-eng text-2xl font-bold text-[#9A283D] focus:border-[#9A283D] focus:outline-none"
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between font-eng text-sm text-gray-600">
              <button
                type="button"
                disabled={timeLeft > 0}
                onClick={resendOtp}
                className={timeLeft > 0 ? "text-gray-400" : "font-semibold text-[#9A283D] underline"}
              >
                Resend OTP
              </button>
              <span>{timeLeft > 0 ? `${timeLeft}s` : "0s"}</span>
            </div>

            <button
              id="app-event-verify-btn"
              type="button"
              onClick={handleOtpVerify}
              disabled={otpLoading}
              className="mt-8 w-full rounded-2xl bg-[#A72440] py-4 font-eng text-2xl font-extrabold text-white shadow-xl transition hover:bg-[#86182f] disabled:opacity-60"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
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
