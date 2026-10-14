import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { CircleUserRound, IndianRupee, Search, ChevronLeft } from "lucide-react";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { teachingApis } from "../api";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";

const LIMIT = 10;
const CACHE_TTL = 5 * 60 * 1000;
const guruJiCache = new Map();
const pendingGuruJiRequests = new Map();

const DEVANAGARI_FONT = "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif";
const ENGLISH_FONT = "'PoppinsRegular', 'Poppins', sans-serif";

const getCacheKey = (page, limit, lang) => `guru-ji:${page}:${limit}:${lang}`;

const getValidCache = (key) => {
  const cached = guruJiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  guruJiCache.delete(key);
  return null;
};

const getCachedData = async (key, fetcher) => {
  const cached = getValidCache(key);
  if (cached) return cached;

  if (pendingGuruJiRequests.has(key)) return pendingGuruJiRequests.get(key);

  const request = fetcher()
    .then((data) => {
      guruJiCache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => pendingGuruJiRequests.delete(key));

  pendingGuruJiRequests.set(key, request);
  return request;
};

const getItems = (response) => (Array.isArray(response?.data) ? response.data : []);

const hasMoreItems = (response, page, items) => {
  if (response?.pagination?.totalPages) return page < response.pagination.totalPages;
  return items.length >= LIMIT;
};

const getTitleParts = (value) => {
  const [hindi = "", english = ""] = String(value || "").split(/\n|<br\s*\/?>/i);
  return {
    hindi: hindi.trim(),
    english: english.trim(),
  };
};

const getImageUrl = (url) => {
  if (!url) return "/img/default.png";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

function GuruJiHeader({ title = "गुरु जी", onBack, backRoute, fallbackRoute = "/" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasToken = Boolean(getTokenFromLS());

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backRoute) {
      navigate(backRoute);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <div className="mb-3">
      {/* Golden App Bar */}
      <header
        className="flex items-center justify-between rounded-[22px] px-4 py-3 shadow-[0_8px_20px_rgba(154,40,61,0.08)] sm:px-5"
        style={{
          background: "linear-gradient(to right, #F2A13A, #FFF56A)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE8B5]/95 text-[#9A283D] active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft size={26} strokeWidth={2.8} />
          </button>
          <h1
            style={{ fontFamily: DEVANAGARI_FONT }}
            className="truncate text-[22px] font-bold leading-none text-[#9A283D]"
          >
            भक्ति भाव
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/search", { state: { from: location.pathname + location.search } })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D] active:scale-95 transition-transform"
            aria-label="Search"
          >
            <Search size={22} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => navigate(hasToken ? "/payment" : "/login")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D] active:scale-95 transition-transform"
            aria-label="Payment"
          >
            <IndianRupee size={22} strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={() => navigate(hasToken ? "/profile" : "/login")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D] active:scale-95 transition-transform"
            aria-label="Profile"
          >
            <CircleUserRound size={24} strokeWidth={2.4} />
          </button>
        </div>
      </header>

      {/* Centered Capsule Sub-badge */}
      {title && (
        <div className="flex justify-center mt-3 mb-2">
          <div
            style={{
              border: "2px solid #E65C21",
              borderRadius: 18,
              background: "rgba(255,255,255,0.95)",
              padding: "7px 30px",
              boxShadow: "0 3px 12px rgba(154,40,61,0.06)",
              fontFamily: /[A-Za-z]/.test(title) && !/[\u0900-\u097F]/.test(title) ? ENGLISH_FONT : DEVANAGARI_FONT,
              fontSize: 18,
              fontWeight: 600,
              color: "#9A283D",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {title}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuruJi() {
  const { language } = useContext(LanguageContext);
  const [searchParams] = useSearchParams();
  const queryLang = searchParams.get("lang");
  const effectiveLang = (queryLang || language || "hinglish").toLowerCase();
  const isEnglish = effectiveLang === "english" || effectiveLang === "en";
  const lang = isEnglish ? "en" : "hinglish";
  const isPremium = useMemo(
    () =>
      Boolean(
        getSubscriptionStatusFromLS() ||
        localStorage.getItem("isPremium") === "true" ||
        localStorage.getItem("subscriptionStatus") === "true"
      ),
    []
  );
  const hasToken = useMemo(() => Boolean(getTokenFromLS()), []);

  const firstCacheKey = getCacheKey(1, LIMIT, lang);
  const cachedFirstPage = getValidCache(firstCacheKey);
  const [items, setItems] = useState(() => getItems(cachedFirstPage));
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() =>
    cachedFirstPage ? hasMoreItems(cachedFirstPage, 1, getItems(cachedFirstPage)) : true
  );

  const handleNavigate = useCallback(
    (item) => {
      const isPaid = item?.accessType === "paid" || item?.isPaid || item?.isPremium;
      if (isPremium || !isPaid) {
        return `/guru-ji/${item._id}`;
      }

      return hasToken ? "/payment" : "/login";
    },
    [hasToken, isPremium]
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      const cacheKey = getCacheKey(page, LIMIT, lang);
      const hasCached = Boolean(getValidCache(cacheKey));

      if (page === 1) setLoading(!hasCached);
      else setLoadingMore(true);

      try {
        const response = await getCachedData(cacheKey, () =>
          teachingApis.getTeachingCategories(page, LIMIT, lang)
        );
        if (!isMounted) return;

        const nextItems = getItems(response);
        setItems((prev) => (page === 1 ? nextItems : [...prev, ...nextItems]));
        setHasMore(hasMoreItems(response, page, nextItems));
      } catch (error) {
        console.error("Error loading guru ji categories:", error);
        if (page === 1) setItems([]);
        setHasMore(false);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [lang, page]);

  useEffect(() => {
    setPage(1);
  }, [lang]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 120 >=
      document.documentElement.offsetHeight &&
      hasMore &&
      !loading &&
      !loadingMore
    ) {
      setPage((currentPage) => currentPage + 1);
    }
  }, [hasMore, loading, loadingMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  return (
    <>
      <SEO
        title="Guru Ji Teachings | भक्ति भाव"
        description="Read and explore spiritual teachings from saints and gurus on Bhakti Bhav."
        canonical="https://bhaktibhav.app/guru-ji"
        schema={homeSchema}
      />
      <div
        className="min-h-screen w-full text-[#9A283D]"
        style={{
          backgroundImage: "url('/img/repeat_bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
          backgroundColor: "#FAF9F5",
          fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
        }}
      >
        <main className="container mx-auto flex max-w-md flex-col px-4 pb-12 pt-5 md:max-w-4xl">
          <GuruJiHeader title="गुरु जी" backRoute="/" />

          {items.length ? (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {items.map((item) => {
                const title = getTitleParts(item.name2 || item.name);
                const isPaid = item?.accessType === "paid" || item?.isPaid || item?.isPremium;
                const isRestricted = !isPremium && isPaid;

                return (
                  <li key={item._id}>
                    <Link
                      to={handleNavigate(item)}
                      state={isRestricted ? {} : { category: item }}
                      className="flex min-h-[230px] flex-col overflow-hidden rounded-[22px] border-2 border-[#9A283D] bg-white shadow-[0_6px_16px_rgba(154,40,61,0.09)] transition hover:shadow-lg hover:border-[#7A1C2E] active:scale-[0.98]"
                    >
                      <div className="flex h-[155px] items-center justify-center p-3 pt-4">
                        <img
                          src={getImageUrl(item.imagethumb || item.imageUrl)}
                          alt={title.hindi || title.english || "Guru Ji"}
                          crossOrigin="anonymous"
                          className={`max-h-full max-w-full object-contain filter drop-shadow-sm ${isRestricted ? "blur-sm opacity-80" : ""
                            }`}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-end px-3 pb-4 pt-1 text-center">
                        <h2
                          style={{ fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT }}
                          className={`text-[17px] font-bold leading-tight text-[#9A283D] ${isRestricted ? "blur-[2px]" : ""
                            }`}
                        >
                          {isEnglish ? (title.english || title.hindi) : (title.hindi || title.english)}
                        </h2>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              style={{ fontFamily: DEVANAGARI_FONT }}
              className="py-12 text-center text-lg text-[#9A283D]"
            >
              कोई गुरु जी उपलब्ध नहीं हैं
            </p>
          )}

          {loadingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-[#9A283D]" />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export { GuruJiHeader, getTitleParts, getImageUrl, getCachedData, getValidCache, getCacheKey, LIMIT, DEVANAGARI_FONT, ENGLISH_FONT };
