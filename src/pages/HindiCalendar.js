import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { useNavigate } from "react-router-dom";

export default function HindiCalendar() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/panchang-calendar");
        const json = await res.json();
        console.log("Calendar data", json);

        if (json.status === "success" && json.data && Array.isArray(json.data.data)) {
          setMonths(json.data.data);
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
  // if (!months.length) return <p className="text-center py-10 text-white">❌ No data found</p>;

  const currentMonthNumber = new Date().getMonth() + 1; // JS gives 0–11
  const currentYear = new Date().getFullYear();

  const currentMonth = months?.find(
    (m) => m.monthNumber === currentMonthNumber && m.year === currentYear
  );


  const handleNavigate = (id, accessType) => {
    if (getSubscriptionStatusFromLS()) {
      if (id) {

        return `/vrat-katha/${id}`;
      }
      else {
        alert("No Kath available for this festival");
        return "/hindi-calendar";
      }
    }
    else {
      if (accessType === "free") {
        if (id) {

          return `/vrat-katha/${id}`;
        }
        else {
          alert("No Kath available for this festival");
          return "/hindi-calendar";
        }
      }
      else {
        if (getTokenFromLS()) {
          return "/payment";
        }
        else {
          return "/login";
        }
      }
    }
  }



  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full text-white font-kruti">
      <Header />

      <PageTitleCard
        titleHi={"fgUnh dySaMj"}
        titleEn={"Hindi Calender"}
        customEngFontSize={"13px"}
        customFontSize={"21px"}

      />

      <div className="px-4 mt-6">
        <div className="container mx-auto">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {months.map((m, idx) => {
              const monthData = m.month;
              console.log("Month data:", m, "Type:", typeof monthData);
              return (
                <li key={m._id}>
                  <Link
                    to={`/hindi-calendar/${m._id || idx}`}
                    className={`theme_bg bg-white rounded-full shadow md:p-4 p-3 text-center hover:bg-yellow-50 transition flex flex-col`}
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
                {currentMonth.month.hi}{" "}
                <span className="font-eng text-sm">({currentMonth.year})</span>
              </h3>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentMonth.festivals.map((festival) => {
                  const dateObj = new Date(festival.date);
                  const day = dateObj.getDate().toString().padStart(2, "0");

                  const weekdayHi = dateObj.toLocaleDateString("hi-IN", { weekday: "long" });
                  const weekdayEn = dateObj.toLocaleDateString("en-US", { weekday: "long" });

                  return (
                    <li
                      key={festival._id}
                      onClick={
                        () => navigate(handleNavigate(festival.kathaId, festival.accessType))}
                      className={`bg-[#9A283D] text-white rounded-lg flex items-center px-4 py-3 shadow-md  ${getSubscriptionStatusFromLS() ? "" : festival.accessType === "paid" ? "blur-sm" : ""}`}
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
                        <span className="text-lg font-hindi">{festival.name.hi.replace(/\//g, "").replace(/[⁄∕／]/g, "/")}</span>
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



            </section>
          )}
        </div>
      </div>


    </div>
  );
}
