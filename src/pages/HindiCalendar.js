import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { useNavigate } from "react-router-dom";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";
import { hindiCalendarSchema } from "../schemas/pageSchemas";
import SchemaMarkup from "../components/SchemaMarkup";

const HINDI_CALENDAR_CACHE_KEY = "hindi-calendar:panchang-calendar";
const HINDI_CALENDAR_CACHE_TTL = 5 * 60 * 1000;
const hindiCalendarCache = new Map();
const pendingHindiCalendarRequests = new Map();

const getValidCachedCalendar = () => {
  const cached = hindiCalendarCache.get(HINDI_CALENDAR_CACHE_KEY);

  if (cached && Date.now() - cached.timestamp < HINDI_CALENDAR_CACHE_TTL) {
    return cached.data;
  }

  hindiCalendarCache.delete(HINDI_CALENDAR_CACHE_KEY);
  return null;
};

const fetchCachedCalendar = async () => {
  const cached = getValidCachedCalendar();

  if (cached) {
    return cached;
  }

  if (pendingHindiCalendarRequests.has(HINDI_CALENDAR_CACHE_KEY)) {
    return pendingHindiCalendarRequests.get(HINDI_CALENDAR_CACHE_KEY);
  }

  const request = fetch("https://api.bhaktibhav.app/frontend/panchang-calendar")
    .then((res) => res.json())
    .then((json) => {
      hindiCalendarCache.set(HINDI_CALENDAR_CACHE_KEY, {
        data: json,
        timestamp: Date.now()
      });
      return json;
    })
    .finally(() => {
      pendingHindiCalendarRequests.delete(HINDI_CALENDAR_CACHE_KEY);
    });

  pendingHindiCalendarRequests.set(HINDI_CALENDAR_CACHE_KEY, request);
  return request;
};

const getCalendarMonths = (json) => {
  if (json?.status === "success" && json.data && Array.isArray(json.data.data)) {
    return json.data.data;
  }

  return [];
};

export default function HindiCalendar() {
  const cachedCalendar = getValidCachedCalendar();
  const [months, setMonths] = useState(() => getCalendarMonths(cachedCalendar));
  const [loading, setLoading] = useState(!cachedCalendar);
  const navigate = useNavigate();

  const baseParams = useGA4BaseParams("Hindi Calendar Screen");
  const { trackEvent } = useGA4Tracker(baseParams);
  useEffect(() => {
    async function fetchCalendar() {
      try {
        if (!getValidCachedCalendar()) {
          setLoading(true);
        }

        const json = await fetchCachedCalendar();
        console.log("Calendar data", json);

        setMonths(getCalendarMonths(json));
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


  const handleNavigate = (id, accessType, date) => {
    if (getSubscriptionStatusFromLS()) {
      if (id) {
        trackEvent(GA4Events.calendar_festival_date_clicked, { event_label: "calendar_festival_date_clicked_from_hindi_calendar", festival_id: id });
        return `/vrat-katha/${id}/date/${date}`;
      }
      else {
        alert("No Kath available for this festival");
        return "/hindi-calendar";
      }
    }
    else {
      if (accessType === "free") {
        if (id) {

          return `/vrat-katha/${id}/date/${date}`;
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
    <>
    <SchemaMarkup schema={hindiCalendarSchema} />
    <SEO title="Best Hindu Calendar App | हिंदी पंचांग कैलेंडर डाउनलोड | भक्ति भाव"  description="Hindi Calendar 2026 और Hindu Panchang ऐप डाउनलोड करें। सभी व्रत, त्योहार, शुभ मुहूर्त और चंद्र कैलेंडर की जानकारी एक जगह | भक्ति भाव" canonical="https://bhaktibhav.app/hindi-calendar" schema={homeSchema}/>
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full text-white font-kruti">
      <Header />
    <div className="h-1"></div>
      <PageTitleCard
        titleHi={"fgUnh dySaMj"}
        titleEn={"Hindi Calender"}
        customEngFontSize={"18px"}
        customFontSize={"23px"}

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
                    onClick= {() => {trackEvent(GA4Events.calendar_month_clicked, { event_label: "calendar_month_clicked_from_hindi_calendar", month: monthData.hi })}}
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
                        () => navigate(handleNavigate(festival.kathaId, festival.accessType, festival.date))}
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
                        <span className="text-lg font-hindi">{festival.name.hi.replace(/\//g, "").replace(/[⁄∕／]/g, "/").replace(/\(/g, "【")
  .replace(/\)/g, "】")}</span>
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
    </>
  );
}
