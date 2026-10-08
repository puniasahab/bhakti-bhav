import { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { teachingApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";
import { GuruJiHeader, getTitleParts, getImageUrl, getCachedData, getValidCache, LIMIT } from "./GuruJi";
import { ChevronRight } from "lucide-react";

const getItems = (response) => (Array.isArray(response?.items) ? response.items : []);
const getCategoryCacheKey = (categoryId, page, limit, lang) => `guru-ji-category:${categoryId}:${page}:${limit}:${lang}`;

const hasMoreItems = (response, page, items) => {
  if (response?.pagination?.totalPages) return page < response.pagination.totalPages;
  return items.length >= LIMIT;
};

export default function GuruJiCategory() {
  const { categoryId } = useParams();
  const { state } = useLocation();
  const { language } = useContext(LanguageContext);
  const lang = language || "hinglish";
  const firstCacheKey = getCategoryCacheKey(categoryId, 1, LIMIT, lang);
  const cachedFirstPage = getValidCache(firstCacheKey);
  const cachedCategory = cachedFirstPage?.category || state?.category || null;
  const [category, setCategory] = useState(cachedCategory);
  const [items, setItems] = useState(() => getItems(cachedFirstPage));
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => cachedFirstPage ? hasMoreItems(cachedFirstPage, 1, getItems(cachedFirstPage)) : true);

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      const cacheKey = getCategoryCacheKey(categoryId, page, LIMIT, lang);
      const hasCached = Boolean(getValidCache(cacheKey));

      if (page === 1) setLoading(!hasCached);
      else setLoadingMore(true);

      try {
        const response = await getCachedData(cacheKey, () => teachingApis.getTeachingCategoryItems(categoryId, page, LIMIT, lang));
        if (!isMounted) return;

        const nextItems = getItems(response);
        setCategory(response?.category || state?.category || null);
        setItems((prev) => page === 1 ? nextItems : [...prev, ...nextItems]);
        setHasMore(hasMoreItems(response, page, nextItems));
      } catch (error) {
        console.error("Error loading guru ji category:", error);
        if (page === 1) setItems([]);
        setHasMore(false);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    if (categoryId) fetchItems();

    return () => {
      isMounted = false;
    };
  }, [categoryId, lang, page, state?.category]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, lang]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 120 >= document.documentElement.offsetHeight && hasMore && !loading && !loadingMore) {
        setPage((currentPage) => currentPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadingMore]);

  const categoryTitle = getTitleParts(category?.name2 || category?.name);
  const headerTitle = categoryTitle.hindi || "गुरु जी";

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  return (
    <>
      <SEO
        title={`${headerTitle} Teachings | भक्ति भाव`}
        description={`Explore ${categoryTitle.english || headerTitle} teachings on Bhakti Bhav.`}
        canonical={`https://bhaktibhav.app/guru-ji/${categoryId}`}
        schema={homeSchema}
      />
      <div className="min-h-screen w-full bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat text-[#9A283D]">
        <main className="container mx-auto flex max-w-md flex-col px-4 pb-10 pt-8 md:max-w-5xl">
          <GuruJiHeader title={headerTitle} />

          {items.length ? (
            <ul className="grid grid-cols-1 gap-5">
              {items.map((item) => {
                const title = getTitleParts(item.name2 || item.name);

                return (
                  <li key={item._id}>
                    <div className="relative block overflow-hidden rounded-[22px] border border-[#E9DED8] bg-[#FFF5E5] shadow-[0_10px_24px_rgba(154,40,61,0.12)]">
                      <img
                        src={getImageUrl(item.imageUrl || item.imagethumb)}
                        alt={title.hindi || title.english || headerTitle}
                        crossOrigin="anonymous"
                        className="h-[190px] w-full object-cover md:h-[260px]"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full text-white">
                        <ChevronRight size={42} strokeWidth={2.6} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-10 text-center font-devanagari text-[#9A283D]">कोई सामग्री उपलब्ध नहीं है</p>
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
