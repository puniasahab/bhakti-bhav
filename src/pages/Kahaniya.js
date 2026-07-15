import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import SEO from "../components/SEO";
import { getSubscriptionStatusFromLS, getTokenFromLS, replaceSpecialChars, fixKrutiDevHtml } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { categoryContentApis, homeCategoryApis } from "../api";
import { homeSchema } from "../seo/schemas";
import SchemaMarkup from "../components/SchemaMarkup";
import { getKahaniyaSchema } from "../schemas/pageSchemas";

const contentCache = new Map();
const pendingContentRequests = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCachedContent = async (cacheKey, fetcher) => {
  const cached = contentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  contentCache.delete(cacheKey);

  if (pendingContentRequests.has(cacheKey)) {
    return pendingContentRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      contentCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return data;
    })
    .finally(() => {
      pendingContentRequests.delete(cacheKey);
    });

  pendingContentRequests.set(cacheKey, request);
  return request;
};

const getValidCachedContent = (cacheKey) => {
  const cached = contentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  contentCache.delete(cacheKey);
  return null;
};

const getContentItems = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const getPagination = (response) => response?.data?.pagination || response?.pagination || null;

const hasMoreContent = (response, items, page, limit) => {
  const pagination = getPagination(response);

  if (pagination?.totalPages) {
    return page < pagination.totalPages;
  }

  return items.length >= limit;
};

const getTitle = (item, language) => {
  if (typeof item?.title === "string") return item.title;
  return item?.title?.[language] || item?.title?.hi || item?.title?.en || "Kahaniya";
};

const getHomeCategories = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response)) return response;
  return [];
};

const isKahaniyaCategory = (category) => {
  const url = String(category?.url || "").replace(/^\/+/, "").toLowerCase();
  const title = String(category?.title || "").toLowerCase();

  return ["kahaniya", "kahani", "kahania", "stories", "story"].includes(url) || title.includes("kahaniya");
};

const getCategoryIdFromCategory = (category) => category?.categoryId || category?._id || "";

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getHinglishTitleParts = (title) => {
  const normalizedTitle = String(title || "")
    .replace(/<\/?p[^>]*>/gi, "")
    .trim();
  const [hindiText = "", englishText = ""] = normalizedTitle.split(/<\/?br\s*\/?>/i);
  const cleanHindiText = stripHtmlTags(hindiText);
  const cleanEnglishText = stripHtmlTags(englishText);

  if (!cleanEnglishText) {
    const titleWithoutTags = stripHtmlTags(normalizedTitle);
    const parenthesizedEnglish = titleWithoutTags.match(/^(.*?)\s*(\([^()]*[A-Za-z][^()]*\))\s*$/);

    if (parenthesizedEnglish) {
      return {
        hindiText: parenthesizedEnglish[1].trim(),
        englishText: parenthesizedEnglish[2].trim()
      };
    }
  }

  return {
    hindiText: cleanHindiText,
    englishText: cleanEnglishText
  };
};

const renderTitle = (title, language) => {
  if (language === "hi") {
    return fixKrutiDevHtml(replaceSpecialChars(title));
    // return replaceSpecialChars(title);
  }

  if (language !== "hinglish") {
    return title;
  }

  const { hindiText, englishText } = getHinglishTitleParts(title);

  if (!englishText) {
    return <span className="font-eng">{stripHtmlTags(title)}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-base md:text-lg">{fixKrutiDevHtml(replaceSpecialChars(hindiText))}</span>
      <span className="block font-eng text-xs md:text-sm leading-tight">{englishText}</span>
    </>
  );
};

export default function Kahaniya() {
  const { categoryId: categoryIdParam, id } = useParams();
  const location = useLocation();
  const { language } = useContext(LanguageContext);
  const limit = 10;

  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);
  const [resolvingCategory, setResolvingCategory] = useState(false);
  const [resolvedCategoryId, setResolvedCategoryId] = useState("");

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeCategoryId =
    categoryIdParam ||
    id ||
    queryParams.get("categoryId") ||
    location.state?.categoryId ||
    location.state?._id ||
    "";
  const categoryId = routeCategoryId || resolvedCategoryId;
  const firstPageCacheKey = categoryId ? `kahaniya:${categoryId}:${language}:1:${limit}` : "";
  const initialCachedResponse = firstPageCacheKey ? getValidCachedContent(firstPageCacheKey) : null;
  const initialCachedItems = getContentItems(initialCachedResponse);
  const [items, setItems] = useState(initialCachedItems);
  const [loading, setLoading] = useState(!initialCachedResponse);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(() =>
    initialCachedResponse ? hasMoreContent(initialCachedResponse, initialCachedItems, 1, limit) : true
  );

  useEffect(() => {
    let isActive = true;

    async function resolveCategoryId() {
      if (routeCategoryId) {
        setResolvedCategoryId("");
        return;
      }

      try {
        setResolvingCategory(true);
        const response = await getCachedContent(`home-categories:${language}`, () =>
          homeCategoryApis.fetchHomeCategories(language)
        );
        const kahaniyaCategory = getHomeCategories(response).find(isKahaniyaCategory);
        const nextCategoryId = getCategoryIdFromCategory(kahaniyaCategory);

        if (isActive) {
          setResolvedCategoryId(nextCategoryId);
          if (!nextCategoryId) {
            setLoading(false);
            setHasMore(false);
          }
        }
      } catch (error) {
        if (isActive) {
          console.error("Unable to resolve Kahaniya category:", error);
          setResolvedCategoryId("");
          setLoading(false);
          setHasMore(false);
        }
      } finally {
        if (isActive) {
          setResolvingCategory(false);
        }
      }
    }

    resolveCategoryId();

    return () => {
      isActive = false;
    };
  }, [language, routeCategoryId]);

  useEffect(() => {
    const cachedResponse = firstPageCacheKey ? getValidCachedContent(firstPageCacheKey) : null;
    const cachedItems = getContentItems(cachedResponse);

    setItems(cachedItems);
    setCurrentPage(1);
    setHasMore(cachedResponse ? hasMoreContent(cachedResponse, cachedItems, 1, limit) : true);
    setLoading(!cachedResponse);
  }, [firstPageCacheKey, limit]);

  useEffect(() => {
    let isActive = true;

    async function fetchItems() {
      if (!categoryId) {
        if (isActive) {
          setItems([]);
          setHasMore(false);
          setLoading(false);
        }
        return;
      }

      try {
        if (resolvingCategory) return;

        const cacheKey = `kahaniya:${categoryId}:${language}:${currentPage}:${limit}`;
        const hasCachedResponse = Boolean(getValidCachedContent(cacheKey));

        if (currentPage === 1) {
          setLoading(!hasCachedResponse);
        } else {
          setLoadingMore(true);
        }

        const response = await getCachedContent(cacheKey, () =>
          categoryContentApis.fetchContentDataByCategoryId(categoryId, language, currentPage, limit)
        );
        const nextItems = getContentItems(response);

        if (!isActive) return;

        setItems((prevItems) => (currentPage === 1 ? nextItems : [...prevItems, ...nextItems]));
        setHasMore(hasMoreContent(response, nextItems, currentPage, limit));
      } catch (error) {
        if (!isActive) return;
        console.error("Kahaniya API Error:", error);
        if (currentPage === 1) setItems([]);
        setHasMore(false);
      } finally {
        if (isActive) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    fetchItems();

    return () => {
      isActive = false;
    };
  }, [categoryId, currentPage, language, limit, resolvingCategory]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

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
  }, [hasMore, loading, loadingMore]);

  const handleNavigate = useCallback(
    (item) => {
      const isFree = !item?.isPaid || item?.isWithoutLoginFree;

      if (isSubscribed || isFree) {
        return `/kahaniya-details/${item._id}`;
      }

      return hasToken ? "/payment" : "/login";
    },
    [hasToken, isSubscribed]
  );

  const renderPageShell = (content) => (
    <>

    {/* <SchemaMarkup schema={getKahaniyaSchema(categoryId)} /> */}
      <SEO
        title="Kahaniya | भक्ति भाव"
        description="Read devotional kahaniya on Bhakti Bhav."
        canonical="https://bhaktibhav.app/kahaniya"
        schema={homeSchema}
      />
      <Header pageName={{ hi: "कहानियां", en: "Kahaniya" }} />

      <PageTitleCard
        titleHi="कहानियां"
        titleEn="Kahaniya"
        isHinglishLanguageSelected={language === "hinglish"}
        // customEngFontSize="16px"
        customEngFontSize={language === "hinglish" ? "14px" : "16px"}
        customFontSize="19px"
      />

      {content}
    </>
  );

  if (loading || resolvingCategory) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!items.length) {
    return renderPageShell(<p className="text-center py-10 theme_text">❌ No items found</p>);
  }

   function formatDate(date) {
    const pad = n => String(n).padStart(2, '0');

    return (
        date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds()) +
        '+05:30'
    );
}

const datePublished = formatDate(new Date());

  return renderPageShell(
    <>
    <SchemaMarkup schema={getKahaniyaSchema(categoryId, datePublished)} />
      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item, idx) => {
            const title = getTitle(item, language);
            const isRestricted = !isSubscribed && item?.isPaid && !item?.isWithoutLoginFree;
            const imgSrc = item?.imageUrl || "/img/default-aarti.png";

            return (
              <li key={item._id || idx}>
                <Link
                  to={handleNavigate(item)}
                  state={{ item, categoryId }}
                  className="relative block rounded-xl overflow-hidden shadow-lg"
                >
                  <div className={`overflow_bg ${language === "hinglish" ? "kahaniya-hinglish-title" : ""}`}>
                    <img
                      crossOrigin="anonymous"
                      src={imgSrc}
                      alt={stripHtmlTags(title)}
                      className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isRestricted ? "blur" : ""}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-2 z-10 top-[60%] ${isRestricted ? "blur-sm" : ""}`}>
                      <h2 className={`text-sm font-[450] ${language === "hi" ? "font-hindi" : "font-eng"}`}>
                        {renderTitle(title, language)}
                      </h2>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
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
