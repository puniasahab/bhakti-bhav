import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";
import { chalisaApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";

export default function Chalisa() {
  const [chalisa, setChalisa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of items per page

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  const { language } = useContext(LanguageContext);

  const baseParams = useGA4BaseParams("Chalisa Screen");
  const { trackEvent } = useGA4Tracker(baseParams);
  // useEffect(() => {
  //   trackEvent("chalisa_widget_clicked", {
  //     event_label: "chalisa_screen_visited"
  //   })
  // }, []);

  useEffect(() => {
    async function fetchChalisa() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        // Use chalisaApis for fetching
        const json = await chalisaApis.getChalisas("v3", currentPage, limit, language);

        const dataArray = Array.isArray(json.data?.items) ? json.data.items
          : Array.isArray(json.data?.data) ? json.data.data
          : Array.isArray(json.data) ? json.data : [];
        const totalPages = json.pagination?.totalPages ?? 1;

        if (json.status === "success" && dataArray.length >= 0) {
          if (currentPage === 1) {
            setChalisa(dataArray);
          } else {
            setChalisa(prevChalisa => [...prevChalisa, ...dataArray]);
          }

          if (currentPage >= totalPages || dataArray.length < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) {
            setChalisa([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("API Error:", error);
        if (currentPage === 1) {
          setChalisa([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchChalisa();
  }, [currentPage, language]);

  // Reset list when language changes
  useEffect(() => {
    setChalisa([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [language]);

  // Infinite scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = window.innerHeight;

          if (scrollTop + clientHeight >= scrollHeight - 100) {
            setLoadingMore(true);
            setCurrentPage(prevPage => prevPage + 1);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  // Memoized navigation handler
  const handleNavigate = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/chalisa/${id}`;
    } else {
      if (accessType === "free") {
        return `/chalisa/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!chalisa.length) return <p className="text-center py-10">❌ No chalisa found</p>;

  return (
    <>
      <SEO title="Download Chalisa App – Hanuman, Shani Dev, Lakshmi, Kali Chalisa | भक्ति भाव" description="Get all Chalisa in one app – Hanuman, Shiv, Durga, Ganesh, Lakshmi, Kali & Shani Chalisa with path guide. Simple, fast & devotional experience. Download now! | भक्ति भाव" canonical="https://bhaktibhav.app/chalisa" schema={homeSchema} />
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} />
      <div className="h-1"></div>
      <PageTitleCard
        titleHi={"चालीसा"}
        titleEn={"Chalisa"}
        customFontSize={"18px"}
        customEngFontSize={"13px"}

      />

      {/* Katha Grid */}
      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {chalisa.map((chalisa) => (
            <li key={chalisa._id}>
              <Link
                to={handleNavigate(chalisa._id, chalisa.accessType)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden"
              >
                <div className="w-full h-40 flex items-center justify-center">
                  <img
                    src={chalisa.imagethumb?.startsWith("http")
                      ? chalisa.imagethumb
                      : `https://api.bhaktibhav.app${chalisa.imagethumb}`
                    }
                    alt={typeof chalisa.name === "string" ? chalisa.name : (chalisa.name?.hi || chalisa.name?.en || "")}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${isSubscribed ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="px-3 py-4">
                  {(() => {
                    const isHindi = language === "hi";
                    const displayName = typeof chalisa.name === "string"
                      ? chalisa.name
                      : (isHindi ? (chalisa.name?.hi || chalisa.name?.en || "") : (chalisa.name?.en || chalisa.name?.hi || ""));
                    return (
                      <h2 className={`md:text-lg text-lg font-semibold truncate pt-2 ${isHindi ? "font-hindi" : "font-eng text-sm"} ${isSubscribed ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}>
                        {displayName}
                      </h2>
                    );
                  })()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A283D]"></div>
          <span className="ml-2 text-[#9A283D] font-eng">Loading more...</span>
        </div>
      )}

      {/* End of data indicator */}
      {/* {!hasMore && chalisa.length > 0 && (
        <div className="text-center py-4 text-gray-500 font-eng">
          No more चालीसा to load
        </div>
      )} */}


    </>
  );
}
