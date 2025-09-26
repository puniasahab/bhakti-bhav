import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function HindiCalendarDetail() {
  const { id } = useParams();
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const dayData = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    if (!id) return;

    async function fetchMonth() {
      try {
        const res = await fetch(`https://api.bhaktibhav.app/frontend/panchang-calendar/${id}`);
        const json = await res.json();

        if (json?.status === "success" && json.data) {
          setMonth(json.data);
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

  if (loading) return <p className="text-center mt-10 text-white">⏳ Loading...</p>;
  if (!month) return <p className="text-center mt-10 text-white">❌ Month not found</p>;

  let monthName = { hi: "अज्ञात", en: "Unknown" };
  try {
    monthName = JSON.parse(month.month);
  } catch (e) {
    console.warn("⚠️ Could not parse month name", e);
  }

  return (
    <>
      <Header />

      <div className="px-4 mt-6">
        <h2 className="theme_text text-2xl font-bold mb-4">
          {monthName.hi} <span className="font-eng">({monthName.en}) – {month.year}</span>
        </h2>

        {month.festivals?.length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {month.festivals.map((festival) => {
              const dateObj = new Date(festival.date);
              const day = dateObj.getDate().toString().padStart(2, "0");
              const weekday = dayData[dateObj.getDay()];

              return (
                <li
                  key={festival._id}
                  className="bg-[#9A283D] text-white rounded-lg flex items-center justify-between px-4 py-3 shadow-md"
                >
                  <div className="flex flex-col items-start text-sm font-medium">
                    <span className="text-lg font-eng">{day}</span>
                    <span className="text-xs font-eng">{weekday}</span>
                  </div>

                  <div className="w-px h-10 bg-white/50 mx-3"></div>

                  <div className="flex flex-col flex-1">
                    <span className="font-semibold">{festival.name.hi}</span>
                    <span className="text-xs text-gray-200 font-eng">{festival.name.en}</span>
                  </div>

                  <div className="ml-3">
                    <span className="text-xl font-eng">›</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">No festivals this month.</p>
        )}
      </div>

      <Footer />
    </>
  );
}

export default HindiCalendarDetail;
