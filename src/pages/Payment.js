import React, { useState, useEffect, useRef} from "react";
import Header from "../components/Header";
import PageTitleCard from "../components/PageTitleCard";
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
import "./Payment.css";

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
  const [showAllFeatures, setShowAllFeatures] = useState(false);

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
    <div className="subscription-page">
      <div className="subscription-heading">
        <Header inlineHeader showBrandBackHeader hidePaymentAction />
        <div className="subscription-title">
          <PageTitleCard titleEn="Subscription" language="en" customEngFontSize="14px" />
        </div>
      </div>

      <main className="subscription-main">
        <div className="subscription-banner">
          <img
            src={(bannersData && bannersData[0]?.imageUrl) || bannerImg}
            alt="Subscription benefits"
            onError={(event) => {
              if (event.currentTarget.getAttribute("src") !== bannerImg) event.currentTarget.src = bannerImg;
            }}
          />
        </div>

        <div className="subscription-plans" role="group" aria-label="Subscription plans">
          {plans && plans.length > 0  ? plans?.map((plan, index) => {
            const isOfferActive = plan.isOfferActive === true;
            const discountedPrice = plan.finalPrice ?? plan.offerPrice ?? plan.price;

            return (
            <label
              key={plan._id || plan.id}
              className={`subscription-plan${selectedPlan === (plan._id || plan.id) ? " subscription-plan-selected" : ""}`}
            >
              <input
                type="radio"
                name="subscription-plan"
                value={plan._id || plan.id}
                checked={selectedPlan === (plan._id || plan.id)}
                onChange={() => setSelectedPlan(plan._id || plan.id)}
                aria-label={`${plan.name || plan.title}, ${plan.days || plan.duration} Days`}
              />
              {isOfferActive && (
                <span className="subscription-offer-badge">
                  {plan.discountPercent || 0}% OFF
                </span>
              )}
              <span className="subscription-plan-row">
                <span className="subscription-plan-icon">
                  <img
                    src={plan.image || "./img/logo_splash.png"}
                    alt="Bhakti Bhav"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./img/logo_splash.png"; }}
                  />
                </span>

                <span className="subscription-plan-info">
                  <strong>
                    {plan.name || plan.title}
                  </strong>
                  <span>
                    {plan.days || plan.duration} Days
                  </span>
                </span>

                <span className="subscription-plan-price">
                  {isOfferActive && (
                    <span className="subscription-original-price">
                      ₹{plan.price}
                    </span>
                  )}
                  <strong>
                    ₹{Number(isOfferActive ? discountedPrice : plan.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </span>

                <span className="subscription-plan-check" aria-hidden="true">
                  {selectedPlan === (plan._id || plan.id) && <Check size={15} strokeWidth={3} />}
                </span>
              </span>

              {isOfferActive && (
                <span className="subscription-savings">
                  <Tag size={16} aria-hidden="true" />
                  <span>
                    You save ₹{plan.savings || (plan.price - discountedPrice)}
                  </span>
                </span>
              )}
            </label>
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

        <div className="subscription-actions">
          {plans && plans.length > 0 && (
            <button
              className="subscription-start"
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
              Start Now
            </button>
          )}
          <button
            className="subscription-skip"
            onClick={() => {trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_SKIPPED, { message: "User skipped payment", mobileNumber: getMobileNoFromLS() }); navigate("/")}}
          >
            Skip
          </button>
        </div>


        {/* Benefits Section */}
        <section className="subscription-benefits" aria-labelledby="subscription-benefits-title">
          <h2 id="subscription-benefits-title">
            What will you get?
          </h2>

          <ul id="subscription-benefits-list">
            {(showAllFeatures ? items : items.slice(0, 3)).map((item, index) => (
              <li
                key={index}
              >
                <span className="subscription-benefit-check" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="font-devanagari">{item.hi}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="subscription-toggle"
            aria-expanded={showAllFeatures}
            aria-controls="subscription-benefits-list"
            onClick={() => setShowAllFeatures((show) => !show)}
          >
            {showAllFeatures ? "Show Less" : "Show More"}
          </button>
        </section>
      </main>
    </div>
  );
}
