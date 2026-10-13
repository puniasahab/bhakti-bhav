import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import { vratKathaApis } from "../api";
import SEO from "../components/SEO";
import { LanguageContext } from "../contexts/LanguageContext";
import { vratKathaSchema } from "../schemas/pageSchemas";
import SchemaMarkup from "../components/SchemaMarkup";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { homeSchema } from "../seo/schemas";

const VRAT_KATHA_CACHE_TTL = 5 * 60 * 1000;
const vratKathaPageCache = new Map();
const pendingVratKathaRequests = new Map();

const getVratKathaCacheKey = (version, page, limit, language) =>
  `vrat-katha:${version}:${language}:${page}:${limit}`;

const getValidCachedVratKatha = (cacheKey) => {
  const cached = vratKathaPageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < VRAT_KATHA_CACHE_TTL) {
    return cached.data;
  }
  vratKathaPageCache.delete(cacheKey);
  return null;
};

const getCachedVratKatha = async (cacheKey, fetcher) => {
  const cached = getValidCachedVratKatha(cacheKey);
  if (cached) return cached;

  if (pendingVratKathaRequests.has(cacheKey)) {
    return pendingVratKathaRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      vratKathaPageCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      pendingVratKathaRequests.delete(cacheKey);
    });

  pendingVratKathaRequests.set(cacheKey, request);
  return request;
};

const getVratKathaItems = (json) => (Array.isArray(json?.data) ? json.data : []);
const hasMoreVratKatha = (json, limit) => getVratKathaItems(json).length >= limit;

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const formatHindiName = (name) => String(name || "").trim();

const getHinglishNameParts = (name) => {
  const lines = stripHtmlTags(name)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hindiText = lines[0] || "";
  const englishText = lines.slice(1).join(" ");
  return {
    hindiText,
    englishText: englishText
      ? englishText.startsWith("(") && englishText.endsWith(")")
        ? englishText
        : `(${englishText.replace(/^\(|\)$/g, "").trim()})`
      : "",
  };
};

const renderVratKathaName = (katha, language) => {
  if (language === "hi") return formatHindiName(katha.name);
  if (language !== "hinglish") return katha.name;

  const { hindiText, englishText } = getHinglishNameParts(katha.name2 || katha.name);
  if (!englishText) return <span className="font-eng">{hindiText}</span>;

  return (
    <>
      <span className="block font-hindi text-lg md:text-xl leading-tight">{hindiText}</span>
      <span className="block font-eng text-xs md:text-sm leading-tight">{englishText}</span>
    </>
  );
};

const getVratKathaAltText = (katha, language) => {
  if (language === "hinglish") return stripHtmlTags(katha.name2 || katha.name);
  return stripHtmlTags(katha.name);
};

export default function VratKatha() {
  const navigate = useNavigate();
  const limit = 10;
  const { language } = useContext(LanguageContext);
  const firstPageCacheKey = getVratKathaCacheKey("v3", 1, limit, language);
  const cachedFirstPage = getValidCachedVratKatha(firstPageCacheKey);
  const cachedFirstPageItems = getVratKathaItems(cachedFirstPage);
  const [kathas, setKathas] = useState(cachedFirstPageItems);
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(() =>
    cachedFirstPage ? hasMoreVratKatha(cachedFirstPage, limit) : true
  );

  const baseParams = useGA4BaseParams("Vrat Katha Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);
  const { setCategoryData } = useKatha();

  // Reset list when language changes
  useEffect(() => {
    const cachedResponse = getValidCachedVratKatha(firstPageCacheKey);
    setKathas(getVratKathaItems(cachedResponse));
    setCurrentPage(1);
    setHasMore(cachedResponse ? hasMoreVratKatha(cachedResponse, limit) : true);
    setLoading(!cachedResponse);
  }, [firstPageCacheKey, limit]);

  useEffect(() => {
    async function fetchKathas() {
      try {
        const version = "v3";
        const cacheKey = getVratKathaCacheKey(version, currentPage, limit, language);
        const hasCachedResponse = Boolean(getValidCachedVratKatha(cacheKey));

        if (currentPage === 1) setLoading(!hasCachedResponse);
        else setLoadingMore(true);

        const json = await getCachedVratKatha(cacheKey, () =>
          vratKathaApis.fetchVratKathaData(version, currentPage, limit, language)
        );

        if (json.status === "success") {
          const totalItemsReceived = json?.data?.length;
          if (totalItemsReceived === 0) {
            setHasMore(false);
            setLoadingMore(false);
            setLoading(false);
            return;
          }

          if (currentPage === 1) {
            setKathas(json?.data);
          } else {
            setKathas((prevKathas) => [...prevKathas, ...json?.data]);
          }

          if (totalItemsReceived < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) setKathas([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("API Error:", error);
        setKathas([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchKathas();
  }, [currentPage, language]);

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
            setCurrentPage((prevPage) => prevPage + 1);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!kathas.length) return <p className="text-center py-10">❌ No kathas found</p>;

  const handleNavigate = (id, index, accessType, type, kathaId) => {
    const isActiveSubscription = getSubscriptionStatusFromLS();
    if (isActiveSubscription) {
      if (type === "multiple") {
        navigate(`/vrat-katha/categoryDetails/${id}`);
        trackEvent(GA4Events.vrat_katha_category_selected, {
          vratKathaCatgoryId: id,
          event_label: "vrat_katha_category_selected",
        });
      } else {
        trackEvent(GA4Events.vrat_katha_selected, {
          vratKathaId: kathaId,
          event_label: "vrat_katha_selected",
        });
        navigate(`/vrat-katha/${kathaId}`);
      }
    } else {
      if (type === "single") {
        if (accessType === "free") {
          trackEvent(GA4Events.vrat_katha_selected, {
            vratKathaId: kathaId,
            event_label: "vrat_katha_selected",
          });
          navigate(`/vrat-katha/${kathaId}`);
        } else {
          navigate(getTokenFromLS() ? "/payment" : "/login");
        }
      } else {
        trackEvent(GA4Events.vrat_katha_category_selected, {
          vratKathaCatgoryId: id,
          event_label: "vrat_katha_category_selected",
        });
        navigate(`/vrat-katha/categoryDetails/${id}`);
      }
    }
  };

  const getPaidLogic = (katha) => {
    if (katha.isCategory) {
      const allKathasPaid = katha.kathas?.every((k) => k.accessType === "paid");
      return allKathasPaid ? "blur-sm" : "";
    }
    return katha.accessType === "paid" ? "blur-sm" : "";
  };

  return (
    <>
      <SchemaMarkup schema={vratKathaSchema} />
      <SEO
        title="Complete Hindu Vrat Katha Collection in Hindi | All Vrat Stories | भक्ति भाव"
        description="Explore complete Hindu vrat katha collection including Ekadashi, Pradosh, Purnima, and more with pooja vidhi and benefits in Hindi"
        canonical="https://bhaktibhav.app/vrat-katha"
        schema={homeSchema}
      />
      <Header hideEditIcon={true} showProfileHeader={true} profileText="भक्ति भाव" backRoute="/" />
      <div className="h-2"></div>

      <PageTitleCard
        titleHi={"ozr dFkk"}
        titleEn={"Vrat Katha"}
        isHinglishLanguageSelected={language === "hinglish"}
        customEngFontSize={"18px"}
        customFontSize={"23px"}
      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {kathas.map((katha, index) => (
            <li key={katha._id}>
              <div
                onClick={() =>
                  handleNavigate(katha._id, index, katha.accessType, katha.type, katha.kathaId)
                }
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden cursor-pointer"
              >
                <div className="w-full h-40 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${katha.imagethumb}`}
                    alt={getVratKathaAltText(katha, language)}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${
                      getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)
                    }`}
                  />
                </div>
                <div className="p-2">
                  {(language === "hinglish" ? katha.name2 || katha.name : katha.name) && (
                    <h2
                      className={`font-semibold pt-3 ${
                        language === "hinglish" ? "text-center" : "truncate md:text-xl text-lg"
                      } ${language === "hi" ? "font-hindi" : "font-eng text-sm"} ${
                        getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)
                      }`}
                    >
                      {renderVratKathaName(katha, language)}
                    </h2>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A283D]"></div>
          <span className="ml-2 text-[#9A283D] font-eng">Loading more...</span>
        </div>
      )}
    </>
  );
}
