import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";
import { naamJaapApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { jaapMalaSchema } from "../schemas/pageSchemas";
import SchemaMarkup from "../components/SchemaMarkup";

const JAAP_MALA_CACHE_TTL = 5 * 60 * 1000;
const jaapMalaCache = new Map();
const pendingJaapMalaRequests = new Map();

const getJaapMalaCacheKey = (version, page, limit, language) =>
  `jaap-mala:${version}:${language}:${page}:${limit}`;

const getCachedJaapMalaData = async (cacheKey, fetcher) => {
  const cached = jaapMalaCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < JAAP_MALA_CACHE_TTL) {
    return cached.data;
  }

  jaapMalaCache.delete(cacheKey);

  if (pendingJaapMalaRequests.has(cacheKey)) {
    return pendingJaapMalaRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      jaapMalaCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    })
    .finally(() => {
      pendingJaapMalaRequests.delete(cacheKey);
    });

  pendingJaapMalaRequests.set(cacheKey, request);
  return request;
};

function JaapMala() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  const { language } = useContext(LanguageContext);

  const baseParams = useGA4BaseParams("Jaap Mala Screen");
  const { trackEvent } = useGA4Tracker(baseParams);


  const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getNameFromNameKey = (aarti, isHindi) => {
  if (typeof aarti.name === "string") {
    return aarti.name;
  }

  // writing this to show the name in the selected language, if not available then show the other language
  return isHindi
    ? (aarti.name?.hi || aarti.name?.en || "")
    : (aarti.name?.en || aarti.name?.hi || "");
};

const getHinglishNameParts = (name) => {
  const lines = stripHtmlTags(name)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    hindiText: lines[0] || "",
    englishText: lines.slice(1).join(" ")
  };
};

const renderHinglishName = (aarti) => {
  console.log(aarti.title2, aarti, data, "This is the name that we are seeing.....");
  const { hindiText, englishText } = getHinglishNameParts(aarti.title2 || "");

  if (!englishText) {
    return <span className="font-eng">{hindiText}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-lg leading-tight">{HindiWithEnglishNumbers(hindiText)}</span>
      <span className="block font-eng text-sm leading-tight">{englishText}</span>
    </>
  );
};


  useEffect(() => {
    const fetchJaapMalaData = async () => {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        
        const version = "v3";
        const cacheKey = getJaapMalaCacheKey(version, currentPage, limit, language);
        const result = await getCachedJaapMalaData(cacheKey, () =>
          naamJaapApis.getNaamJaapData(version, currentPage, limit, language)
        );

        const dataArray = Array.isArray(result.data?.items) ? result.data.items : Array.isArray(result.data?.data) ? result.data.data : Array.isArray(result.data) ? result.data : [];
        const totalPages = result.pagination?.totalPages ?? 1;

        if (result.status === "success" && dataArray.length >= 0) {
          if (currentPage === 1) {
            setData(dataArray);
          } else {
            setData(prevData => [...prevData, ...dataArray]);
          }

          if (currentPage >= totalPages || dataArray.length < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) {
            setData([]);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
        if (currentPage === 1) {
          setData([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchJaapMalaData();
  }, [currentPage, language]);

  // Reset list when language changes
  useEffect(() => {
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [language]);

  // Infinite scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && hasMore && !loadingMore && !loading) {
            setCurrentPage(prev => prev + 1);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading]);

  // Memoized navigation handler
  const handleNavigate = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/jaapmala/${id}`;
    } else {
      if (accessType === "free") {
        return `/jaapmala/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  const handleTrackEvent = useCallback((id, nameEn, accessType) => {
    console.log("[JaapMala] Card clicked → id:", id, "| nameEn:", nameEn, "| accessType:", accessType, "| isSubscribed:", isSubscribed);
    if (isSubscribed || accessType === "free") {
      const eventParams = { jaapMalaId: id, event_label: `jaap_mala_${nameEn}_clicked` };
      console.log("[JaapMala] Firing GA4 event:", GA4Events.jaap_mala_selected, eventParams);
      trackEvent(GA4Events.jaap_mala_selected, eventParams);
    } else {
      console.log("[JaapMala] Skipping GA4 event — user not subscribed and content is paid.");
    }
  }, [isSubscribed, trackEvent]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Render Hindi text but keep digits in their original English numeral form
  const HindiWithEnglishNumbers = (text) => {
    if (typeof text !== "string") {
      console.warn("[HindiWithEnglishNumbers] Expected string but got:", typeof text, text);
      return null;
    }
    // Split on digit sequences, keeping them in the result array
    const parts = text.split(/(\d+)/);
    return (
      <h2 className="text-xl font-bold">
        {parts.map((part, index) =>
          /^\d+$/.test(part) ? (
            <span key={index} className="font-eng">{part}</span>
          ) : (
            <span key={index} className="font-hindi" style={{ fontSize: "18px" }}>{part}</span>
          )
        )}
      </h2>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>


    <SchemaMarkup schema={jaapMalaSchema} />
    <SEO title = "Best Jaap Mala Counter App – Digital Chanting Beads & Jap | भक्ति भाव" description="Track your mantra chanting with a digital mala jap app. Supports 5 mukhi, 9 mukhi Rudraksha, Tulsi mala and more. Simple, accurate and भक्तिमय experience." canonical="https://bhaktibhav.app/jaap-mala" schema={homeSchema} />
      <Header pageName={{ hi: "tkkp ekyk", en: "Jaap mala" }} />
      <PageTitleCard
        titleHi={"uke tki"}
        titleEn={"Naam Jaap"}
        isHinglishLanguageSelected={language==='hinglish'}
        // customEngFontSize={"18px"}
        customEngFontSize={language === "hinglish" ? "16px" : "18px"}
        customFontSize={"23px"}
      />

      <div className="container mx-auto px-4">

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((item) => (
            <li key={item._id}>
              <Link
                to={handleNavigate(item._id, item.accessType)}
                onClick={() => { handleTrackEvent(item._id, item.title, item.accessType); }}
                className="relative block rounded-xl overflow-hidden shadow-lg  "
              >
                <div className={`overflow_bg ${language === "hinglish" ? "jaapmala-hinglish-title" : ""}`}>

                  <img
                    src={
                      item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : `https://api.bhaktibhav.app${item.imageUrl}`
                    }
                    alt={item.title || ""}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 ${
    language === "hinglish" ? "top-[52%]" : "top-[60%]"
  } ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                    {language === "hi"
                      ? HindiWithEnglishNumbers(item.title)
                      : language === "hinglish"
                        ? <h2 className="text-xs font-eng leading-snug">{renderHinglishName(item)}</h2>
                        : <h2 className="text-sm font-eng leading-snug">{item.title}</h2>
                    }
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading more...</span>
          </div>
        )}
        
        {/* No more data indicator */}
        {/* {!hasMore && data.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी जप माला लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Jaap Mala loaded</p>
          </div>
        )} */}
      </div>

    </>
  );
}

export default JaapMala;
