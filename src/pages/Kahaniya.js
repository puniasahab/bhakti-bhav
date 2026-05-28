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

const contentCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCachedContent = async (cacheKey, fetcher) => {
  const cached = contentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  contentCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
};

const getContentItems = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const getPagination = (response) => response?.data?.pagination || response?.pagination || null;

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

export default function Kahaniya() {
  const { categoryId: categoryIdParam, id } = useParams();
  const location = useLocation();
  const { language } = useContext(LanguageContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resolvingCategory, setResolvingCategory] = useState(false);
  const [resolvedCategoryId, setResolvedCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeCategoryId =
    categoryIdParam ||
    id ||
    queryParams.get("categoryId") ||
    location.state?.categoryId ||
    location.state?._id ||
    "";
  const categoryId = routeCategoryId || resolvedCategoryId;

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
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [categoryId, language]);

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

        if (currentPage === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const cacheKey = `kahaniya:${categoryId}:${language}:${currentPage}:${limit}`;
        const response = await getCachedContent(cacheKey, () =>
          categoryContentApis.fetchContentDataByCategoryId(categoryId, language, currentPage, limit)
        );
        const nextItems = getContentItems(response);
        const pagination = getPagination(response);

        if (!isActive) return;

        setItems((prevItems) => (currentPage === 1 ? nextItems : [...prevItems, ...nextItems]));

        if (pagination?.totalPages) {
          setHasMore(currentPage < pagination.totalPages);
        } else {
          setHasMore(nextItems.length >= limit);
        }
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
        customEngFontSize="14px"
        customFontSize="14px"
      />

      {content}
    </>
  );

  if (loading || resolvingCategory) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!items.length) {
    return renderPageShell(<p className="text-center py-10 theme_text">❌ No items found</p>);
  }

  return renderPageShell(
    <>
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
                  <div className="overflow_bg">
                    <img
                      crossOrigin="anonymous"
                      src={imgSrc}
                      alt={title}
                      className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isRestricted ? "blur" : ""}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-2 z-10 top-[60%] ${isRestricted ? "blur-sm" : ""}`}>
                      <h2 className={`text-sm font-[450] ${language === "hi" ? "font-hindi" : "font-eng"}`}>
                        {language === 'hi' ? fixKrutiDevHtml(replaceSpecialChars(title)) : title}
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
