import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { useNavigate } from "react-router-dom";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";
import { hindiCalendarSchema } from "../schemas/pageSchemas";
import SchemaMarkup from "../components/SchemaMarkup";
import { ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, IndianRupee, Search } from "lucide-react";

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

const sanitizeHindiName = (value) => String(value || "")
  .replace(/\//g, "")
  .replace(/[⁄∕／]/g, "/")
  .replace(/\(/g, "【")
  .replace(/\)/g, "】")
  .trim();

const getFestivalBadge = (festival) => {
  const name = sanitizeHindiName(festival?.name?.hi);

  if (name.includes("एकादशी")) return "एकादशी";
  if (name.includes("अमावस्या")) return "अमावस्या";
  if (name.includes("पूर्णिमा")) return "पूर्णिमा";
  if (name.includes("चतुर्थी")) return "चतुर्थी";
  if (name.includes("शिवरात्रि") || name.includes("व्रत")) return "व्रत";

  return festival?.accessType === "free" ? "त्योहार" : "व्रत";
};

const getFestivalSummary = (festival) => {
  const name = sanitizeHindiName(festival?.name?.hi);

  if (name.includes("अमावस्या")) return "स्नान, दान और पूजा विधि";
  if (name.includes("शिवरात्रि")) return "व्रत विधि, पूजा विधि और महत्व";

  return "व्रत विधि, कथा, मंत्र और महत्व";
};

const parseFestivalDate = (date) => {
  const [year, month, day] = String(date || "").split("-").map(Number);

  if (year && month && day) {
    return new Date(year, month - 1, day);
  }

  return new Date(date);
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
  const activeMonth = currentMonth || months?.[0];


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
      <SEO title="Best Hindu Calendar App | हिंदी पंचांग कैलेंडर डाउनलोड | भक्ति भाव" description="Hindi Calendar 2026 और Hindu Panchang ऐप डाउनलोड करें। सभी व्रत, त्योहार, शुभ मुहूर्त और चंद्र कैलेंडर की जानकारी एक जगह | भक्ति भाव" canonical="https://bhaktibhav.app/hindi-calendar" schema={homeSchema}/>
      <div className="min-h-screen w-full bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat font-devanagari text-[#9A283D]">
        <main className="container mx-auto flex max-w-md flex-col px-4 pb-10 pt-8 md:max-w-5xl">
          <header className="relative mb-11 rounded-[22px] bg-gradient-to-r from-[#F2A13A] to-[#FFF56A] px-4 py-3.5 shadow-[0_10px_24px_rgba(154,40,61,0.08)] sm:px-5">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.state && window.history.state.idx > 0) {
                      navigate(-1);
                    } else {
                      navigate("/");
                    }
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE8B5]/95 text-[#9A283D]"
                  aria-label="Back"
                >
                  <ChevronLeft size={27} strokeWidth={2.6} />
                </button>
                <h1 className="truncate text-[22px] font-bold leading-none">भक्ति भाव</h1>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]" aria-label="Search">
                  <Search size={24} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent(GA4Events.rupees_icon_clicked, { event_label: "rupees_icon_clicked_from_hindi_calendar" });
                    navigate(getTokenFromLS() ? "/payment" : "/login");
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]"
                  aria-label="Payment"
                >
                  <IndianRupee size={24} strokeWidth={2.7} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(getTokenFromLS() ? "/profile" : "/login")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]"
                  aria-label="Profile"
                >
                  <CircleUserRound size={26} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="absolute left-1/2 top-full flex h-[48px] w-[150px] -translate-x-1/2 -translate-y-[1px] items-center justify-center rounded-b-[20px] border-[3px] border-t-0 border-[#E65C21] bg-white text-center text-[18px] font-semibold leading-none shadow-[0_8px_18px_rgba(154,40,61,0.08)]">
              हिन्दी कैलेंडर
            </div>
          </header>

          <section>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-4">
              {months.map((m, idx) => {
                const monthData = m.month;
                const isActive = activeMonth?._id === m._id;

                return (
                  <li key={m._id || idx}>
                    <Link
                      onClick={() => { trackEvent(GA4Events.calendar_month_clicked, { event_label: "calendar_month_clicked_from_hindi_calendar", month: monthData.hi }); }}
                      to={`/hindi-calendar/${m._id || idx}`}
                      className={`flex h-[50px] items-center justify-center rounded-full border-2 text-[17px] font-semibold leading-none shadow-[0_7px_16px_rgba(154,40,61,0.04)] transition ${
                        isActive
                          ? "border-[#A72440] bg-[#A72440] text-white"
                          : "border-[#9A283D] bg-white text-[#9A283D] hover:bg-[#FFF7ED]"
                      }`}
                    >
                      {monthData.hi}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {activeMonth && (
            <section className="mt-7">
              <h2 className="mb-4 flex items-center gap-2 text-[24px] font-bold leading-none text-[#9A283D]">
                {activeMonth.month.hi} {activeMonth.year}
                <ChevronDown size={23} strokeWidth={2.8} />
              </h2>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeMonth.festivals.map((festival) => {
                  const dateObj = parseFestivalDate(festival.date);
                  const day = dateObj.getDate().toString().padStart(2, "0");
                  const weekdayHi = dateObj.toLocaleDateString("hi-IN", { weekday: "long" });
                  const festivalName = sanitizeHindiName(festival.name?.hi);
                  const badge = getFestivalBadge(festival);
                  const summary = getFestivalSummary(festival);

                  return (
                    <li key={festival._id}>
                      <button
                        type="button"
                        onClick={() => navigate(handleNavigate(festival.kathaId, festival.accessType, festival.date))}
                        className="flex min-h-[90px] w-full items-center rounded-2xl border border-[#F0E4DC] bg-white px-4 py-3.5 text-left text-[#9A283D] shadow-[0_8px_22px_rgba(154,40,61,0.05)] transition hover:border-[#9A283D]/50 hover:bg-[#FFFDF8]"
                      >
                        <span className="flex w-[76px] shrink-0 flex-col items-center justify-center">
                          <span className="font-eng text-[29px] font-bold leading-none">{day}</span>
                          <span className="mt-1.5 text-[14px] font-medium leading-relaxed">{weekdayHi}</span>
                        </span>

                        <span className="mx-3 h-12 w-px shrink-0 bg-[#E9DED8]" />

                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="min-w-0 max-w-full whitespace-normal break-words text-[18px] font-semibold leading-relaxed">{festivalName}</span>
                            <span className="max-w-full whitespace-normal break-words rounded-md bg-[#FFF0D1] px-2.5 py-1 text-xs font-semibold leading-normal text-[#8C652E]">{badge}</span>
                          </span>
                          <span className="mt-2 block whitespace-normal break-words text-[14px] font-normal leading-relaxed text-[#7B6A62]">{summary}</span>
                        </span>

                        <ChevronRight size={26} strokeWidth={2.6} className="ml-2 shrink-0 text-[#9A283D]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
