import React, { useState, useEffect, useRef} from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import bannerImg from "../assets/img/paymentPageBanner.jpeg";
import { Check, Tag } from "lucide-react";
import { paymentApis, subscriptionApis, profileApis, wallpaperApis } from "../api";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../contexts/PaymentContext";
import { getIsLoggedIn, getTokenFromLS } from "../commonFunctions";
import useGA4Tracker  from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import { getMobileNoFromLS } from "../commonFunctions";

const CASHFREE_RETURN_BACKEND_URL =
  process.env.REACT_APP_CASHFREE_SUBSCRIPTION_RETURN_URL ||
  "https://api.bhaktibhav.app/api/v1/frontend/cashfree/subscription/return";

const buildCashfreeReturnUrl = (frontendReturnUrl) => {
  const encoded = encodeURIComponent(frontendReturnUrl);
  return `${CASHFREE_RETURN_BACKEND_URL}?redirect_url=${encoded}`;
};

export default function Payment() {
  const DEFAULT_SUBSCRIPTION_PLAN_ID = "69cf557fd51b9fa7a048826c";
  
  const [plans, setPlans] = useState([]);
   const [profile, setProfile] = useState({
          name: "",
          mobileNumber: "",
          email: "",
          state: "",
          gender: "",
  });
  const [bannersData, setBannersData] = useState([]);

  const [selectedActivePlanName, setSelectedActivePlanName] = useState({
    activePlanName: "", 
    expiryDate: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);

  const baseParams = useGA4BaseParams("Payment Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  const navigate = useNavigate();
  const { setPaymentData } = usePayment();

  const paymentScreenViewTracker = useRef(false);

  const handlePaymentOptionSelected = (planDetails) => {
    trackCustomEvent("PaymentOptionSelected", { planDetails });
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await profileApis.getProfile();
        console.log("Profile API Response:", res);

        if (res) {
          console.log("Setting profile data:", res);
          setProfile({
            name: res.name || "",
            mobileNumber: res.mobileNumber || "",
            email: res.email || "",
            state: res.state || "",
            gender: res.gender || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // setLoading(false);
        console.log("Finally block executed");
      }
    }
    fetchProfileData();
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await subscriptionApis.getSubscriptionPlans();
        setPlans(response.plans.sort((a, b) => b.price - a.price));
        // Set the first plan as selected by default
        setSelectedActivePlanName({
          activePlanName: response.activePlanName || "",
          expiryDate: response.expiryDate || "",
        })
        if (response && response.plans.length > 0) {
          setSelectedPlan(response.plans[0]._id || response.plans[0].id);
        }
        console.log("Fetched subscription plans:", response);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };

    fetchSubscriptionPlans();
    const fetchBanners = async () => {
                try {
                    const banners = await wallpaperApis.getBanners();
                    console.log("Banners:", banners);
                    setBannersData(banners?.data.filter(b => b.pageName === "payment"));
                } catch (error) {
                    console.error("Error fetching banners:", error);
                }
            };
    
    fetchBanners();
  }, []);

  // const plans = [
  //   {
  //     id: "platinum",
  //     title: "IySfVue",
  //     subtitle: "Platinum",
  //     duration: "365 Days",
  //     price: "₹ 251",
  //   },
  //   {
  //     id: "silver",
  //     title: "flYoj",
  //     subtitle: "Silver",
  //     duration: "90 Days",
  //     price: "₹ 101",
  //   },
  // ];

  useEffect(() => {
    if (!paymentScreenViewTracker.current) {
      trackEvent(GA4Events.subscription_plans_screen_viewed, { event_label: "subscription_plans_screen_viewed_from_payment_screen" });
      paymentScreenViewTracker.current = true;
    }
  }, [])

  const items = [
    {
      en: "Complete Vrat Katha for your rituals",
      hi: "आपके व्रत अनुष्ठान के लिए संपूर्ण व्रत कथा",
    },
    {
      en: "Sacred Jaap Maala & Powerful Mantras",
      hi: "पूजन के लिए पवित्र जाप माला एवं शक्तिशाली मंत्र",
    },
    {
      en: "Aarti & Chalisa for daily devotion",
      hi: "दैनिक भक्ति हेतु आरती एवं चालीसा",
    },
    {
      en: "Spiritual Wallpaper for divine inspiration",
      hi: "आध्यात्मिक प्रेरणा देने वाले भक्ति भाव से भरपूर वॉलपेपर",
    },
    {
      en: "Daily Mantra for peace and positivity",
      hi: "शांति एवं सकारात्मकता के लिए दैनिक मंत्र",
    },
    {
      en: "Daily Panchang with auspicious timings",
      hi: "शुभ मुहूर्त सहित दैनिक पंचांग",
    },
    {
      en: "Hindi Calendar with Tithis & Nakshatras",
      hi: "तिथि एवं नक्षत्रों सहित हिंदी पंचांग कैलेंडर",
    },
    {
      en: "List of Major Hindu Festivals",
      hi: "प्रमुख हिंदू त्यौहारों की संपूर्ण सूची",
    },
  ];

  const saveSubscriptionPaymentInLS = (response, planData, profileData) => {
    const subscriptionData = response?.data || {};
    localStorage.setItem("cashfreeSubscriptionResponse", JSON.stringify(response));
    localStorage.setItem("cashfreeSubscriptionId", subscriptionData.subscriptionId || "");
    localStorage.setItem("cashfreeSubscriptionSessionId", subscriptionData.subscriptionSessionId || "");
    localStorage.setItem("cashfreeCfSubscriptionId", subscriptionData.cfSubscriptionId || "");
    localStorage.setItem("cashfreeSubscriptionStatus", subscriptionData.status || "");
    localStorage.setItem("cashfreeSubscriptionAmount", String(subscriptionData.amount || planData?.price || ""));
    localStorage.setItem("cashfreeSelectedPlanData", JSON.stringify(planData || {}));
    localStorage.setItem("cashfreeBillingProfile", JSON.stringify(profileData || {}));
  };

  const makePayment = async (selectedPlan) => {
    if(!selectedPlan) {
      alert("No valid plan is selected for payment.");
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: "No valid plan selected", mobileNumber: getMobileNoFromLS() });
      navigate("/payment");
    }
    else {
      const planDetails = plans.filter((plan) => plan?._id === selectedPlan);
      const planData = planDetails[0];
      if (!planData) {
        alert("No valid plan is selected for payment.");
        trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: "Selected plan details not found", mobileNumber: getMobileNoFromLS(), planId: selectedPlan });
        return;
      }
    console.log("selectedPlan", planDetails);
    console.log("profile", profile);
    if(profile.email === '' || profile.email == null || profile.email === undefined) {
      setTimeout(() => {
        // alert("Please update your email in profile section to proceed with the payment.");
        if(!getTokenFromLS()) {
          navigate("/login");
        }
      }, 500);
    }
    const billingProfile = {
      name: profile.name || "Smruti Ranjan Mallick",
      email: profile.email || "dummytest@gmail.com",
      phone: profile.mobileNumber || getMobileNoFromLS() || "9540089701",
    };

      // Build return URL: routes via backend in production to avoid 405 on Nginx
      const frontendReturnUrl = `${window.location.origin}/PaymentPay?subscription_id={subscription_id}`;
      const cashfreeReturnUrl = buildCashfreeReturnUrl(frontendReturnUrl);

      const subscriptionPayload = {
        planId: planData?._id || selectedPlan || DEFAULT_SUBSCRIPTION_PLAN_ID,
        name: billingProfile.name,
        phone: billingProfile.phone,
        email: billingProfile.email,
        source: "web",
        couponCode: "",
        returnUrl: cashfreeReturnUrl,
        return_url: cashfreeReturnUrl,
        frontendReturnUrl, // backend uses this to redirect user after handling POST
      };

    console.log({ ...subscriptionPayload, amount: planData.price }
    );

    try {
      const res = await paymentApis.createSubscription(subscriptionPayload);

      if(res.success) {
        // Store payment data in context before navigation
        saveSubscriptionPaymentInLS(res, planData, billingProfile);
        setPaymentData(res, planData, billingProfile);
        navigate("/paymentPage");
      } else {
        // API responded but payment initiation failed
        trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: res?.message || "Payment initiation failed", mobileNumber: getMobileNoFromLS(), planId: planData._id });
      }
      console.log(res, "Payment Response");
    } catch (paymentError) {
      console.error("Error making payment:", paymentError);
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, { message: paymentError?.message || "Network error during payment initiation", mobileNumber: getMobileNoFromLS(), planId: planData?._id });
    }
    }
  }

  return (
    <div className="min-h-screen">

      <Header />

      <div className="container mx-auto px-4 py-6 theme_text">
        <div className="rounded-xl shadow flex flex-col items-center">
          <img
            src={(bannersData && bannersData[0]?.imageUrl) || "../assets/img/paymentPageBanner.jpeg"}
            alt={"payment_bg"}
            className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
          />
        </div>

        {/* <div className="text-center mt-4">
          <p className="font-hindi theme_text" style={{fontSize: '21px'}}>हो जायें प्रभु की भक्ति में लीन!</p>
          <p className="theme_text font-eng">Ho jaye prabhu ki bhakti me leen</p>
        </div> */}

        <div className="container mx-auto px-4 mt-6 space-y-4">
          {plans && plans.length > 0  ? plans?.map((plan, index) => {
            const isOfferActive = plan.isOfferActive === true;
            const discountedPrice = plan.finalPrice ?? plan.offerPrice ?? plan.price;

            return (
            <div
              key={plan._id || plan.id}
              onClick={() => setSelectedPlan(plan._id || plan.id)}
              className={`relative cursor-pointer border-2 rounded-2xl bg-white transition-all duration-200
          ${selectedPlan === (plan._id || plan.id)
                  ? "border-[#9A283D] shadow-lg"
                  : "border-gray-200 hover:border-[#9A283D]"}`}
            >
              {isOfferActive && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 font-eng">
                  {plan.discountPercent || 0}% OFF
                </div>
              )}
              <div className="px-4 py-5">
              <div className="flex items-center gap-2">
                {/* Plan Logo Circle - shows plan.image from API (falls back to default logo) */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-center font-bold leading-tight overflow-hidden
                    `}>
                  <img
                    src={plan.image || "./img/logo_splash.png"}
                    alt="Bhakti Bhav"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./img/logo_splash.png"; }}
                  />
                </div>

                {/* Plan Name & Duration */}
                <div className={`flex-1 ${isOfferActive ? "pr-3 border-r border-dashed border-gray-300" : ""}`}>
                  <h3 className="font-eng text-[#9A283D] text-md font-bold leading-tight">
                    {plan.name || plan.title}
                  </h3>
                  <p className="font-eng text-xs text-[#9A283D] mt-0.5">
                    {plan.days || plan.duration} Days
                  </p>
                </div>

                {/* Price */}
                <div className={`flex flex-col items-end mr-4 flex-shrink-0 ${isOfferActive ? "pl-3" : ""}`}>
                  {isOfferActive && (
                    <span className="text-gray-400 line-through text-md font-eng">
                      ₹{plan.price}
                    </span>
                  )}
                  <span className={`text-[#9A283D] font-bold font-eng ${isOfferActive ? "text-xl" : "text-lg"}`}>
                    ₹{isOfferActive ? discountedPrice : plan.price}
                  </span>
                </div>

                {/* Checkmark for selected */}
                {selectedPlan === (plan._id || plan.id) && (
                  <div className="w-8 h-8 rounded-full bg-[#9A283D] flex items-center justify-center flex-shrink-0">
                    <Check className="text-white w-5 h-5" />
                  </div>
                )}
              </div>
              </div>

              {isOfferActive && (
                <div
                  className="px-4 py-3 rounded-b-2xl flex items-center gap-2"
                  style={{ backgroundColor: "rgba(87, 0, 0, 0.05)" }}
                >
                  <Tag className="w-4 h-4 text-[#9A283D] font-semibold" />
                  <span className="font-eng text-sm text-[#9A283D] font-semibold">
                    You save ₹{plan.savings || (plan.price - discountedPrice)}
                  </span>
                </div>
              )}
            </div>
            );
          }) : (

            <div className="text-center py-12">
              {/* <div className="text-[#9A283D] text-6xl mb-4">�</div> */}
              <div className="font-eng text-lg font-semibold text-[#9A283D] mb-2">
                Your Active Plan
              </div>
              <div className="bg-gradient-to-br from-[#FFFAF8] to-[#FCD34D] border-2 border-[#9A283D] rounded-xl p-6 mx-4 mb-4">
                <h3 className="font-eng text-xl font-bold text-[#9A283D] mb-2">
                  {selectedActivePlanName.activePlanName || "Premium Plan"}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-eng text-sm text-gray-600">Expires on:</span>
                  <span className="font-eng text-sm font-semibold text-[#9A283D]">
                    {selectedActivePlanName.expiryDate ? new Date(selectedActivePlanName.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : "N/A"}
                  </span>
                </div>
                <div className="font-eng bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full inline-block">
                  Active
                </div>
              </div>
              <p className="font-eng text-sm text-gray-500">
                Enjoy unlimited access to all spiritual content
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto px-4 mt-8 flex flex-col items-center space-y-4">
          {plans && plans.length > 0 && (
            <button
              className="w-full bg-[#9A283D] text-white py-4 rounded-full shadow-lg text-lg font-semibold hover:bg-[#7a1f30] transition-all duration-200"
              onClick={() => {
                if (!getIsLoggedIn()) {
                  navigate("/login");
                  return;
                }
                trackEvent(GA4Events.subscription_plan_selected, {event_label: "payment_button_clicked_from_payment_screen", selectedPlan: plans.find((x) => x._id === selectedPlan).name});
                handlePaymentOptionSelected({selectedPlan: plans.find((x) => x._id === selectedPlan)});
                makePayment(selectedPlan);
              }}
            >
              <span className="font-hindi">प्रारंभ करें</span>{" "}
              <span className="font-eng text-sm">(Start Now)</span>
            </button>
          )}
          <button
            className="text-[#9A283D] font-eng text-base hover:text-[#9A283D] transition-colors py-1"
            onClick={() => {trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_SKIPPED, { message: "User skipped payment", mobileNumber: getMobileNoFromLS() }); navigate("/")}}
          >
            Skip
          </button>
        </div>


        {/* Benefits Section */}
        <div className="container mx-auto px-2 mt-10 mb-8">
          <h3 className="text-center font-hindi theme_text text-xl font-bold">
            आपको क्या प्राप्त होगा
          </h3>
          <p className="text-center theme_text text-sm text-black mb-6 font-eng font-semibold">
            What will you get?
          </p>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-2 pb-1 snap-x snap-mandatory">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[45%] sm:w-[220px] snap-start flex flex-col items-start gap-2 bg-white border border-[#E9B9C5] rounded-2xl px-3 py-4 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#9A283D] flex items-center justify-center flex-shrink-0">
                  <Check className="text-white w-4 h-4" strokeWidth={3} />
                </div>

                <div className="flex flex-col">
                  <span className="font-hindi font-bold theme_text text-sm leading-snug">{item.hi}</span>
                  <span className="font-eng text-black text-xs mt-0.5">{item.en}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
