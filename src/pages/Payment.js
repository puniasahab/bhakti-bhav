import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import bannerImg from "../assets/img/banner_bg.png";
import { Check } from "lucide-react";
import { paymentApis, subscriptionApis, profileApis } from "../api";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../contexts/PaymentContext";
import { getTokenFromLS } from "../commonFunctions";

export default function Payment() {

  const [plans, setPlans] = useState([]);
   const [profile, setProfile] = useState({
          name: "",
          mobileNumber: "",
          email: "",
          state: "",
          gender: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);

  const navigate = useNavigate();
  const { setPaymentData } = usePayment();

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
        if (response && response.plans.length > 0) {
          setSelectedPlan(response.plans[0]._id || response.plans[0].id);
        }
        console.log("Fetched subscription plans:", response);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };

    fetchSubscriptionPlans();
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

  const makePayment = async (selectedPlan) => {
    const planDetails = plans.filter((plan) => plan._id === selectedPlan);
    console.log("selectedPlan", planDetails);
    console.log("profile", profile);
    if(profile.email === '' || profile.email == null || profile.email === undefined) {
      setTimeout(() => {
        alert("Please update your email in profile section to proceed with the payment.");
        if(getTokenFromLS()) {
          navigate("/edit-profile");
        }
        else {
          navigate("/login");
        }
      }, 2000);
    }
    console.log({ planId: planDetails[0]._id, amount: planDetails[0].price, name: profile.name, email: profile.email, phone: profile.mobileNumber }
    )
    const res = await paymentApis.makePayment(
      { planId: planDetails[0]._id, amount: planDetails[0].price, name: profile.name, email: profile.email, phone: profile.mobileNumber }
    );

    if(res.success) {
      // Store payment data in context before navigation
      setPaymentData(res, planDetails[0], profile);
      navigate("/paymentPage");
    }
    console.log(res, "Payment Response");
  }

  return (
    <div className="min-h-screen">

      <Header />

      <div className="container mx-auto px-4 py-6 theme_text">
        <div className="rounded-xl shadow flex flex-col items-center">
          <img
            src={bannerImg || "/img/default-mantra.png"}
            alt={"payment_bg"}
            className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
          />
        </div>

        <div className="text-center mt-4">
          <p className="font-hindi theme_text" style={{fontSize: '21px'}}>हो जायें प्रभु की भक्ति में लीन!</p>
          <p className="theme_text font-eng">Ho jaye prabhu ki bhakti me lein</p>
        </div>

        <div className="container mx-auto px-4 mt-6 space-y-4">
          {plans && plans.length > 0  ? plans?.map((plan, index) => (
            <div
              key={plan._id || plan.id}
              onClick={() => setSelectedPlan(plan._id || plan.id)}
              className={`cursor-pointer border-2 rounded-xl p-6 shadow-lg bg-white transition-all duration-200 hover:shadow-xl
          ${selectedPlan === (plan._id || plan.id)
                  ? "border-[#9A283D] ring-2 ring-[#9A283D] ring-opacity-30 bg-gradient-to-br from-[#FFFAF8] to-[#FCD34D]"
                  : "border-[#E9B9C5] hover:border-[#9A283D]"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${selectedPlan === (plan._id || plan.id)
                        ? "border-[#9A283D] bg-[#9A283D]"
                        : "border-gray-300"}`}>
                      {selectedPlan === (plan._id || plan.id) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <h3 className="font-eng theme_text text-[22px] font-bold">
                      {plan.name || plan.title}
                    </h3>
                  </div>

                  <div className="ml-7">
                    <p className="text-sm font-eng text-gray-600 mb-1">
                      Duration: {plan.days || plan.duration} days
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#9A283D] font-bold text-2xl font-eng">
                        ₹{plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-gray-400 line-through text-lg font-eng">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.discount && (
                      <div className="mt-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          {plan.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {plan.isPopular && (
                  <div className="bg-[#9A283D] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
              </div>

              {plan.description && (
                <div className="mt-4 ml-7">
                  <p className="text-sm text-gray-600 font-eng">{plan.description}</p>
                </div>
              )}
            </div>
          )) : (<div>No plans available at the moment.</div>)}
        </div>

        <div className="mx-auto px-4 mt-6 flex flex-col space-y-3 font-eng justify-between">
          <button className="bg-[#9A283D] text-white py-3 rounded-xl shadow " onClick={() => makePayment(selectedPlan)}>
            Get Started
          </button>
          <button className="border border-[#9A283D] text-[#9A283D] py-3 rounded-xl shadow">
            Skip
          </button>
        </div>

        <div className="container mx-auto px-2 mt-8">
          <h3 className="text-center font-hindi theme_text ">
            आपको क्या प्राप्त होगा
          </h3>
          <h3 className="text-center text-xl text-black mb-4 font-eng">
            What will you get?
          </h3>

          <div className="space-y-4 text-center">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-2 flex items-top gap-3 border border-['#9A283D'] rounded"
              >
                <Check className="theme_text w-6 h-6 flex-shrink-0" />

                <div className="flex flex-col text-left">
                  <span className="font-hindi font-bold">{item.hi}</span>
                  <span className="font-eng text-sm  text-black">{item.en}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
