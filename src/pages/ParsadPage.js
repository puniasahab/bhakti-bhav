import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import prasadImg from "../assets/img/prasad.png";
import { Navigate } from "react-router-dom";




// Each segment: { type: "hi" | "en", text: string }
const parsadItems = [
  {
    segments: [
      { type: "hi", text: "नवरात्रि में भक्ति का साथ और माँ का प्रसाद" },
      { type: "en", text: ", 🙏 Abhi subscribe karein" },
    ],
  },
  {
    segments: [
      { type: "hi", text: "हर दिन भक्ति हर दिन आशीर्वाद" },
      { type: "en", text: "🌸 Prasad jeetne ka mauka sirf yahan!" },
    ],
  },
  {
    segments: [
      { type: "hi", text: "नवरात्रि" },
      {type: "en", text: "Special 🙏" },
      { type: "hi", text: "अभी" },
      { type: "en", text: "Subscribe  karein" },
      { type: "hi", text: "और पाए" },
      { type: "en", text: "Vaishno Devi Prasad jeetne ka mauka!" },
    ],
  },
  {
    segments: [
      { type: "hi", text: "माँ का आशीर्वाद पाने का अवसर" },
      { type: "en", text: "🌸 Subscribe karein aur jeetiye Vaishno Devi Prasad" },

    ],
  },
  {
    segments: [
      { type: "hi", text: "इस नवरात्रि" },
      { type: "en", text: ", feel Maa's blessings ❤️ Subscribe karein" },
      { type: "hi", text: "और" },
      { type: "en", text: "paayein divine prasad ka chance" },
    ],
  },
];

export default function ParsadPage() {
  return (
    <>
      <Header />

      <PageTitleCard
        titleHi={"izlkn"}
        titleEn={"Prasad"}
        customEngFontSize={"14px"}
        customFontSize={"24px"}
      />

      <div className="container mx-auto px-4 pb-8">

        {/* Banner Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
          <img
            src={prasadImg}
            alt="Prasad"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Intro Text */}
        {/* <div className="bg-[rgba(255,250,244,0.85)] rounded-2xl shadow-md p-5 mb-6 border border-[#E9B9C5] text-center">
          <p className="font-hindi theme_text text-xl font-bold leading-relaxed">
            🙏 ईश्वर का आशीर्वाद — प्रसाद 🙏
          </p>
          <p className="font-eng text-sm text-gray-600 mt-1">
            God's Blessing — Prasad
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#9A283D] to-[#F5A418] rounded-full mx-auto mt-3"></div>
        </div> */}

        {/* Content Cards */}
        <div className="space-y-4">
          {parsadItems.map((item, index) => (
            <div
              key={index}
              className="bg-[rgba(255,250,244,0.85)] rounded-2xl shadow-md overflow-hidden"
              style={{ border: "1.5px solid #9A283D" }}
            >
              <div className="px-5 py-4 flex items-start gap-3">
                <p className="leading-relaxed font-semibold">
                  {item.segments.map((seg, sIndex) => (
                    <span
                      key={sIndex}
                      className={
                        seg.type === "hi"
                          ? "font-hindi text-[#9A283D] text-base"
                          : "font-eng text-[#9A283D] text-sm"
                      }
                    >
                      {seg.text}{" "}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
<div className="text-center mt-6">
        <button className="bg-[#9A283D] font-eng text-white font-bold py-4 px-6 rounded-full">
          Participate Now
        </button>
        </div>

        {/* Footer Quote */}
        {/* <div className="mt-8 text-center">
          <div className="bg-[rgba(255,250,244,0.85)] rounded-2xl shadow-md border border-[#E9B9C5] p-5">
            <p className="font-hindi theme_text text-lg font-bold">
              "जो भक्त श्रद्धा और प्रेम से प्रसाद ग्रहण करता है, उस पर ईश्वर की कृपा सदैव बनी रहती है।"
            </p>
            <p className="font-eng text-sm text-gray-500 mt-2 italic">
              "The devotee who receives Prasad with faith and love always remains blessed by God."
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#9A283D] to-[#F5A418] rounded-full mx-auto mt-4"></div>
          </div>
        </div> */}

      </div>

      {/* <Footer /> */}
    </>
  );
}
