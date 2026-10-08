import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound, IndianRupee, Search, ChevronLeft } from "lucide-react";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { teachingApis } from "../api";
import { getTokenFromLS } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";

const LIMIT = 10;
const CACHE_TTL = 5 * 60 * 1000;
const guruJiCache = new Map();
const pendingGuruJiRequests = new Map();

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
    english: english.trim()
  };
};

const getImageUrl = (url) => {
  if (!url) return "/img/default.png";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

function GuruJiHeader({ title = "गुरु जी" }) {
  const navigate = useNavigate();
  const hasToken = Boolean(getTokenFromLS());

  return (
    <header className="relative mb-20 rounded-[22px] bg-gradient-to-r from-[#F2A13A] to-[#FFF56A] px-4 py-3.5 shadow-[0_10px_24px_rgba(154,40,61,0.08)] sm:px-5">
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
          <h1 className="font-devanagari truncate text-[22px] font-bold leading-none text-[#9A283D]">भक्ति भाव</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]" aria-label="Search">
            <Search size={24} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => navigate(hasToken ? "/payment" : "/login")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]"
            aria-label="Payment"
          >
            <IndianRupee size={24} strokeWidth={2.7} />
          </button>
          <button
            type="button"
            onClick={() => navigate(hasToken ? "/profile" : "/login")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4B6]/90 text-[#9A283D]"
            aria-label="Profile"
          >
            <CircleUserRound size={26} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="absolute left-1/2 top-full flex h-[48px] min-w-[130px] -translate-x-1/2 -translate-y-[1px] items-center justify-center rounded-b-[20px] border-[3px] border-t-0 border-[#E65C21] bg-white px-5 text-center font-devanagari text-[18px] font-semibold leading-none text-[#9A283D] shadow-[0_8px_18px_rgba(154,40,61,0.08)]">
        {title}
      </div>
    </header>
  );
}

export default function GuruJi() {
  const { language } = useContext(LanguageContext);
  const lang = language || "hinglish";
  const firstCacheKey = getCacheKey(1, LIMIT, lang);
  const cachedFirstPage = getValidCache(firstCacheKey);
  const [items, setItems] = useState(() => getItems(cachedFirstPage));
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => cachedFirstPage ? hasMoreItems(cachedFirstPage, 1, getItems(cachedFirstPage)) : true);

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      const cacheKey = getCacheKey(page, LIMIT, lang);
      const hasCached = Boolean(getValidCache(cacheKey));

      if (page === 1) setLoading(!hasCached);
      else setLoadingMore(true);

      try {
        const response = await getCachedData(cacheKey, () => teachingApis.getTeachingCategories(page, LIMIT, lang));
        if (!isMounted) return;

        const nextItems = getItems(response);
        setItems((prev) => page === 1 ? nextItems : [...prev, ...nextItems]);
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
    if (window.innerHeight + document.documentElement.scrollTop + 120 >= document.documentElement.offsetHeight && hasMore && !loading && !loadingMore) {
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
      <div className="min-h-screen w-full bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat text-[#9A283D]">
        <main className="container mx-auto flex max-w-md flex-col px-4 pb-10 pt-8 md:max-w-5xl">
          <GuruJiHeader />

          {items.length ? (
            <ul className="grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-4">
              {items.map((item) => {
                const title = getTitleParts(item.name2 || item.name);

                return (
                  <li key={item._id}>
                    <Link
                      to={`/guru-ji/${item._id}`}
                      state={{ category: item }}
                      className="flex min-h-[238px] flex-col overflow-hidden rounded-[22px] border-2 border-[#9A283D] bg-white shadow-[0_8px_18px_rgba(154,40,61,0.12)] transition hover:bg-[#FFFDF8]"
                    >
                      <div className="flex h-[162px] items-end justify-center px-3 pt-5">
                        <img
                          src={getImageUrl(item.imagethumb)}
                          alt={title.hindi || title.english || "Guru Ji"}
                          crossOrigin="anonymous"
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-end px-3 pb-5 pt-3 text-center">
                        <h2 className="font-devanagari text-[18px] font-semibold leading-tight text-[#9A283D]">{title.hindi}</h2>
                        {title.english && <p className="font-eng mt-1 truncate text-[15px] font-medium leading-tight text-[#9A283D]">{title.english}</p>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-10 text-center font-devanagari text-[#9A283D]">कोई गुरु जी उपलब्ध नहीं हैं</p>
          )}

          {loadingMore && (
            <div className="flex items-center justify-center py-5">
              <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-[#9A283D]" />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export { GuruJiHeader, getTitleParts, getImageUrl, getCachedData, getValidCache, getCacheKey, LIMIT };
