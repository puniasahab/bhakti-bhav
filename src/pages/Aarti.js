import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { cachedFetch } from "../utils/apiCache";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";

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

  useEffect(() => {
    async function fetchItems() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        // Use cached fetch for better performance
        const json = await cachedFetch(
          `https://api.bhaktibhav.app/frontend/all-artis-v1?page=${currentPage}&limit=${limit}`,
          {},
          5 * 60 * 1000 // Cache for 5 minutes
        );

        if (json?.status === "success") {
          if (currentPage === 1) {
            setItems(json.data || []);
          } else {
            setItems(prevItems => [...prevItems, ...(json.data || [])]);
          }

          // Check if there are more items to load
          if (!json.data || json.data.length < limit) {
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
  }, [currentPage]);

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
        customEngFontSize={"14px"}
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
                  <div className={`overflow_bg`}>
                    <img
                      src={imgSrc}
                      alt={item.name?.en || item.name?.hi || "Aarti"}
                      className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%] ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                      {item.name?.hi && (
                        <h2 className="text-xl font-bold font-hindi">
                          {item.name.hi}
                        </h2>
                      )}
                      {item.name?.en && (
                        <p className="text-sm font-eng">{item.name.en}</p>
                      )}
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
