import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import backBtn from "../assets/img/back_icon.svg";
import rupeesIcon from "../assets/img/rupees_icon.png";
import userIcon from "../assets/img/hd_user_icon.png";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import SEO from "../components/SEO";
import { getSubscriptionStatusFromLS, getTokenFromLS, replaceSpecialChars } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { categoryContentApis } from "../api";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { homeSchema } from "../seo/schemas";
import { GA4Events } from "../utils/ga4Events.enum";

const API_BASE_URL = "https://api.bhaktibhav.app";
const CACHE_TTL = 5 * 60 * 1000;
const contentCache = new Map();

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
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response)) return response;
  return [];
};

const getPagination = (response) => response?.data?.pagination || response?.pagination || null;

const getTitle = (item, language) => {
  if (typeof item?.title === "string") return item.title;
  return item?.title?.[language] || item?.title?.hi || item?.title?.en || "Jaap Mala";
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "/img/default-aarti.png";
  if (imageUrl.startsWith("http://")) return imageUrl.replace("http://", "https://");
  if (imageUrl.startsWith("https://")) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

export default function NewJaapMala() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId: categoryIdParam } = useParams();
  const { language } = useContext(LanguageContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);
  const baseParams = useGA4BaseParams("New Jaap Mala Screen");
  const { trackEvent } = useGA4Tracker(baseParams);
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryId =
    categoryIdParam ||
    queryParams.get("categoryId") ||
    location.state?.categoryId ||
    location.state?._id ||
    "";

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
        if (currentPage === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const cacheKey = `new-jaap-mala:${categoryId}:${language}:${currentPage}:${limit}`;
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
        console.error("New Jaap Mala API Error:", error);
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
  }, [categoryId, currentPage, language, limit]);

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
      const isFree = item?.accessType === "free" || !item?.isPaid || item?.isWithoutLoginFree;

      if (isSubscribed || isFree) {
        return `/newJaapMaala-details/${item._id}`;
      }

      return hasToken ? "/payment" : "/login";
    },
    [hasToken, isSubscribed]
  );

  const handleTrackEvent = useCallback(
    (item) => {
      const isFree = item?.accessType === "free" || !item?.isPaid || item?.isWithoutLoginFree;
      if (!item?._id || (!isSubscribed && !isFree)) return;

      trackEvent(GA4Events.jaap_mala_selected, {
        jaapMalaId: item._id,
        categoryId,
        jaapMalaName: item?.title?.en || getTitle(item, "en"),
        event_label: `jaap_mala_${item?.title?.en || item._id}_clicked`
      });
    },
    [categoryId, isSubscribed, trackEvent]
  );

  const renderHeader = () => (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 bg-white shadow-sm" style={{ height: "80px" }}>
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                aria-label="Back"
              >
                <img src={backBtn} alt="Back" width="24" height="24" />
              </button>
              <span className="font-hindi text-xl font-semibold theme_text">भक्ति भाव</span>
            </div>

            <div className="flex items-center space-x-6 text-xl">
              <button type="button" onClick={() => navigate(hasToken ? "/payment" : "/login")} aria-label="Payment">
                <img src={rupeesIcon} alt="Payment" width="22" height="22" />
              </button>
              <button type="button" onClick={() => navigate(hasToken ? "/profile" : "/login")} aria-label="Profile">
                <img src={userIcon} alt="Profile" width="22" height="20" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="h-20 w-full"></div>
    </>
  );

  const renderPageShell = (content) => (
    <>
      <SEO
        title="Best Jaap Mala Counter App - Digital Chanting Beads & Jap | भक्ति भाव"
        description="Track your mantra chanting with a digital mala jap app. Supports Rudraksha, Tulsi mala and more."
        canonical={`https://bhaktibhav.app/newjaapMaala${categoryId ? `/${categoryId}` : ""}`}
        schema={homeSchema}
      />
      {renderHeader()}
      <PageTitleCard
        titleHi="जाप माला"
        titleEn="Jaap Mala"
        customFontSize="18px"
        isFromJaapMala
      />
      {content}
    </>
  );

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!items.length) {
    return renderPageShell(<p className="text-center py-10 theme_text">❌ No items found</p>);
  }

  return renderPageShell(
    <>
      <div className="container mx-auto px-4 mt-6 pb-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-4">
          {items.map((item, idx) => {
            const title = getTitle(item, language);
            const isFree = item?.accessType === "free" || !item?.isPaid || item?.isWithoutLoginFree;
            const isRestricted = !isSubscribed && !isFree;

            return (
              <li key={item._id || idx}>
                <Link
                  to={handleNavigate(item)}
                  onClick={() => handleTrackEvent(item)}
                  state={{ item, categoryId }}
                  className="relative block overflow-hidden rounded-xl shadow-lg bg-black"
                >
                  <img
                    crossOrigin="anonymous"
                    src={getImageUrl(item?.imageUrl)}
                    alt={title}
                    className={`h-[150px] w-full object-cover sm:h-[170px] md:h-[170px] ${isRestricted ? "blur-sm" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute left-2 right-2 bottom-5 z-10 rounded-xl bg-white/80 px-3 py-2 text-center shadow-sm backdrop-blur-[1px]">
                    <h2 className={`theme_text text-base font-semibold leading-tight ${language === "hi" ? "font-hindi" : "font-eng"}`}>
                      {language === "hi" ? replaceSpecialChars(title) : title}
                    </h2>
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
