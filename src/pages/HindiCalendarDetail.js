import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { useNavigate } from "react-router-dom";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";

function HindiCalendarDetail() {
  const { id } = useParams();
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const dayData = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    if (!id) return;

    async function fetchMonth() {
      try {
        const res = await fetch(`https://api.bhaktibhav.app/frontend/panchang-calendar/${id}`);
        const json = await res.json();

        if (json) {
          setMonth(json);
        } else {
          setMonth(null);
        }
      } catch (err) {
        console.error("❌ Error fetching month by ID:", err);
        setMonth(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMonth();
  }, [id]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!month) return <p className="text-center mt-10 text-white">❌ Month not found</p>;

  let monthName = { hi: "अज्ञात", en: "Unknown" };
  try {
    monthName = typeof month.month === "string" ? JSON.parse(month.month) : month.month;
  } catch (e) {
    console.warn("⚠️ Could not parse month name", e);
  }


  const handleNavigate = (kathaId, accessType) => {
    if(getSubscriptionStatusFromLS()) {
      if(kathaId) {
      return `/vrat-katha/${kathaId}`;
      }
      else {
        alert("No Kath available for this festival");
        return `/hindi-calendar/${id}`;
      }
    }
    else {
      if(accessType === "free") {
        if(kathaId) {
          return `/vrat-katha/${kathaId}`;

        }
        else {
          alert("No Kath available for this festival");
          return `/hindi-calendar/${id}`;
        }
      }
      else {
        if(getTokenFromLS()) {
          return "/payment";
        }
        else {
          return "/login";
        }
      }
    }
  }

  return (
    <>
      <Header pageName={{ hi: "fgUnh dySaMj", en: "Hindi Calender" }} />

      <PageTitleCard
        titleHi={"fgUnh dySaMj"}
        titleEn={"Hindi Calender"}

      />

      <div className="px-4 mt-6">
        <h2 className="theme_text text-2xl font-bold mb-4">
          {monthName.hi}{" "}
          <span className="font-eng">({monthName.en}) – {month.year}</span>
        </h2>

        {month.imageUrl && (
          <div className="mb-6">
            <img
              src={month.imageUrl}
              alt={`${monthName.en} Calendar`}
              className="rounded-lg shadow-md w-full max-w-md mx-auto"
            />
          </div>
        )}

        {/* Festivals */}
        {month.festivals?.length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {month.festivals.map((festival) => {
              const dateObj = new Date(festival.date);
              const day = dateObj.getDate().toString().padStart(2, "0");

              const weekdayHi = dateObj.toLocaleDateString("hi-IN", { weekday: "long" });
              const weekdayEn = dateObj.toLocaleDateString("en-US", { weekday: "long" });

              return (
                <li
                  onClick={() => navigate(handleNavigate(festival.kathaId, festival.accessType))}
                  key={festival._id}
                  className={`bg-[#9A283D] text-white rounded-lg flex items-center px-4 py-3 shadow-md ${getSubscriptionStatusFromLS() ? "" : festival.accessType === "paid" ? "blur" : ""}`}
                >
                  <div className="flex items-center text-sm font-medium w-1/2">
                    <div className="text-lg font-bold font-eng mr-2">{day}</div>
                    <div>
                      <p className="font-hindi text-lg">{weekdayHi}</p>
                      <p className="font-eng text-sm">({weekdayEn})</p>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/50 mx-3"></div>

                  <div className="flex flex-col w-[70%]">
                    <span className="text-lg font-hindi">{festival.name.hi.replace(/:/g, "ः")         // Replace colon with visarga
                    .replace(/ँ/g, "ं")          // Normalize chandrabindu if misencoded
                    .replace(/\u200D|\u200C/g, "").replace(/[.,;!?'"“”‘’]/g, "")    // Remove English punctuation
    .replace(/[\[\]{}()]/g, "")       // Remove brackets and parentheses
    .replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ")// Remove zero-width joiners
                    .normalize("NFC")}</span>
                    <span className="text-sm font-eng">
                      {festival.name.en}
                    </span>
                  </div>

                  <div className="ml-3">
                    <span className="text-3xl font-eng">›</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">📭 No festivals this month.</p>
        )}
      </div>


    </>
  );
}

export default HindiCalendarDetail;
