import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

export default function HindiCalendar() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/panchang-calendar");
        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          setMonths(json.data);
        } else {
          setMonths([]);
        }
      } catch (error) {
        console.error("API Error:", error);
        setMonths([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

 if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!months.length) return <p className="text-center py-10 text-white">❌ No data found</p>;

const currentMonthNumber = new Date().getMonth() + 1; // JS gives 0–11
const currentYear = new Date().getFullYear();
 
const currentMonth = months.find(
  (m) => m.monthNumber === currentMonthNumber && m.year === currentYear
);

  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full text-white font-kruti">
      <Header />

      <div className="flex justify-center items-center">
        <p className="mb-0 text-xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
          fgUnh dySUMj
          <span className="font-eng text-sm ml-2">(Hindi Calendar)</span>
        </p>
      </div>

      <main className="px-4 mt-6">
        <div className="container mx-auto">
          {/* Month buttons */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {months.map((m, idx) => {
              const monthData = JSON.parse(m.month);
              return (
                <li key={m._id}>
                  <Link
                    to={`/hindi-calendar/${m._id || idx}`}
                    className="theme_bg bg-white rounded-full shadow md:p-4 p-3 text-center hover:bg-yellow-50 transition flex flex-col"
                  >
                    {monthData.hi} <span className="font-eng">({monthData.en})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
 
          {currentMonth && (
            <section className="mt-6 px-4">
              <h3 className="theme_text font-semibold mb-3 current_mont text-3xl">
                {JSON.parse(currentMonth.month).hi}{" "}
                <span className="font-eng text-sm">({currentMonth.year})</span>
              </h3>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentMonth.festivals.map((festival) => {
                  const dateObj = new Date(festival.date);
                  const day = dateObj.getDate().toString().padStart(2, "0");
                  const weekday = dateObj.toLocaleDateString("hi-IN", {
                    weekday: "long",
                  });

                  return (
                    <li
                      key={festival._id}
                      className="bg-[#9A283D] text-white rounded-lg flex items-center justify-between px-4 py-3 shadow-md"
                    > 
                      <div className="flex flex-col items-start text-sm font-medium">
                        <span className="text-lg font-bold font-eng">{day}</span>
                        <span className="text-xs">{weekday}</span>
                      </div>

                      <div className="w-px h-10 bg-white/50 mx-3"></div>
 
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold">{festival.name.hi}</span>
                        <span className="text-xs text-gray-200 font-eng">
                          {festival.name.en}
                        </span>
                      </div>

                      <div className="ml-3">
                        <span className="text-xl font-eng">›</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
