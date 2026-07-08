import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
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
import { mantraApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";

const MANTRA_CACHE_TTL = 5 * 60 * 1000;
const mantraCache = new Map();
const pendingMantraRequests = new Map();

const getMantraCacheKey = (version, page, limit, language) =>
  `mantra:${version}:${language}:${page}:${limit}`;

const getCachedMantras = async (cacheKey, fetcher) => {
  const cached = mantraCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < MANTRA_CACHE_TTL) {
    return cached.data;
  }

  mantraCache.delete(cacheKey);

  if (pendingMantraRequests.has(cacheKey)) {
    return pendingMantraRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      mantraCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    })
    .finally(() => {
      pendingMantraRequests.delete(cacheKey);
    });

  pendingMantraRequests.set(cacheKey, request);
  return request;
};

export default function Mantra() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const { language } = useContext(LanguageContext);
  const baseParams = useGA4BaseParams("Mantra Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);


  
const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getNameFromNameKey = (mantra, isHindi) => {
  if (typeof mantra.name === "string") {
    return mantra.name;
  }

  return isHindi
    ? (mantra.name?.hi || mantra.name?.en || "")
    : (mantra.name?.en || mantra.name?.hi || "");
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

const renderHinglishName = (mantra) => {
  const { hindiText, englishText } = getHinglishNameParts(mantra.name2 || "");

  if (!englishText) {
    return <span className="font-eng">{hindiText}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-lg leading-tight">{hindiText}</span>
      <span className="block font-eng text-xs leading-tight">{englishText}</span>
    </>
  );
};

const renderMantraName = (mantra, language) => {
  if (language === "hinglish") {
    return renderHinglishName(mantra);
  }

  return getNameFromNameKey(mantra, language === "hi");
};

const getMantraAltText = (mantra, language) => {
  if (language === "hinglish") {
    return stripHtmlTags(mantra.name2 || getNameFromNameKey(mantra, false));
  }

  return stripHtmlTags(getNameFromNameKey(mantra, language === "hi"));
};

  useEffect(() => {
    async function fetchItems() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        const version = "v3";
        const cacheKey = getMantraCacheKey(version, currentPage, limit, language);
        const json = await getCachedMantras(cacheKey, () =>
          mantraApis.getMantras(version, currentPage, limit, language)
        );

        const dataArray = Array.isArray(json.data?.data) ? json.data.data : Array.isArray(json.data) ? json.data : [];
        const totalPages = json.pagination?.totalPages ?? 1;

        if (json.status === "success" && dataArray.length >= 0) {
          if (currentPage === 1) {
            setItems(dataArray);
          } else {
            setItems(prevItems => [...prevItems, ...dataArray]);
          }

          // Check if there's more data using pagination info
          if (currentPage >= totalPages || dataArray.length < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) {
            setItems([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("API Error:", error);
        if (currentPage === 1) {
          setItems([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchItems();
  }, [currentPage, language]);

  // Reset list when language changes
  useEffect(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [language]);

  // Infinite scroll handler with throttling for better performance
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

  const handleTrackEvent = (id, mantra) => {
      trackEvent(GA4Events.mantra_selected, { event_label: "mantra_selected_from_mantra_list", mantraName: mantra, mantraId: id });
  }

  // Memoized navigation handler
  const handleNavigation = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/mantra/${id}`;
    } else {
      if (accessType === "free") {
         return `/mantra/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!items.length) return <p className="text-center py-10 theme_text font-eng">❌ No mantras found</p>;

  return (
    <>
    <SEO title = "Mantra App Free Download – Hindu Mantras & Meditation | भक्ति भाव" description="Install free mantra app for meditation, stress relief & inner peace. Explore Hindu mantra chanting in Hindi with powerful daily mantras. Start your spiritual journey with Bhakti Bhav." canonical="https://bhaktibhav.app/mantra" schema={homeSchema}/>
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-hindi text-white">
      <Header />

      <PageTitleCard
        titleHi={"ea="}
        titleEn={"Mantra"}
        isHinglishLanguageSelected={language === "hinglish"}
        customEngFontSize={"18px"}
        customFontSize={"23px"}

      />

      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item._id}>
              <Link

                to={handleNavigation(item._id, item.accessType)}
                onClick = {() => handleTrackEvent(item._id, item.name)}
                className="theme_bg bg-white rounded-xl shadow p-4 text-center hover:bg-yellow-50 transition flex flex-col"
              >
                <div className={`w-full h-36 flex items-center justify-center ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}>
                  <img
                    src={item.imagethumb || "/img/default-mantra.png"}
                    alt={getMantraAltText(item, language)}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-2">
                  <h2 className={`font-semibold mt-1 text-center leading-snug ${language === "hinglish" ? "" : language === "hi" ? "font-hindi text-lg" : "font-eng text-sm"} ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}>
                    {renderMantraName(item, language)}
                  </h2>
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
        {/* {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी मंत्र लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Mantras loaded</p>
          </div>
        )} */}

      </div>


    </div>
    </>
  );
}
