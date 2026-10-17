import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";
import { loginApis, paymentApis, profileApis, subscriptionApis } from "../api";
import {
  getIsLoggedIn,
  getMobileNoFromLS,
  getTokenFromLS,
  getUserIdFromLS,
  setIsLoggedIn,
  setMobileNoInLS,
  setSubscriptionStatusInLS,
  setTokenInLS,
  setUserIdInLS,
} from "../commonFunctions";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";
import { buildCashfreeReturnUrl } from "../utils/paymentReturnUrl";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";

const SUBSCRIPTION_SUCCESS_STATUSES = ["ACTIVE", "PAID", "SUCCESS", "COMPLETED"];
const SUBSCRIPTION_WAITING_STATUSES = ["INITIALIZED", "INITIATED", "PENDING", "BANK_APPROVAL_PENDING", "VERIFYING", "PROCESSING"];
const SUBSCRIPTION_FAILURE_STATUSES = ["FAILED", "CANCELLED", "AUTHORIZATION_CANCELLED", "EXPIRED"];
const COUNTDOWN_SECONDS = 180; // 3 minutes countdown for payment process

const APPSFLYER_URL =
  process.env.REACT_APP_APPSFLYER_URL ||
  process.env.NEXT_PUBLIC_APPSFLYER_URL ||
  "https://bhakti-bhav-referral.onelink.me/VOv8";

const WEB_LOGIN_TOKEN_URL =
  process.env.REACT_APP_WEB_LOGIN_TOKEN_URL ||
  "https://api.bhaktibhav.app/api/v2/users/web-login-token";

async function createWebLoginToken(userJwtToken) {
  const response = await fetch(WEB_LOGIN_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJwtToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data?.token) {
    throw new Error(data?.message || "Unable to generate app login token");
  }
  return data.token;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatMobileDisplay = (val) => {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, "").slice(0, 10);
  if (clean.length > 5) {
    return `${clean.slice(0, 5)}  ${clean.slice(5)}`;
  }
  return clean;
};

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (deviceId) return deviceId;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    deviceId = crypto.randomUUID();
  } else {
    deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  localStorage.setItem("deviceId", deviceId);
  return deviceId;
};

// UPI Apps definitions matching Image 2
const UPI_APPS = [
  {
    id: "phonepe",
    name: "PhonePe",
    popular: true,
    accentColor: "#5f259f",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-[#5f259f] flex items-center justify-center shadow-md">
        <span className="text-white font-black text-2xl leading-none">पे</span>
      </div>
    ),
  },
  {
    id: "paytm",
    name: "Paytm",
    popular: false,
    accentColor: "#00b9f5",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-gray-200 shadow-md px-1">
        <span className="text-[#00b9f5] font-black text-xs leading-none">Pay<span className="text-[#002970]">tm</span></span>
      </div>
    ),
  },
  {
    id: "gpay",
    name: "Google Pay",
    popular: false,
    accentColor: "#4285f4",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-gray-200 shadow-md">
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      </div>
    ),
  },
  {
    id: "cred",
    name: "Cred",
    popular: false,
    accentColor: "#ffffff",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-[#0f1015] flex items-center justify-center border border-gray-700 shadow-md">
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    ),
  },
  {
    id: "bhim",
    name: "BHIM",
    popular: false,
    accentColor: "#2a8703",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-gray-200 shadow-md">
        <div className="w-8 h-8 flex flex-col items-center justify-center">
          <div className="w-6 h-1.5 bg-[#FF9933] rounded-t-sm"></div>
          <div className="w-6 h-1.5 bg-white border-y border-gray-200 flex items-center justify-center">
            <span className="text-[7px] font-bold text-[#000080]">BHIM</span>
          </div>
          <div className="w-6 h-1.5 bg-[#138808] rounded-b-sm"></div>
        </div>
      </div>
    ),
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    popular: false,
    accentColor: "#ff9900",
    icon: (
      <div className="w-12 h-12 rounded-2xl bg-[#232f3e] flex items-center justify-center border border-gray-700 shadow-md">
        <span className="text-[#ff9900] font-black text-xs tracking-tight">amazon<span className="text-white text-[10px] block font-semibold -mt-1">pay</span></span>
      </div>
    ),
  },
];

const LandingPage = () => {
  // Ensure mobile-friendly viewport, clean native momentum scroll, and reset desktop overrides
  useLayoutEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewportMeta?.getAttribute("content") || "";
    const originalBodyMinWidth = document.body.style.minWidth;
    const originalBodyPaddingBottom = document.body.style.paddingBottom;

    if (viewportMeta) {
      viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    }
    document.body.style.minWidth = "0px";
    document.body.style.paddingBottom = "0px"; // Override global 100px bottom padding on body from index.css
    document.documentElement.style.scrollBehavior = "smooth";

    // Clean up any overflow lock from documentElement so native mobile momentum scrolling works
    document.documentElement.style.overflowX = "";
    document.body.style.overflowX = "";

    return () => {
      if (viewportMeta && originalViewport) {
        viewportMeta.setAttribute("content", originalViewport);
      }
      document.body.style.minWidth = originalBodyMinWidth;
      document.body.style.paddingBottom = originalBodyPaddingBottom;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { deviceType, redirectToStore, storeUrls } = useAppStoreRedirect();

  const baseParams = useGA4BaseParams("Landing Page 1");
  const { trackEvent } = useGA4Tracker(baseParams);
  const hasTrackedPaymentDoneRef = useRef(false);

  // Screen flow: 'landing' (Step 1) | 'payment_gateway' (Step 2)
  const [currentStep, setCurrentStep] = useState(
    searchParams.get("step") === "payment" ? "payment_gateway" : "landing"
  );

  // Plan state
  const [selectedPlanId, setSelectedPlanId] = useState("yearly"); // 'yearly' | 'quarterly'
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_subscription_plans");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Auth & OTP state
  const [mobile, setMobile] = useState(getMobileNoFromLS() || "");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Payment process state (Step 3: Image 3 modal)
  const [showPaymentProcess, setShowPaymentProcess] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [paymentInitiating, setPaymentInitiating] = useState(false);

  // Status & Download modal state (Step 4)
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentAuthLink, setCurrentAuthLink] = useState("");
  const [universalUpiLink, setUniversalUpiLink] = useState("");
  const [payIntentDebug, setPayIntentDebug] = useState(null);

  const cashfreeRef = useRef(null);
  const pollingRef = useRef(null);

  // Initialize Cashfree SDK
  useEffect(() => {
    let isMounted = true;
    const initSDK = async () => {
      try {
        cashfreeRef.current = await load({
          mode: "production",
        });
      } catch (err) {
        console.error("Failed to load Cashfree SDK:", err);
      }
    };
    initSDK();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch backend subscription plans (also exposed so we can re-call after login)
  const fetchPlans = async () => {
    try {
      const response = await subscriptionApis.getSubscriptionPlans();
      console.log("[Plans] Raw response from API:", JSON.stringify(response));
      if (response?.plans && response.plans.length > 0) {
        console.log("[Plans] Loaded", response.plans.length, "plans:", response.plans.map(p => ({ _id: p._id || p.id, name: p.name, price: p.price, duration: p.duration })));
        const sorted = response.plans.sort((a, b) => b.price - a.price);
        setPlans(sorted);
        try {
          localStorage.setItem("cached_subscription_plans", JSON.stringify(sorted));
        } catch (e) {}
      } else {
        console.warn("[Plans] No plans returned from API — plans array will be empty");
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Single-shot status verification check (checks Cashfree status + profile status)
  const checkStatusOnce = async (subId) => {
    const idToCheck =
      subId ||
      searchParams.get("subscription_id") ||
      localStorage.getItem("cashfreeSubscriptionId");
    if (!idToCheck) return null;

    setPaymentStatusLoading(true);
    try {
      const response = await paymentApis.getSubscriptionStatus(idToCheck);
      const status = (
        response?.data?.status ||
        response?.data?.subscription_status ||
        response?.status ||
        response?.subscription_status ||
        ""
      ).toUpperCase();

      if (status) {
        localStorage.setItem("cashfreeSubscriptionStatus", status);
        setPaymentStatus(status);
      }

      if (SUBSCRIPTION_SUCCESS_STATUSES.includes(status)) {
        setSubscriptionStatusInLS("true");
        trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_SUCCESSFUL, {
          subscriptionId: idToCheck,
          status,
          mobileNumber: getMobileNoFromLS() || mobile,
        });
        if (!hasTrackedPaymentDoneRef.current) {
          hasTrackedPaymentDoneRef.current = true;
          trackEvent(GA4Events.landingpage1_payment_done, {
            subscription_id: idToCheck,
            status,
            mobile_number: getMobileNoFromLS() || mobile,
            plan_id: selectedPlanId,
            plan_name: activePlanInfo.shortName,
            price: activePlanInfo.price,
          });
        }
        setShowPaymentProcess(false);
        setShowDownloadPopup(true);
        setCurrentStep("landing");
        setPaymentStatusLoading(false);
        return status;
      }

      if (SUBSCRIPTION_FAILURE_STATUSES.includes(status)) {
        setSubscriptionStatusInLS("false");
        trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, {
          subscriptionId: idToCheck,
          status,
          mobileNumber: getMobileNoFromLS() || mobile,
        });
        setShowPaymentProcess(false);
        setShowDownloadPopup(false);
        setCurrentStep("payment_gateway");
        setErrorMessage("Payment cancel ya fail ho gaya. Kripya kisi aur UPI app se try karein.");
        setPaymentStatusLoading(false);
        return status;
      }

      // Secondary check via user profile
      try {
        const profile = await profileApis.getProfile();
        if (profile?.hasActivePlan) {
          setSubscriptionStatusInLS("true");
          localStorage.setItem("cashfreeSubscriptionStatus", "ACTIVE");
          setPaymentStatus("ACTIVE");
          if (!hasTrackedPaymentDoneRef.current) {
            hasTrackedPaymentDoneRef.current = true;
            trackEvent(GA4Events.landingpage1_payment_done, {
              subscription_id: idToCheck,
              status: "ACTIVE",
              mobile_number: getMobileNoFromLS() || mobile,
              plan_id: selectedPlanId,
              plan_name: activePlanInfo.shortName,
              price: activePlanInfo.price,
            });
          }
          setShowPaymentProcess(false);
          setShowDownloadPopup(true);
          setCurrentStep("landing");
          setPaymentStatusLoading(false);
          return "ACTIVE";
        }
      } catch (profErr) {
        console.warn("Profile check fallback error:", profErr?.message);
      }

      setPaymentStatusLoading(false);
      return status;
    } catch (err) {
      console.error("Error checking subscription status:", err);
      setPaymentStatusLoading(false);
      return null;
    }
  };

  // Continuous status polling loop
  const pollSubscriptionStatus = async (subId) => {
    const id = subId || searchParams.get("subscription_id") || localStorage.getItem("cashfreeSubscriptionId");
    if (!id) return;

    for (let attempt = 0; attempt < 16; attempt += 1) {
      if (attempt > 0) await delay(3000);
      const current = await checkStatusOnce(id);
      if (SUBSCRIPTION_SUCCESS_STATUSES.includes(current) || SUBSCRIPTION_FAILURE_STATUSES.includes(current)) {
        break;
      }
    }
  };

  // Handle return redirect from Cashfree with subscription_id in URL
  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");
    const cfStatus = searchParams.get("cf_status") || searchParams.get("payment_status");

    if (subscriptionId) {
      localStorage.setItem("cashfreeSubscriptionId", subscriptionId);
      const initialStatus = (cfStatus || localStorage.getItem("cashfreeSubscriptionStatus") || "PENDING").toUpperCase();
      setPaymentStatus(initialStatus);

      // Only redirect to website & show popup if confirmed successful
      if (SUBSCRIPTION_SUCCESS_STATUSES.includes(initialStatus)) {
        if (!hasTrackedPaymentDoneRef.current) {
          hasTrackedPaymentDoneRef.current = true;
          trackEvent(GA4Events.landingpage1_payment_done, {
            subscription_id: subscriptionId,
            status: initialStatus,
            mobile_number: getMobileNoFromLS() || mobile,
            plan_id: selectedPlanId,
            plan_name: activePlanInfo.shortName,
            price: activePlanInfo.price,
          });
        }
        setShowPaymentProcess(false);
        setShowDownloadPopup(true);
        setCurrentStep("landing");
      } else {
        // Not paid / cancelled / pending: keep user on the UPI apps page
        setShowPaymentProcess(false);
        setShowDownloadPopup(false);
        setCurrentStep("payment_gateway");
      }
      pollSubscriptionStatus(subscriptionId);
    }
  }, [searchParams]);

  // Handle user switching back to browser tab from UPI apps (PhonePe / GPay / Paytm)
  useEffect(() => {
    let returnDebounce = false;

    const handleTabReturn = async () => {
      if (document.visibilityState === "visible") {
        const storedSubId = localStorage.getItem("cashfreeSubscriptionId");
        if (storedSubId && (showPaymentProcess || currentStep === "payment_gateway")) {
          if (returnDebounce) return;
          returnDebounce = true;
          console.log("[AutoPay] User returned to browser tab, checking mandate status for:", storedSubId);

          try {
            // Dismiss the "Processing" modal so user can see the UPI apps grid
            setShowPaymentProcess(false);

            // Verify status directly with backend
            const finalStatus = await checkStatusOnce(storedSubId);
            console.log("[AutoPay] Return check status:", finalStatus);

            if (SUBSCRIPTION_SUCCESS_STATUSES.includes(finalStatus)) {
              // Confirmed paid and autopay mandate active -> redirect to website & show celebration modal
              setShowDownloadPopup(true);
              setCurrentStep("landing");
            } else {
              // Not confirmed paid (user tapped X / cancelled in GPay) -> stay on UPI apps page!
              setShowDownloadPopup(false);
              setCurrentStep("payment_gateway");
              if (SUBSCRIPTION_FAILURE_STATUSES.includes(finalStatus)) {
                setErrorMessage("Payment authorize nahi hua ya cancel kar diya gaya. Kripya dusre UPI app se try karein.");
              }
            }
          } catch (e) {
            console.error("[AutoPay] Error checking status on return:", e);
            setShowDownloadPopup(false);
            setCurrentStep("payment_gateway");
          } finally {
            setTimeout(() => {
              returnDebounce = false;
            }, 1500);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleTabReturn);
    window.addEventListener("focus", handleTabReturn);
    return () => {
      document.removeEventListener("visibilitychange", handleTabReturn);
      window.removeEventListener("focus", handleTabReturn);
    };
  }, [showPaymentProcess, currentStep]);

  // Countdown timer for Payment Process modal
  useEffect(() => {
    let timer;
    if (showPaymentProcess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPaymentProcess, countdown]);

  // OTP resend timer
  useEffect(() => {
    if (!showOtpPopup || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showOtpPopup, timeLeft]);

  // Format countdown into MM : SS
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  // Dynamic plan details resolved from backend plans with resilient fallbacks
  const getDynamicPlan = (type) => {
    const isYearly = type === "yearly";
    const defaultPrice = isYearly ? 501 : 251;
    const defaultOriginal = isYearly ? 699 : 299;
    const defaultDays = isYearly ? 365 : 90;

    const matchedBackend = plans.find((p) =>
      isYearly
        ? p.duration?.toString().toLowerCase().includes("365") ||
          p.duration?.toString().toLowerCase().includes("year") ||
          p.days === 365 ||
          Number(p.price) > 400 ||
          Number(p.price) === 501
        : p.duration?.toString().toLowerCase().includes("90") ||
          p.duration?.toString().toLowerCase().includes("month") ||
          p.days === 90 ||
          Number(p.price) <= 400 ||
          Number(p.price) === 251
    ) || (isYearly ? plans[0] : (plans[1] || plans[0]));

    if (!matchedBackend) {
      return {
        id: type,
        backendId: null,
        name: isYearly ? "1 Year VIP Plan" : "3 Months Plan",
        shortName: isYearly ? "1 YEAR PLAN" : "3 MONTHS PLAN",
        price: defaultPrice,
        originalPrice: defaultOriginal,
        savings: isYearly ? "28% Bachat" : "16% Bachat",
        billingText: isYearly ? `₹${defaultPrice} / 1 Year` : `₹${defaultPrice} / 3 Months`,
        dailyCost: isYearly ? `Sirf ₹1.37 / din` : `Sirf ₹2.78 / din`,
        days: defaultDays,
        features: isYearly
          ? [
            "500+ Vrat Kathayein, Sampoorna Aarti, Chalisa aur Powerful Mantras",
            "100% Ad-Free Premium HD Experience",
            "Daily Panchang, Shubh Muhurat aur Naam Jaap Tracker",
            "Kabhi bhi cancel karein, koi lock-in nahi (Cancel anytime)",
          ]
          : [
            "500+ Vrat Kathayein, Aarti aur Chalisa",
            "100% Ad-Free Experience",
            "Daily Panchang aur Naam Jaap Tracker",
            "Kabhi bhi cancel karein (Cancel anytime)",
          ],
      };
    }

    const price = Number(matchedBackend.finalPrice ?? matchedBackend.offerPrice ?? matchedBackend.price ?? defaultPrice);
    let originalPrice = Number(
      matchedBackend.isOfferActive && matchedBackend.price > price
        ? matchedBackend.price
        : (matchedBackend.originalPrice || defaultOriginal)
    );
    if (originalPrice <= price) {
      originalPrice = Math.round(price * 1.3);
    }

    const savingsPercent = originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : (isYearly ? 28 : 16);

    const days = Number(matchedBackend.days || (matchedBackend.duration?.toString().includes("365") ? 365 : 90) || defaultDays);
    const dailyRate = (price / (days || 1)).toFixed(2);

    return {
      id: type,
      backendId: matchedBackend._id || matchedBackend.id,
      name: matchedBackend.name || matchedBackend.title || (isYearly ? "1 Year VIP Plan" : "3 Months Plan"),
      shortName: isYearly ? "1 YEAR PLAN" : "3 MONTHS PLAN",
      price: price,
      originalPrice: originalPrice,
      savings: `${savingsPercent}% Bachat`,
      billingText: `₹${price} / ${isYearly ? "1 Year" : "3 Months"}`,
      dailyCost: `Sirf ₹${dailyRate} / din`,
      days: days,
      features: isYearly
        ? [
          "500+ Vrat Kathayein, Sampoorna Aarti, Chalisa aur Powerful Mantras",
          "100% Ad-Free Premium HD Experience",
          "Daily Panchang, Shubh Muhurat aur Naam Jaap Tracker",
          "Kabhi bhi cancel karein, koi lock-in nahi (Cancel anytime)",
        ]
        : [
          "500+ Vrat Kathayein, Aarti aur Chalisa",
          "100% Ad-Free Experience",
          "Daily Panchang aur Naam Jaap Tracker",
          "Kabhi bhi cancel karein (Cancel anytime)",
        ],
    };
  };

  const yearlyPlanDetails = getDynamicPlan("yearly");
  const quarterlyPlanDetails = getDynamicPlan("quarterly");
  const activePlanInfo = selectedPlanId === "quarterly" ? quarterlyPlanDetails : yearlyPlanDetails;

  const normalizedPaymentStatus = (paymentStatus || "").toUpperCase();
  const isSubscriptionConfirmed = SUBSCRIPTION_SUCCESS_STATUSES.includes(normalizedPaymentStatus);
  const isSubscriptionFailed = SUBSCRIPTION_FAILURE_STATUSES.includes(normalizedPaymentStatus);

  const handleDownloadApp = async () => {
    const userJwtToken = getTokenFromLS();

    // If logged in, generate auto-login deferred link via AppsFlyer (as in AppEvents2)
    if (userJwtToken) {
      setIsGeneratingLink(true);
      try {
        const token = await createWebLoginToken(userJwtToken);
        const link = `${APPSFLYER_URL}?pid=User_invite&af_click_lookback=30d&c=web_login&deep_link_value=auto_login&deep_link_sub1=${encodeURIComponent(token)}`;
        window.location.href = link;
        return;
      } catch (err) {
        console.error("Error generating app login token:", err);
        // Fallback to AppsFlyer OneLink or store if token generation fails
        window.location.href = APPSFLYER_URL;
        return;
      } finally {
        setIsGeneratingLink(false);
      }
    }

    // Fallback if no user token in localStorage
    if (APPSFLYER_URL) {
      window.location.href = APPSFLYER_URL;
      return;
    }

    if (deviceType === "ios" || deviceType === "android") {
      redirectToStore();
      return;
    }

    window.location.href = storeUrls?.android || "https://play.google.com/store/apps/details?id=com.bhaktibhav.app";
  };

  // Plan click handler: selects plan and triggers verification if needed
  const handlePlanClick = (planType) => {
    setSelectedPlanId(planType);

    // If already logged in with token, transition directly to Payment Gateway (Step 2)
    if (getIsLoggedIn() && getTokenFromLS()) {
      setCurrentStep("payment_gateway");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const cleanMobile = (mobile || getMobileNoFromLS() || "").replace(/\D/g, "");
    if (cleanMobile.length === 10) {
      handleLandingSubmit();
    } else {
      const footerInput = document.getElementById("footer-mobile-input");
      if (footerInput) {
        footerInput.focus();
      } else {
        setShowLoginModal(true);
      }
    }
  };

  // Step 1: Handle Mobile Submit / Continue to Payment Gateway
  const handleLandingSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanMobile = (mobile || getMobileNoFromLS() || "").replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      alert("Kripya 10-digit ka valid mobile number dalein");
      return;
    }

    setMobileNoInLS(cleanMobile);

    trackEvent(GA4Events.landingpage1_number_input, {
      mobile_number: cleanMobile,
      plan_id: selectedPlanId,
      plan_name: activePlanInfo.shortName,
      price: activePlanInfo.price,
    });

    // If already logged in with token, transition directly to Payment Gateway (Step 2)
    if (getIsLoggedIn() && getTokenFromLS()) {
      setShowLoginModal(false);
      setCurrentStep("payment_gateway");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Otherwise, generate OTP
    setLoginLoading(true);
    try {
      const response = await loginApis.generateOtp(cleanMobile, getOrCreateDeviceId(), getUserIdFromLS());
      if (response?.userId) setUserIdInLS(response.userId);

      if (response?.success) {
        setShowLoginModal(false);
        setShowOtpPopup(true);
        setTimeLeft(30);
        setOtp(["", "", "", ""]);
      } else {
        alert(response?.message || "OTP bhejne me problem aayi, kripya dobara try karein");
      }
    } catch (err) {
      console.error("Error generating OTP:", err);
      alert("OTP bhejne me problem aayi, kripya dobara try karein.");
    } finally {
      setLoginLoading(false);
    }
  };

  // OTP Change & backspace handlers
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      document.getElementById(`landing-otp-${index + 1}`)?.focus();
    }

    if (value && updated.every((d) => d !== "")) {
      setTimeout(() => document.getElementById("landing-verify-btn")?.click(), 100);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`landing-otp-${index - 1}`)?.focus();
    }
  };

  // Step 1 -> Step 2: Verify OTP
  const handleOtpVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      alert("Kripya 4-digit ka valid OTP enter karein");
      return;
    }

    setOtpLoading(true);
    try {
      const cleanMobile = getMobileNoFromLS() || mobile;
      const data = await loginApis.verifyOtp({ mobile: cleanMobile, otp: otpCode });

      if (data?.token) {
        setTokenInLS(data.token);
        setIsLoggedIn();
        if (data?.userId || data?.user?._id) setUserIdInLS(data.userId || data.user._id);

        trackEvent(GA4Events.landingpage1_otp_verification, {
          mobile_number: cleanMobile,
          user_id: data?.userId || data?.user?._id || getUserIdFromLS(),
          status: "success",
          plan_id: selectedPlanId,
          plan_name: activePlanInfo.shortName,
        });

        // Re-fetch plans now that we have a valid token (/subscriptions requires auth)
        fetchPlans();

        setShowOtpPopup(false);
        setShowLoginModal(false);
        setCurrentStep("payment_gateway");
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (pendingUpiApp) {
          const targetApp = pendingUpiApp;
          setPendingUpiApp(null);
          setTimeout(() => handleUpiAppSelect(targetApp), 600); // slight delay to let plans load
        }
      } else {
        alert(data?.message || "OTP verify nahi ho saka, kripya dobara try karein");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert(err?.response?.data?.message || "Invalid OTP, kripya dobara try karein");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanMobile = getMobileNoFromLS() || mobile;
    if (!cleanMobile) return;
    setTimeLeft(30);
    try {
      await loginApis.generateOtp(cleanMobile, getOrCreateDeviceId(), getUserIdFromLS());
    } catch (err) {
      console.error("Error resending OTP:", err);
    }
  };

  const [pendingUpiApp, setPendingUpiApp] = useState(null);

  // UPI App ID → Cashfree androidAuthAppLinks key
  const APP_KEY_MAP = {
    phonepe: "PHONEPE",
    gpay: "GPAY",
    paytm: "PAYTM",
    cred: "CRED",
    bhim: "BHIM",
    amazonpay: "AMAZONPAY",
  };

  // Build subscription creation payload
  const buildSubscriptionPayload = (planId, billingProfile, cashfreeReturnUrl, frontendReturnUrl) => ({
    planId,
    name: billingProfile.name,
    phone: billingProfile.phone,
    email: billingProfile.email,
    source: "web",
    couponCode: "",
    paymentMethod: "upi",
    authorization_details: {
      payment_methods: ["upi"],
    },
    returnUrl: cashfreeReturnUrl,
    return_url: cashfreeReturnUrl,
    frontendReturnUrl,
  });

  // Step 2 → Step 3: Handle UPI App Tap
  const handleUpiAppSelect = async (app) => {
    trackEvent(GA4Events.landingpage1_upi_choosed, {
      upi_app: app.name,
      upi_app_id: app.id,
      plan_id: selectedPlanId,
      plan_name: activePlanInfo.shortName,
      price: activePlanInfo.price,
      mobile_number: getMobileNoFromLS() || mobile,
    });

    // 1. If not logged in → save chosen app, trigger OTP flow
    const token = getTokenFromLS();
    if (!token) {
      setPendingUpiApp(app);
      const savedMobile = getMobileNoFromLS() || mobile;
      if (!savedMobile || savedMobile.length !== 10) {
        setCurrentStep("landing");
        alert("Kripya aage badhne ke liye pehle apna 10-digit mobile number enter karein");
        return;
      }
      setLoginLoading(true);
      try {
        const res = await loginApis.generateOtp(savedMobile, getOrCreateDeviceId(), getUserIdFromLS());
        if (res?.userId) setUserIdInLS(res.userId);
        setShowOtpPopup(true);
        setTimeLeft(30);
      } catch (e) {
        console.error("OTP send failed:", e);
        alert("OTP bhejne me problem aayi. Kripya punah koshish karein.");
      } finally {
        setLoginLoading(false);
      }
      return;
    }

    // 2. Show the "Processing" bottom sheet immediately so user sees feedback
    setSelectedUpiApp(app);
    setShowPaymentProcess(true);
    setCountdown(COUNTDOWN_SECONDS);
    setPaymentInitiating(true);
    setErrorMessage("");
    setCurrentAuthLink("");
    setUniversalUpiLink("");

    try {
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_INITIATED, {
        upiApp: app.name,
        plan: activePlanInfo.shortName,
        price: activePlanInfo.price,
        mobileNumber: getMobileNoFromLS() || mobile,
      });

      // 3. Resolve plan ID
      // If plans weren't loaded yet (e.g. user wasn't logged in at mount), try fetching now
      let activePlans = plans;
      if (!activePlans || activePlans.length === 0) {
        console.warn("[Plans] Plans not loaded yet, attempting to fetch now...");
        try {
          const response = await subscriptionApis.getSubscriptionPlans();
          console.log("[Plans] Fetched on-demand:", JSON.stringify(response));
          if (response?.plans && response.plans.length > 0) {
            activePlans = response.plans.sort((a, b) => b.price - a.price);
            setPlans(activePlans);
          }
        } catch (e) {
          console.error("[Plans] Failed to fetch plans on-demand:", e);
        }
      }

      if (!activePlans || activePlans.length === 0) {
        setErrorMessage("Subscription plans load nahi ho sake. Kripya page refresh karein.");
        setShowPaymentProcess(false);
        setPaymentInitiating(false);
        return;
      }

      const matchedPlan = activePlanInfo.backendId
        ? activePlans.find((p) => (p._id || p.id) === activePlanInfo.backendId)
        : activePlans.find((p) =>
            selectedPlanId === "yearly"
              ? p.duration?.toString().toLowerCase().includes("365") || p.duration?.toString().toLowerCase().includes("year") || p.days === 365 || Number(p.price) > 400 || Number(p.price) === activePlanInfo.price
              : p.duration?.toString().toLowerCase().includes("90") || p.duration?.toString().toLowerCase().includes("month") || p.days === 90 || Number(p.price) <= 400 || Number(p.price) === activePlanInfo.price
          ) || activePlans[0];

      const planId = matchedPlan?._id || matchedPlan?.id;
      console.log("[Plans] Using planId:", planId, "| matched plan:", matchedPlan?.name, "price:", matchedPlan?.price);

      if (!planId) {
        setErrorMessage("Subscription plan ID nahi mila. Kripya page refresh karein.");
        setShowPaymentProcess(false);
        setPaymentInitiating(false);
        return;
      }
      const userPhone = getMobileNoFromLS() || mobile || "9876543210";

      let profileData = {};
      try {
        profileData = await profileApis.getProfile();
      } catch (e) {
        console.warn("Unable to fetch profile, using defaults:", e);
      }

      const billingProfile = {
        name: profileData?.name || "Bhakti Bhav Devotee",
        email: profileData?.email || `${userPhone}@bhaktibhav.app`,
        phone: profileData?.mobileNumber || userPhone,
      };

      // Cashfree strictly requires HTTPS return URLs — localhost, LAN IP (192.168.x.x), or any non-HTTPS origin will be rejected with 403.
      // Always fallback to production domain unless running on a valid HTTPS origin.
      const safeOrigin = window.location.origin.startsWith("https://")
        ? window.location.origin
        : "https://bhaktibhav.app";
      const frontendReturnUrl = `${safeOrigin}/landing-page?subscription_id={subscription_id}`;
      const cashfreeReturnUrl = buildCashfreeReturnUrl(frontendReturnUrl);

      // ------------------------------------------------------------------
      // 4. STRATEGY A & B: Send payload to POST /cashfree/subscription/pay-intent
      //    Payload: { planId, upiApp, name, phone, email, returnUrl, couponCode, source }
      //    Strategy A: Direct deep link via intentLink / androidAuthAppLinks / iosAuthAppLinks
      //    Strategy B: Fallback to Cashfree SDK subscriptionsCheckout via subscriptionSessionId
      // ------------------------------------------------------------------
      const appKey = APP_KEY_MAP[app.id.toLowerCase()] || app.id.toUpperCase();
      const cleanPhone = (billingProfile.phone || userPhone || "").replace(/\D/g, "").slice(-10);
      let usedDirectIntent = false;

      try {
        const payIntentPayload = {
          planId,
          upiApp: appKey,
          name: billingProfile.name || "Bhakti Bhav Devotee",
          phone: cleanPhone,
          email: billingProfile.email || `${cleanPhone}@bhaktibhav.app`,
          returnUrl: cashfreeReturnUrl,
          return_url: cashfreeReturnUrl,
          frontendReturnUrl,
          couponCode: "",
          source: "web",
        };

        console.log("Calling POST /cashfree/subscription/pay-intent with payload:", payIntentPayload);
        const res = await paymentApis.subscriptionPayIntent(payIntentPayload);
        console.log("Pay-intent response:", res);
        setPayIntentDebug(res);

        if (res?.success && res?.data) {
          const intentData = res.data;
          const subId = intentData.subscriptionId || intentData.subscription_id || "";
          if (subId) {
            localStorage.setItem("cashfreeSubscriptionId", subId);
            localStorage.setItem("cashfreeSubscriptionStatus", "PENDING");
          }

          // Helper to verify if a link is a real native UPI deep link (not a web page)
          const isNativeUpiLink = (url) => {
            if (!url || typeof url !== "string") return false;
            const u = url.trim().toLowerCase();
            return (
              u.startsWith("upi://") ||
              u.startsWith("intent://") ||
              u.startsWith("gpay://") ||
              u.startsWith("phonepe://") ||
              u.startsWith("paytmmp://") ||
              u.startsWith("bhim://") ||
              u.startsWith("tez://")
            );
          };

          // Android package mapping for direct app targeting
          const ANDROID_PACKAGES = {
            gpay: "com.google.android.apps.nbu.paisa.user",
            phonepe: "com.phonepe.app",
            paytm: "net.one97.paytm",
            bhim: "in.org.npci.upiapp",
            cred: "com.dreamplug.androidapp",
          };

          // App-specific proprietary schemes that cannot be intercepted by other apps (like WhatsApp)
          const buildAppSpecificScheme = (rawUrl, appId) => {
            if (!rawUrl || typeof rawUrl !== "string") return "";
            const cleanUrl = rawUrl.trim();
            const query = cleanUrl.replace(/^[^?]*\??/i, "").replace(/#Intent.*$/i, "");
            if (!query) return "";
            const id = (appId || "").toLowerCase();

            if (id === "gpay") {
              // On iOS: Google Pay registers gpay:// and tez://. WhatsApp CANNOT intercept gpay://!
              // On Android: tez:// and gpay:// directly open Google Pay.
              return isIOS ? `gpay://upi/mandate?${query}` : `tez://upi/mandate?${query}`;
            }
            if (id === "phonepe") {
              return `phonepe://upi/mandate?${query}`;
            }
            if (id === "paytm") {
              return `paytmmp://upi/mandate?${query}`;
            }
            return "";
          };

          const buildAndroidPackageIntent = (upiUrl, appId) => {
            if (!upiUrl || typeof upiUrl !== "string") return "";
            const trimmed = upiUrl.trim();
            const query = trimmed.replace(/^[^?]*\??/i, "").replace(/#Intent.*$/i, "");
            const host = trimmed.match(/^(?:upi|intent):\/\/([^/?]+)/i)?.[1] || "mandate";
            const pkg = ANDROID_PACKAGES[(appId || "").toLowerCase()];
            if (pkg) {
              return `intent://${host}?${query}#Intent;scheme=upi;action=android.intent.action.VIEW;package=${pkg};end;`;
            }
            return trimmed;
          };

          // Helper to extract app deep link with case-insensitive / normalized lookup
          const extractDeepLink = (linksObj, key) => {
            if (!linksObj || typeof linksObj !== "object") return "";
            if (linksObj[key]) return linksObj[key];
            const target = (key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            for (const [k, v] of Object.entries(linksObj)) {
              if (typeof v === "string" && v) {
                const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleanK === target || cleanK.includes(target) || target.includes(cleanK)) {
                  return v;
                }
              }
            }
            return "";
          };

          // Extract deep links from direct keys or nested Cashfree upiIntentData structures
          const androidLinks =
            intentData.androidAuthAppLinks ||
            intentData.data?.payload?.upiIntentData?.androidAuthAppLinks ||
            intentData.payload?.upiIntentData?.androidAuthAppLinks ||
            {};
          const iosLinks =
            intentData.iosAuthAppLinks ||
            intentData.data?.payload?.upiIntentData?.iosAuthAppLinks ||
            intentData.payload?.upiIntentData?.iosAuthAppLinks ||
            {};

          // Detect iOS vs Android to choose correct deep link scheme
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
          const platformLinks = isIOS ? iosLinks : androidLinks;
          const fallbackPlatformLinks = isIOS ? androidLinks : iosLinks;

          // Priority 1: Exact app link (e.g. GPAY, PHONEPE)
          let candidateLink =
            extractDeepLink(platformLinks, appKey) ||
            extractDeepLink(fallbackPlatformLinks, appKey) ||
            "";

          // Priority 2: Universal DEFAULT UPI mandate link (e.g. upi://mandate?...)
          if (!candidateLink) {
            candidateLink =
              extractDeepLink(platformLinks, "DEFAULT") ||
              extractDeepLink(platformLinks, "default") ||
              extractDeepLink(fallbackPlatformLinks, "DEFAULT") ||
              "";
          }

          // Priority 3: Direct intentLink OR qrData ONLY IF it's a real native UPI link (NOT a Cashfree web link)
          const rawMandateLink =
            intentData.intentLink ||
            intentData.qrData ||
            intentData.data?.payload?.qrData ||
            intentData.payload?.qrData ||
            intentData._debug_rawCashfreeResponse?.data?.payload?.qrData ||
            "";
          if (!candidateLink && isNativeUpiLink(rawMandateLink)) {
            candidateLink = rawMandateLink;
          }

          // Extract universal DEFAULT upi://mandate link if present
          const universalMandate =
            androidLinks["DEFAULT"] ||
            androidLinks["default"] ||
            iosLinks["DEFAULT"] ||
            (rawMandateLink && rawMandateLink.startsWith("upi://") ? rawMandateLink : "") ||
            "";
          if (universalMandate) {
            setUniversalUpiLink(universalMandate);
          }

          // App-specific scheme (e.g. tez:// for GPay) to guarantee opening the exact app and bypass WhatsApp
          const appScheme = buildAppSpecificScheme(rawMandateLink || universalMandate || candidateLink, app.id);
          const packageIntent = !isIOS ? buildAndroidPackageIntent(rawMandateLink || universalMandate || candidateLink, app.id) : "";

          // Priority: 1. tez:// (WhatsApp CANNOT intercept) 2. Package Intent with action=VIEW 3. Candidate link 4. Universal mandate
          const directLink =
            appScheme ||
            (isNativeUpiLink(packageIntent) ? packageIntent : "") ||
            (isNativeUpiLink(candidateLink) ? candidateLink : "") ||
            (isNativeUpiLink(universalMandate) ? universalMandate : "");

          // Strategy A: Direct UPI App Deep Link
          if (directLink) {
            console.log("Strategy A: Direct native UPI deep link found for", app.name, ":", directLink);
            usedDirectIntent = true;
            setCurrentAuthLink(directLink);
            setPaymentInitiating(false);

            // 1. Programmatic click on hidden anchor tag (bypasses some browser async restrictions)
            try {
              const hiddenA = document.createElement("a");
              hiddenA.href = directLink;
              hiddenA.rel = "noopener noreferrer";
              document.body.appendChild(hiddenA);
              hiddenA.click();
              document.body.removeChild(hiddenA);
            } catch (clickErr) {
              console.warn("Direct intent programmatic click caught:", clickErr);
            }

            // 2. Programmatic redirect fallback
            try {
              window.location.href = directLink;
            } catch (err) {
              console.warn("Direct intent redirect attempt caught:", err);
            }
            return;
          }

          // Strategy B: Intent unavailable fallback -> Cashfree SDK subscriptionsCheckout
          const subSessionId = intentData.subscriptionSessionId;
          if (subSessionId) {
            console.log("Strategy B: Intent unavailable, falling back to Cashfree SDK checkout with sessionId:", subSessionId);
            localStorage.setItem("cashfreeSubscriptionSessionId", subSessionId);

            if (cashfreeRef.current) {
              const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              const checkoutResult = await cashfreeRef.current.subscriptionsCheckout({
                subsSessionId: subSessionId,
                redirectTarget: isMobile ? "_self" : "_modal",
              });
              if (checkoutResult?.error) {
                setErrorMessage(checkoutResult.error?.message || "Mandate authorization was cancelled");
                localStorage.setItem("cashfreeSubscriptionStatus", "AUTHORIZATION_CANCELLED");
              }
            } else {
              setErrorMessage("Cashfree SDK load nahi ho saka. Kripya page refresh karein.");
            }
            return;
          }

          // No link or session ID provided
          setErrorMessage(intentData.error || "Payment link prapt nahi hua. Kripya punah koshish karein.");
          setShowPaymentProcess(false);
          return;
        } else if (res && res.success === false) {
          // Backend returned an error (e.g. 403, endpoint not yet deployed, etc.)
          console.warn("Pay intent endpoint returned error, falling back to legacy flow:", res.message);
          // Fall through below to createSubscription fallback
        }
      } catch (intentErr) {
        console.warn("Direct intent API call failed or not yet deployed, trying legacy fallback:", intentErr?.message);
      }

      // ------------------------------------------------------------------
      // Fallback: If pay-intent failed to execute or route not yet deployed,
      // try legacy createSubscription endpoint
      // ------------------------------------------------------------------
      if (!usedDirectIntent) {
        const subscriptionPayload = buildSubscriptionPayload(planId, billingProfile, cashfreeReturnUrl, frontendReturnUrl);
        console.log("Fallback: creating subscription session with payload:", subscriptionPayload);
        const res = await paymentApis.createSubscription(subscriptionPayload);
        console.log("Subscription create response:", res);

        if (res?.success) {
          const subData = res?.data || {};
          const subscriptionId = subData.subscriptionId || subData.cashfree?.order_id || "";
          const subscriptionSessionId = subData.subscriptionSessionId || subData.cashfree?.subscription_session_id;
          const authLink = subData.auth_link || subData.subscription_link || subData.cashfree?.auth_link || "";

          localStorage.setItem("cashfreeSubscriptionId", subscriptionId);
          localStorage.setItem("cashfreeSubscriptionSessionId", subscriptionSessionId || "");
          localStorage.setItem("cashfreeSubscriptionStatus", "PENDING");
          setCurrentAuthLink(authLink);

          if (subscriptionSessionId && cashfreeRef.current) {
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const checkoutResult = await cashfreeRef.current.subscriptionsCheckout({
              subsSessionId: subscriptionSessionId,
              redirectTarget: isMobile ? "_self" : "_modal",
            });
            if (checkoutResult?.error) {
              setErrorMessage(checkoutResult.error?.message || "Mandate authorization was cancelled");
              localStorage.setItem("cashfreeSubscriptionStatus", "AUTHORIZATION_CANCELLED");
            }
          } else if (authLink) {
            window.location.href = authLink;
          }
        } else {
          setErrorMessage(res?.message || "Payment session shuru nahi ho paya. Kripya punah koshish karein.");
          setShowPaymentProcess(false);
        }
      }
    } catch (err) {
      console.error("Error in payment flow:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Network issue. Kripya punah prayas karein.";
      setErrorMessage(errMsg);
      setShowPaymentProcess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-sans text-gray-800">
      <style>{`
        * {
          letter-spacing: normal !important;
        }
      `}</style>

      {/* =========================================================================
          STEP 2: BHAKTI BHAV THEMED PAYMENT GATEWAY SCREEN
         ========================================================================= */}
      {currentStep === "payment_gateway" && (
        <div className="min-h-screen bg-[#FFF8F0] flex flex-col relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

          {/* ── Top Nav ── */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3">
            <button
              type="button"
              onClick={() => setCurrentStep("landing")}
              className="w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center text-gray-600 hover:text-[#9A283D] active:scale-95 shadow-sm transition cursor-pointer"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🪔</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] to-[#e64a66]">Bhakti Bhav</span>
            </div>
            <div className="w-10" />
          </div>

          {/* ── Scrollable Content ── */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-6 w-full max-w-md mx-auto">

            {/* Badge + Title */}
            <div className="text-center mt-1 mb-5">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#9A283D] bg-orange-100 border border-orange-200/70 px-3 py-1 rounded-full mb-2">
                ✨ Aakhri Kadam — Sirf 30 Second
              </span>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                Apna UPI App Chunein
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">Seedha app open hoga, mandate approve karo — ho gaya!</p>
            </div>

            {/* ── Plan Summary Pill ── */}
            <div className="flex items-center justify-between bg-white border-2 border-orange-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{activePlanInfo.name}</p>
                <p className="text-lg font-black text-[#9A283D]">₹{activePlanInfo.price} <span className="text-xs text-gray-400 line-through font-semibold">₹{activePlanInfo.originalPrice}</span></p>
                <p className="text-[10px] text-gray-500 font-medium">{activePlanInfo.dailyCost}</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                  {activePlanInfo.savings}
                </span>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Cancel anytime</p>
              </div>
            </div>

            {/* ── UPI Apps Header ── */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📱</span>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">UPI se Pay Karein</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
            </div>

            {/* ── UPI App Grid: 3 columns ── */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {UPI_APPS.slice(0, 3).map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleUpiAppSelect(app)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 bg-white rounded-2xl border-2 py-4 px-2 cursor-pointer transition-all duration-150 active:scale-95 shadow-sm ${app.popular
                    ? "border-emerald-400 shadow-emerald-100"
                    : "border-gray-200 hover:border-orange-300"
                    }`}
                >
                  {app.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                      POPULAR
                    </span>
                  )}
                  <div className="text-2xl mt-1">{app.icon}</div>
                  <span className="text-[10px] font-extrabold text-gray-700 text-center leading-tight">{app.name}</span>
                </button>
              ))}
            </div>

            {/* ── Second row: 2 apps centered ── */}
            <div className="grid grid-cols-2 gap-3 max-w-[14rem] mx-auto mb-3">
              {UPI_APPS.slice(3, 5).map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleUpiAppSelect(app)}
                  className="flex flex-col items-center justify-center gap-1.5 bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-300 py-4 px-2 cursor-pointer transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <div className="text-2xl">{app.icon}</div>
                  <span className="text-[10px] font-extrabold text-gray-700 text-center">{app.name}</span>
                </button>
              ))}
            </div>

            {/* ── Other apps link ── */}
            {UPI_APPS[5] && (
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => handleUpiAppSelect(UPI_APPS[5])}
                  className="text-[11px] font-bold text-[#9A283D] hover:underline transition cursor-pointer"
                >
                  + Amazon Pay ya koi aur app →
                </button>
              </div>
            )}

            {/* ── Error ── */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* ── What happens next ── */}
            <div className="bg-white border border-orange-100 rounded-2xl p-4 mb-5 space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1">Aage Kya Hoga?</p>
              {[
                { icon: "📲", text: "Aapka UPI app seedha khulega" },
                { icon: "✅", text: "Mandate approve karein (ek baar)" },
                { icon: "🪔", text: "Bhakti Bhav Premium turant active!" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-base shrink-0">{step.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{step.text}</span>
                </div>
              ))}
            </div>

            {/* ── Security footer ── */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm mb-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                256-bit Secure · NPCI Verified
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Auto-renews at {activePlanInfo.billingText} · Cancel anytime</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: MAIN LANDING PAGE VIEW (Devotional Mobile-First, AppEvents1 Style)
         ========================================================================= */}
      {currentStep === "landing" && (
        <div className="min-h-screen w-full flex flex-col bg-[#FFF8F0] overflow-x-hidden">
          <style>{`
            html {
              scroll-behavior: smooth !important;
            }
            #plans {
              scroll-margin-top: 65px;
            }
            .landing-scroll-body {
              padding-bottom: 220px;
              -webkit-overflow-scrolling: touch;
            }
            @media (min-width: 640px) {
              .landing-scroll-body {
                padding-bottom: 200px;
              }
            }
          `}</style>

          {/* ── STICKY TOP BRAND BAR ── */}
          <div className="fixed top-0 left-0 right-0 z-30 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-orange-200/60 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪔</span>
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] to-[#e64a66]">
                  Bhakti Bhav
                </span>
                <span className="hidden sm:inline-block text-[11px] text-gray-500 font-bold ml-1 border-l border-gray-300 pl-2">
                  हर दिन भक्ति, हर कदम शांति
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  50K+ Active
                </span>
              </div>
            </div>
          </div>

          <div className="landing-scroll-body flex flex-col">

            {/* ═══ 1. HERO SECTION ═══ */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E6] to-[#FFF8F0] px-4 pt-16 pb-6">
              {/* Background ambient sacred glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-52 h-52 bg-amber-200/35 rounded-full blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

              <div className="relative z-10 max-w-lg mx-auto">
                {/* Devotional Badge Pill */}
                <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100/90 to-amber-100/90 text-orange-900 text-xs px-3.5 py-1.5 rounded-full font-bold border border-orange-200 shadow-sm">
                    <span className="text-orange-600 text-sm animate-pulse">❖</span>
                    <span>आपकी आध्यात्मिक यात्रा का साथी</span>
                  </div>
                </div>

                {/* Hero Content: Headline + App Mockup */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <h1 className="text-[1.65rem] sm:text-3xl leading-[1.2] font-black text-gray-900 tracking-tight">
                      हर व्रत, पूजा और त्योहार की{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] via-[#C13452] to-[#e64a66]">
                        पूरी जानकारी
                      </span>{" "}
                      एक ही जगह 🪔
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                      दैनिक पंचांग · 500+ व्रत कथाएं · 108 नाम जाप · आरती व चालीसा
                    </p>
                    <a
                      href="#plans"
                      className="mt-3.5 inline-flex items-center gap-2 bg-gradient-to-r from-[#9A283D] to-[#7a1f30] text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-full shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                    >
                      <span>अपनी यात्रा शुरू करें</span>
                      <span className="text-sm">→</span>
                    </a>
                  </div>

                  {/* Phone Mockup */}
                  <div className="flex-none w-[115px] sm:w-[130px]">
                    <div className="relative rounded-[1.8rem] border-[6px] border-gray-900 bg-white overflow-hidden shadow-2xl aspect-[9/19.5]">
                      <img
                        src="/app-mockup.png"
                        alt="Bhakti Bhav App"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Proof & Trust Stats Bar */}
                <div className="grid grid-cols-3 divide-x divide-orange-200/80 bg-white/90 border border-orange-100 rounded-2xl p-2.5 shadow-sm backdrop-blur-sm text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-[#9A283D]">👥 50K+</span>
                    <span className="text-[9px] text-gray-600 font-bold mt-0.5">भक्तों का विश्वास</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-orange-600">🛡️ 100%</span>
                    <span className="text-[9px] text-gray-600 font-bold mt-0.5">सुरक्षित भुगतान</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-amber-500">⭐ 4.8/5</span>
                    <span className="text-[9px] text-gray-600 font-bold mt-0.5">Play Store</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ 2. SACRED FEATURES STRIP ═══ */}
            <section className="bg-white border-y border-orange-100/80 shadow-sm px-4 py-4">
              <div className="max-w-lg mx-auto flex items-stretch justify-between gap-1.5">
                {[
                  { icon: "📅", title: "पंचांग", sub: "दैनिक" },
                  { icon: "🏺", title: "व्रत", sub: "त्योहार" },
                  { icon: "📿", title: "नाम जाप", sub: "108 माला" },
                  { icon: "🪔", title: "आरती", sub: "चालीसा" },
                  { icon: "📖", title: "कथाएं", sub: "प्रामाणिक" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-orange-50/50 border border-orange-100/70 shadow-xs"
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-[10px] font-black text-gray-800 leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[8px] font-medium text-gray-500">
                      {item.sub}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ 3. VIP MEMBERSHIP PLANS ═══ */}
            <section id="plans" className="bg-[#FFF8F0] px-4 py-6">
              <div className="max-w-lg mx-auto">
                <h2 className="text-center text-lg sm:text-xl font-black text-[#9A283D] mb-5">
                  अपने लिए सही प्लान चुनें
                </h2>

                <div className="flex gap-3">
                  {/* Plan 1: 3 Months */}
                  <div
                    onClick={() => handlePlanClick("quarterly")}
                    className={"relative flex-1 cursor-pointer rounded-2xl p-3 text-center transition-all " + (
                      selectedPlanId === "quarterly"
                        ? "border-2 border-[#9A283D] bg-red-50/40 shadow-sm"
                        : "border border-gray-200 bg-white hover:border-orange-200"
                    )}
                  >
                    <p className="text-xs font-bold text-gray-700 mb-1">
                      {quarterlyPlanDetails.name || "3 महीने का प्लान"}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={"text-xl sm:text-2xl font-black " + (selectedPlanId === "quarterly" ? "text-[#9A283D]" : "text-gray-900")}>
                        ₹{quarterlyPlanDetails.price}
                      </span>
                      {quarterlyPlanDetails.originalPrice > quarterlyPlanDetails.price && (
                        <span className="text-xs text-gray-400 line-through">₹{quarterlyPlanDetails.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Plan 2: 1 Year (Popular / Best Value) */}
                  <div
                    onClick={() => handlePlanClick("yearly")}
                    className={"relative flex-1 cursor-pointer rounded-2xl p-3 text-center transition-all " + (
                      selectedPlanId === "yearly"
                        ? "border-2 border-[#9A283D] bg-red-50/40 shadow-sm"
                        : "border border-gray-200 bg-white hover:border-orange-200"
                    )}
                  >
                    <p className="text-xs font-black text-[#9A283D] mb-1">
                      {yearlyPlanDetails.name || "1 साल का VIP प्लान"}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={"text-xl sm:text-2xl font-black " + (selectedPlanId === "yearly" ? "text-[#9A283D]" : "text-gray-900")}>
                        ₹{yearlyPlanDetails.price}
                      </span>
                      {yearlyPlanDetails.originalPrice > yearlyPlanDetails.price && (
                        <span className="text-xs text-gray-400 line-through">₹{yearlyPlanDetails.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust & Guarantee Banner */}
                <div className="mt-4 flex items-center justify-around border border-orange-100 rounded-xl bg-white py-2.5 px-2 shadow-xs text-[10px] font-bold text-gray-700">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500">🔒</span> 100% सुरक्षित
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-500">⚡</span> तुरंत VIP एक्सेस
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">🔓</span> कभी भी कैंसिल
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ 4. HOW IT WORKS ═══ */}
            <section className="bg-white border-t border-orange-100 px-4 py-6">
              <div className="max-w-lg mx-auto">
                <h2 className="relative flex items-center justify-center text-center text-lg sm:text-xl font-black text-[#9A283D] mb-5">
                  <span className="bg-white px-3 z-10 relative">कैसे काम करता है?</span>
                  <div className="absolute left-0 right-0 h-[2px] bg-red-200 z-0"></div>
                </h2>
                <div className="relative flex items-start justify-between gap-1">
                  <div className="absolute left-6 right-6 top-6 h-0.5 border-t-2 border-dashed border-orange-200 z-0"></div>
                  {[
                    { icon: "💳", title: "चुनें", sub: "प्लान चुनें" },
                    { icon: "🛡️", title: "भुगतान", sub: "UPI पेमेंट" },
                    { icon: "⬇️", title: "डाउनलोड", sub: "ऐप इंस्टॉल" },
                    { icon: "👤", title: "शुरू करें", sub: "दैनिक भक्ति" },
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex-1 flex flex-col items-center text-center">
                      <div className="mb-1.5 w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#9A283D] bg-white text-xl shadow-sm">
                        {step.icon}
                      </div>
                      <h4 className="text-[11px] font-black text-[#9A283D] leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[8px] font-medium text-gray-500 mt-0.5">
                        {step.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ 5. DEVOTEES EXPERIENCES / TESTIMONIALS ═══ */}
            <section className="bg-[#FFF8F0] px-4 py-6 border-t border-orange-100">
              <div className="max-w-lg mx-auto">
                <h2 className="text-lg sm:text-xl font-black text-[#9A283D] text-center mb-4">
                  भक्तों के अनुभव
                </h2>
                <div className="space-y-2.5">
                  {[
                    {
                      name: "नेहा शर्मा",
                      city: "दिल्ली",
                      text: "भक्ति भाव ने मेरी रोजमर्रा की पूजा को बहुत आसान बना दिया। एकादशी और प्रदोष के शुभ मुहूर्त समय पर मिलते हैं।",
                    },
                    {
                      name: "रोहित वर्मा",
                      city: "जयपुर",
                      text: "108 नाम जाप फीचर बहुत ही अद्भुत है। दैनिक माला पूरी करने की अच्छी आदत बन गई है।",
                    },
                    {
                      name: "अंजलि पटेल",
                      city: "अहमदाबाद",
                      text: "आरती, चालीसा और कथाएं — सब कुछ प्रामाणिक और बिना किसी रुकावट के मिलता है।",
                    },
                  ].map((rev, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-orange-100 rounded-xl p-3.5 shadow-xs"
                    >
                      <div className="text-amber-400 text-xs mb-1.5">★★★★★</div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed italic mb-2.5">
                        "{rev.text}"
                      </p>
                      <div className="flex items-center gap-2">
                        <img
                          src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(rev.name) + "&background=fde8e8&color=9A283D&size=64"}
                          alt={rev.name}
                          className="w-7 h-7 rounded-full border border-orange-200"
                        />
                        <div>
                          <p className="text-xs font-black text-[#9A283D]">{rev.name}</p>
                          <p className="text-[9px] text-gray-400">{rev.city}</p>
                        </div>
                        <span className="ml-auto text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ 6. FINAL DEVOTIONAL BANNER ═══ */}
            <section className="bg-gradient-to-br from-[#7a1f30] via-[#9A283D] to-[#590f1d] px-4 py-7 text-white text-center">
              <span className="text-3xl block mb-1.5">🪔</span>
              <h3 className="text-lg font-black mb-1">
                आज ही जुड़ें और अपनी भक्ति यात्रा शुरू करें
              </h3>
              <p className="text-xs text-amber-200/90 mb-3.5 font-medium">
                50,000+ भक्तों का विश्वास · तुरंत VIP एक्सेस
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("footer-mobile-input");
                  if (el) {
                    el.focus();
                  } else {
                    const planSection = document.getElementById("plans");
                    if (planSection) planSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-white text-[#9A283D] font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer"
              >
                <span>अभी जुड़ें — ₹{activePlanInfo.price} में</span>
                <span>→</span>
              </button>
            </section>

            {/* ═══ 7. LEGAL FOOTER LINKS ═══ */}
            <footer className="bg-white border-t border-gray-100 px-4 py-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold text-gray-400">
                <span>© 2026 Bhakti Bhav. All rights reserved.</span>
                <Link to="/privacyPolicy" className="hover:text-[#9A283D] transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/termsAndConditions" className="hover:text-[#9A283D] transition-colors">
                  Terms
                </Link>
                <Link to="/contact-us" className="hover:text-[#9A283D] transition-colors">
                  Contact
                </Link>
              </div>
            </footer>

            {/* ═══ 8. FIXED FOOTER CONVERSION BAR (Exact Phone Input & Action Trigger) ═══ */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#24050B] via-[#3B0A14] to-[#24050B] border-t-2 border-amber-400/40 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white">
              <div className="max-w-md sm:max-w-xl mx-auto space-y-2">
                {/* Top Row: Daily Cost & Savings Badge (Clean Single Line) */}
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs sm:text-sm font-bold text-amber-200">
                    {activePlanInfo.dailyCost} · Auto-renews {activePlanInfo.id === "yearly" ? "yearly" : "quarterly"}
                  </span>
                  <span className="bg-gradient-to-r from-[#E63946] to-[#9A283D] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-300/40 shadow-sm uppercase tracking-wider">
                    {activePlanInfo.savings}
                  </span>
                </div>

                {/* Form: Phone Input + Submit Button */}
                <form onSubmit={handleLandingSubmit} className="space-y-3">
                  {!getIsLoggedIn() ? (
                    <div className="flex h-14 sm:h-16 items-center rounded-full bg-black/60 border-2 border-amber-400/60 px-5 sm:px-7 shadow-inner focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40 transition-all">
                      <span className="text-base sm:text-lg font-black text-amber-300 pr-3.5 sm:pr-4 border-r-2 border-white/20 flex items-center gap-2 shrink-0">
                        <span className="text-xl sm:text-2xl">🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        id="footer-mobile-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        value={formatMobileDisplay(mobile)}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="xxxxx xxxxx"
                        className="min-w-0 flex-1 bg-transparent px-3.5 sm:px-4 text-lg sm:text-2xl font-black text-white placeholder:text-gray-400 focus:outline-none tracking-widest"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 sm:h-16 items-center justify-between bg-white/14 hover:bg-white/18 border-2 border-amber-400/50 rounded-full px-5 sm:px-7 transition-all shadow-inner">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">📱</span>
                        <span className="text-amber-200 font-black tracking-widest text-lg sm:text-2xl">
                          {formatMobileDisplay(getMobileNoFromLS() || mobile)}
                        </span>
                      </div>
                      <span className="text-emerald-400 text-xs sm:text-sm font-black flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/50 px-3.5 py-1.5 rounded-full shadow-xs">
                        ✓ Verified
                      </span>
                    </div>
                  )}

                  {/* Gradient Action Button (Matching Pill Shape & Height) */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full h-14 sm:h-16 rounded-full bg-gradient-to-r from-[#E63946] via-[#D62828] to-[#9A283D] hover:from-[#d62828] hover:to-[#7a1f30] px-6 text-base sm:text-lg font-black text-white shadow-xl shadow-red-950/60 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">▶</span>
                    <span>
                      {loginLoading
                        ? "OTP Bheja Ja Raha Hai..."
                        : "Aage Badhein"}
                    </span>
                  </button>
                </form>

                {/* Social Proof & Trust Under Button */}
                <div className="flex items-center justify-between text-[10px] text-amber-100/90 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">★★★★★</span>
                    <span className="font-bold">50,000+ Bhakt Jude Hain</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span>Secure UPI Payment</span>
                    <span>·</span>
                    <span>Cancel Anytime</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: "PAYMENT PROCESS" BOTTOM SHEET MODAL (Bhakti Bhav Themed)
         ========================================================================= */}
      {showPaymentProcess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFF8F0] rounded-t-[2rem] shadow-2xl text-gray-800 pb-8 pt-4 px-5">
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-orange-200 rounded-full mx-auto mb-5"></div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowPaymentProcess(false);
                setShowDownloadPopup(false);
                setCurrentStep("payment_gateway");
                setErrorMessage("");
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-orange-200 text-gray-400 hover:text-gray-700 flex items-center justify-center text-sm shadow-sm cursor-pointer"
            >✕</button>

            {/* App Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-amber-300/25 blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-3xl bg-white border-2 border-orange-200 flex items-center justify-center shadow-lg">
                  {selectedUpiApp ? (
                    <div className="text-4xl">{selectedUpiApp.icon}</div>
                  ) : (
                    <span className="text-4xl">💳</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-black text-gray-900 mb-1">
                {currentAuthLink
                  ? `${selectedUpiApp?.name || "UPI App"} Ready Hai!`
                  : paymentInitiating
                    ? "Secure Link Ban Raha Hai…"
                    : `${selectedUpiApp?.name || "UPI"} Ke Liye Taiyaar Karein`}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {activePlanInfo.name} · ₹{activePlanInfo.price}
              </p>
              {paymentInitiating && !currentAuthLink && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <div className="w-2 h-2 rounded-full bg-[#9A283D] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#9A283D] animate-bounce"></div>
                </div>
              )}
            </div>

            {/* Open UPI App Button */}
            {currentAuthLink ? (
              <div className="space-y-2 mb-4">
                <a
                  href={currentAuthLink}
                  id="btn-open-upi-app"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-base shadow-lg active:scale-[0.98] transition"
                >
                  <span className="text-xl">🚀</span>
                  <span>{selectedUpiApp?.name || "UPI App"} Kholein — Mandate Approve Karein</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentProcess(false);
                    setShowDownloadPopup(false);
                    setCurrentStep("payment_gateway");
                    setErrorMessage("");
                  }}
                  className="w-full text-center text-xs font-bold text-[#9A283D] hover:underline py-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Kisi aur UPI app se try karein →</span>
                </button>
              </div>
            ) : (
              <div className="h-14 mb-4 rounded-2xl bg-orange-100/60 border border-orange-200 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">Link taiyar ho raha hai…</span>
              </div>
            )}

            {/* Countdown */}
            <div className="text-center mb-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Session Time Left</p>
              <div className="text-3xl font-black font-mono text-[#9A283D] bg-white border border-orange-200 rounded-xl py-2 px-5 inline-block shadow-sm">
                {formatCountdown(countdown)}
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center font-medium mb-3">
                {errorMessage}
              </p>
            )}

            {/* Switch directly to another verified UPI app */}
            <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-3 mb-2 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                Dusra UPI app chunein:
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {UPI_APPS.filter((a) => a.id !== selectedUpiApp?.id).slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleUpiAppSelect(app)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-gray-800 shadow-2xs hover:border-[#9A283D] active:scale-95 transition cursor-pointer"
                  >
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentProcess(false);
                  setShowDownloadPopup(false);
                  setCurrentStep("payment_gateway");
                  setErrorMessage("");
                }}
                className="mt-2 text-[11px] font-bold text-[#9A283D] underline block mx-auto cursor-pointer"
              >
                Sabhi UPI apps dekhein (View all apps)
              </button>
            </div>

            {/* Security */}
            <div className="mt-4 pt-3 border-t border-orange-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1">
                🛡️ 100% Secure · 256-bit Encrypted · NPCI Certified
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHONE NUMBER LOGIN MODAL
         ========================================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border-2 border-orange-100">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-lg hover:bg-gray-200"
            >
              ×
            </button>

            <img src="/img/logo_splash.png" alt="Bhakti Bhav" className="h-14 w-auto mx-auto mb-2 object-contain" />
            <h3 className="text-xl font-black text-[#9A283D]">Bhakti Bhav</h3>
            <div className="inline-block bg-orange-50 border border-orange-200 text-[#9A283D] text-xs font-bold px-3 py-0.5 rounded-full mt-1 mb-2">
              ₹{activePlanInfo.price} ({activePlanInfo.name})
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Aage badhne ke liye apna 10-digit mobile number dalein
            </p>

            <form onSubmit={handleLandingSubmit} className="space-y-4">
              <div className="flex h-14 sm:h-16 items-center rounded-full bg-gray-50 border-2 border-orange-200 px-5 sm:px-6 shadow-inner focus-within:border-[#9A283D]">
                <span className="text-base sm:text-lg font-black text-gray-700 pr-3 sm:pr-4 border-r border-gray-300 flex items-center gap-2 shrink-0">
                  <span className="text-xl">🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={12}
                  value={formatMobileDisplay(mobile)}
                  autoFocus
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="xxxxx xxxxx"
                  className="min-w-0 flex-1 bg-transparent px-3 text-lg sm:text-xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-full bg-gradient-to-r from-[#9A283D] to-[#7a1f30] h-14 sm:h-16 text-lg sm:text-xl font-black text-white shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                {loginLoading ? "OTP Bheja Ja Raha Hai..." : "OTP Bhejein (Send OTP)"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          FAST OTP VERIFICATION MODAL
         ========================================================================= */}
      {showOtpPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-[#FFF8F0] rounded-t-[2rem] sm:rounded-3xl shadow-2xl text-center px-6 pt-5 pb-8 border-t-4 border-[#9A283D]/20">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowOtpPopup(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white border border-orange-200 text-gray-500 flex items-center justify-center hover:text-gray-800 transition"
            >×</button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9A283D] to-[#e64a66] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-2xl">🔐</span>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1">OTP Enter Karein</h3>
            <p className="text-xs text-gray-500 mb-5">
              Humne <span className="font-bold text-gray-800">+91 {getMobileNoFromLS() || mobile}</span> par 4-digit code bheja hai
            </p>

            {/* OTP Boxes */}
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`landing-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  className="w-13 h-15 w-[3.2rem] h-[3.8rem] rounded-2xl border-2 border-orange-200 text-center text-2xl font-black text-[#9A283D] bg-white focus:border-[#9A283D] focus:ring-2 focus:ring-[#9A283D]/15 focus:outline-none transition shadow-sm"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              id="landing-verify-btn"
              type="button"
              disabled={otpLoading}
              onClick={handleOtpVerify}
              className="w-full rounded-2xl bg-gradient-to-r from-[#9A283D] to-[#7a1f30] py-3.5 text-base font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50 mb-3"
            >
              {otpLoading ? "Verify Ho Raha Hai…" : "✓ Verify Karein — Aage Badhein"}
            </button>

            {/* Resend */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>Code nahi aaya?</span>
              <button
                type="button"
                disabled={timeLeft > 0}
                onClick={handleResendOtp}
                className={timeLeft > 0 ? "text-gray-400 font-semibold" : "text-[#9A283D] font-bold underline cursor-pointer"}
              >
                {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Dubara Bhejein"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: CELEBRATION / DOWNLOAD APP MODAL (When subscription is confirmed)
         ========================================================================= */}
      {showDownloadPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border-4 border-amber-300">
            <button
              type="button"
              onClick={() => {
                setShowDownloadPopup(false);
                if (isSubscriptionConfirmed) {
                  localStorage.removeItem("cashfreeSubscriptionId");
                  navigate("/");
                } else {
                  // Not paid / mandate cancelled: return to UPI apps page!
                  setCurrentStep("payment_gateway");
                }
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-lg hover:bg-gray-200 cursor-pointer"
            >
              ×
            </button>

            {/* Icon Header */}
            {isSubscriptionConfirmed ? (
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
                ✓
              </div>
            ) : isSubscriptionFailed ? (
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
                ✕
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner animate-pulse">
                ⏳
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-black text-[#9A283D]">
              {isSubscriptionConfirmed
                ? "Badhai Ho! Membership Active Hai"
                : isSubscriptionFailed
                  ? "Payment Confirm Nahi Ho Saki"
                  : "AutoPay Mandate Confirm Ho Raha Hai"}
            </h3>

            {/* Description (only when pending or failed) */}
            {!isSubscriptionConfirmed && (
              <p className="text-sm font-semibold text-gray-700 mt-2 mb-4 leading-snug">
                {isSubscriptionFailed
                  ? "Mandate cancel ho gaya ya bank se pushti nahi ho saki. Kripya punah prayas karein."
                  : "Aapka AutoPay mandate bank dwara verify kiya ja raha hai (10-30 second lag sakte hain). Agar aapne UPI app me approve kar diya hai, to Status Refresh Karein ya seedha App Download karein."}
              </p>
            )}

            {/* Status Details Card */}
            <div className={`bg-orange-50/70 rounded-xl p-3 text-xs text-gray-600 mb-4 text-left border border-orange-100 ${isSubscriptionConfirmed ? "mt-4" : ""}`}>
              <div className="flex justify-between py-0.5 items-center">
                <span className="font-medium text-gray-500">Status:</span>
                <span className={`font-black flex items-center gap-1 ${isSubscriptionConfirmed
                  ? "text-emerald-600"
                  : isSubscriptionFailed
                    ? "text-red-600"
                    : "text-amber-600"
                  }`}>
                  {paymentStatusLoading ? "Pushti Jaari Hai…" : normalizedPaymentStatus || "PENDING"}
                  {paymentStatusLoading && (
                    <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-medium text-gray-500">Plan:</span>
                <span className="font-bold text-gray-800">{activePlanInfo.shortName}</span>
              </div>
              {localStorage.getItem("cashfreeSubscriptionId") && (
                <div className="flex justify-between py-0.5 text-[10px] text-gray-400">
                  <span>ID:</span>
                  <span className="font-mono truncate max-w-[170px]">{localStorage.getItem("cashfreeSubscriptionId")}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isSubscriptionConfirmed ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadApp}
                    disabled={isGeneratingLink}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 py-4.5 px-4 text-lg font-black text-white shadow-xl hover:shadow-2xl active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {isGeneratingLink ? (
                      <>
                        <span className="inline-block w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span className="text-base font-bold">App Link Khul Raha Hai…</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">📲</span>
                        <span>App Download Karein (VIP Active)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDownloadPopup(false);
                      localStorage.removeItem("cashfreeSubscriptionId");
                      navigate("/");
                    }}
                    className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#9A283D] pt-1 transition underline cursor-pointer"
                  >
                    Website Par Jayein (Continue to Website) →
                  </button>
                </>
              ) : isSubscriptionFailed ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadPopup(false);
                    setCurrentStep("payment_gateway");
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#9A283D] to-[#7a1f30] py-3 text-sm font-black text-white shadow-lg active:scale-95 transition cursor-pointer"
                >
                  Dusre App Se Dobara Koshish Karein
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={paymentStatusLoading}
                    onClick={() => checkStatusOnce()}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-black text-white shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>🔄</span>
                    <span>{paymentStatusLoading ? "Checking Status…" : "Status Refresh Karein"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadApp}
                    disabled={isGeneratingLink}
                    className="w-full rounded-xl bg-white border-2 border-[#9A283D] text-[#9A283D] py-2.5 text-xs font-black shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isGeneratingLink ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#9A283D] border-t-transparent animate-spin"></span>
                        <span>App Link Khul Raha Hai…</span>
                      </>
                    ) : (
                      <>
                        <span>📲</span>
                        <span>App Download Karein (Auto Login)</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
