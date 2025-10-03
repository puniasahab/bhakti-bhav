import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import bannerImg from "../assets/img/banner_bg.png";
import { Check } from "lucide-react";
import { subscriptionApis } from "../api";

export default function Payment() {

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await subscriptionApis.getSubscriptionPlans();
        setPlans(response);
        console.log("Fetched subscription plans:", response);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || null);
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
      en: "Personalized Rashifal based on your zodiac",
      hi: "आध्यात्मिक प्रेरणा देने वाले भक्ति भाव से भरपूर वॉलपेपर",
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
          <p className="font-hindi theme_text">हो जायें प्रभु की भक्ति में लीन!</p>
          <p className="theme_text font-eng">Ho jaye prabhu ki bhakti me lein</p>
        </div>

        <div className="container mx-auto px-4 mt-6 space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`cursor-pointer border-1 rounded-xl p-4 shadow bg-white transition 
          ${selectedPlan === plan.id ? "border-[#9A283D] ring-1 ring-[#9A283D]" : "border-[#E9B9C5]"}`}
            >
              <p className="font-hindi theme_text text-[24px] font-bold">
                {plan.name}{" "}
                {/* <span className="font-eng text-sm">/{plan.subtitle}</span> */}
              </p>
              <p className="text-sm font-eng">{plan.days}</p>
              <p className="text-[#9A283D] font-bold text-xl mt-1 font-eng">
                {plan.price}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto px-4 mt-6 flex flex-col space-y-3 font-eng justify-between">
          <button className="bg-[#9A283D] text-white py-3 rounded-xl shadow ">
            Get Started
          </button>
          <button className="border border-[#9A283D] text-[#9A283D] py-3 rounded-xl font-semibold w-[200px] self-center">
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
