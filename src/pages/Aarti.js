import { useEffect, useState, useMemo, useCallback, useContext } from "react";
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
import { aartiApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";

const AARTI_CACHE_TTL = 5 * 60 * 1000;
const aartiCache = new Map();
const pendingAartiRequests = new Map();

const getAartiCacheKey = (version, page, limit, language) =>
  `aarti:${version}:${language}:${page}:${limit}`;

const getCachedAartis = async (cacheKey, fetcher) => {
  const cached = aartiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < AARTI_CACHE_TTL) {
    return cached.data;
  }

  aartiCache.delete(cacheKey);

  if (pendingAartiRequests.has(cacheKey)) {
    return pendingAartiRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      aartiCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    })
    .finally(() => {
      pendingAartiRequests.delete(cacheKey);
    });

  pendingAartiRequests.set(cacheKey, request);
  return request;
};



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
  const { hindiText, englishText } = getHinglishNameParts(aarti.name2 || "");

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


export default function Aarti() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of items per page

  const baseParams = useGA4BaseParams("Aarti Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  const { language } = useContext(LanguageContext);

  useEffect(() => {
    async function fetchItems() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        const version = "v3";
        const cacheKey = getAartiCacheKey(version, currentPage, limit, language);
        const json = await getCachedAartis(cacheKey, () =>
          aartiApis.getAartis(version, currentPage, limit, language)
        );

        const dataArray = Array.isArray(json.data?.items) ? json.data.items
          : Array.isArray(json.data?.data) ? json.data.data
          : Array.isArray(json.data) ? json.data : [];
        const totalPages = json.pagination?.totalPages ?? 1;

        if (json?.status === "success") {
          if (currentPage === 1) {
            setItems(dataArray);
          } else {
            setItems(prevItems => [...prevItems, ...dataArray]);
          }

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
      return `/aarti/${id}`;
    } else {
      if (accessType === "free") {
        return `/aarti/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!items.length)
    return <p className="text-center py-10 theme_text">❌ No items found</p>;
  return (
    <>
      <SEO title="Aarti App Download – लक्ष्मी, वैष्णो देवी, सत्यनारायण आरती | भक्ति भाव" description="सभी देवी-देवताओं की आरती पढ़ने और सुनने के लिए Aarti App डाउनलोड करें – विष्णु, लक्ष्मी, संतोषी माता, सरस्वती और सत्यनारायण। | भक्ति भाव" canonical="https://bhaktibhav.app/aarti" schema={homeSchema} />
      <Header pageName={{ hi: "vkjrh", en: "Aarti" }} />

      <PageTitleCard
        titleHi={"vkjrh"}
        titleEn={"Aarti"}
        isHinglishLanguageSelected={language === 'hinglish'}
        customEngFontSize={"18px"}
        customFontSize={"23px"}
      />

      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item, idx) => {
            const imgSrc = item.imagethumb
              ? item.imagethumb.startsWith("http")
                ? item.imagethumb
                : `https://api.bhaktibhav.app${item.imagethumb}`
              : "/img/default-aarti.png";

            return (
              <li key={item._id || idx}>
                <Link
                  to={handleNavigate(item._id, item.accessType)}
                  className="relative block rounded-xl overflow-hidden shadow-lg"
                >
                  <div className={`overflow_bg ${language === "hinglish" ? "aarti-hinglish-title" : ""}`}>
                    <img
                      src={imgSrc}
                      alt={typeof item.name === "string" ? item.name : (language === "hi" ? (item.name?.hi || item.name?.en || "Aarti") : (item.name?.en || item.name?.hi || "Aarti"))}
                      // alt={language === "hinglish" ? stripHtmlTags(aarti.name2 || "") : stripHtmlTags(getNameFromNameKey(aarti, language === "hi"))}
                    
                      className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 ${language==='hinglish' ? 'top-[52%]' : 'top-[60%]'} ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                      {(() => {
                        const isHindi = language === "hi";
                        // const displayName = typeof item.name === "string"
                        //   ? item.name
                        //   : (isHindi ? (item.name?.hi || item.name?.en || "") : (item.name?.en || item.name?.hi || ""));
                         const displayName = getNameFromNameKey(item, isHindi);
                        return (
                          // <h2 className={`text-lg font-bold ${isHindi ? "font-hindi" : "font-eng text-sm"}`}>
                          //   {displayName}
                          // </h2>
                          <h2 className={`font-semibold pt-2 ${language === "hinglish" ? "text-center" : "truncate md:text-lg text-lg"} ${isHindi ? "font-hindi" : "font-eng text-sm"} ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                        {language === "hinglish" ? renderHinglishName(item) : displayName}
                      </h2>
                        );
                      })()}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
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
      {/* {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-gray-500 font-eng">
          No more आरती to load
        </div>
      )} */}


    </>
  );
}
