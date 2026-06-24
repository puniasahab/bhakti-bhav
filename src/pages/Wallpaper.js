import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Heart, Lock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { wallpaperApis } from "../api";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { cachedFetch } from "../utils/apiCache";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import SchemaMarkup from "../components/SchemaMarkup";
import { wallpaperSchema } from "../schemas/pageSchemas";

const WALLPAPER_CACHE_TTL = 5 * 60 * 1000;
const wallpaperPageCache = new Map();
const pendingWallpaperRequests = new Map();
const WALLPAPER_CATEGORIES_CACHE_KEY = "wallpaper:categories";

const getWallpaperApiUrl = (category, page, limit) =>
  category === "All"
    ? `https://api.bhaktibhav.app/frontend/wallpapers?page=${page}&limit=${limit}`
    : `https://api.bhaktibhav.app/frontend/wallpapers?categoryId=${category}&page=${page}&limit=${limit}`;

const getWallpaperCacheKey = (category, page, limit) =>
  `wallpaper:${category}:${page}:${limit}`;

const getValidWallpaperCache = (cacheKey) => {
  const cached = wallpaperPageCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < WALLPAPER_CACHE_TTL) {
    return cached.data;
  }

  wallpaperPageCache.delete(cacheKey);
  return null;
};

const setWallpaperCache = (cacheKey, data) => {
  wallpaperPageCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

const getCachedWallpapers = async (cacheKey, apiUrl) => {
  const cached = getValidWallpaperCache(cacheKey);

  if (cached) {
    return cached;
  }

  if (pendingWallpaperRequests.has(cacheKey)) {
    return pendingWallpaperRequests.get(cacheKey);
  }

  const request = cachedFetch(apiUrl, {}, WALLPAPER_CACHE_TTL)
    .then((data) => {
      setWallpaperCache(cacheKey, data);
      return data;
    })
    .finally(() => {
      pendingWallpaperRequests.delete(cacheKey);
    });

  pendingWallpaperRequests.set(cacheKey, request);
  return request;
};

const getWallpaperItems = (response) =>
  response?.status === "success" && Array.isArray(response.data) ? response.data : [];

const hasMoreWallpapers = (response, limit) => getWallpaperItems(response).length >= limit;

export default function Wallpaper() {
  const limit = 10;
  const [activeCategory, setActiveCategory] = useState("All");
  const firstPageCacheKey = getWallpaperCacheKey(activeCategory, 1, limit);
  const cachedFirstPage = getValidWallpaperCache(firstPageCacheKey);
  const [wallpapers, setWallpapers] = useState(() => getWallpaperItems(cachedFirstPage));
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(() =>
    cachedFirstPage ? hasMoreWallpapers(cachedFirstPage, limit) : true
  );
  const cachedCategories = getValidWallpaperCache(WALLPAPER_CATEGORIES_CACHE_KEY);
  const [categories, setCategories] = useState(
    () => cachedCategories || [{ _id: "All", name: { en: "All" } }]
  );

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  const baseParams = useGA4BaseParams("Wallpaper Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const cacheKey = getWallpaperCacheKey(activeCategory, currentPage, limit);
        const apiUrl = getWallpaperApiUrl(activeCategory, currentPage, limit);
        const hasCachedResponse = Boolean(getValidWallpaperCache(cacheKey));

        if (currentPage === 1) setLoading(!hasCachedResponse);
        else setLoadingMore(true);

        const resJson = await getCachedWallpapers(cacheKey, apiUrl);
        
        if (resJson.status === "success" && Array.isArray(resJson.data)) {
          setLoading(false);
          if (currentPage === 1) {
            setWallpapers(resJson.data);
          } else {
            setWallpapers(prevWallpapers => [...prevWallpapers, ...resJson.data]);
          }
          
          // Check if there's more data
          if (resJson.data.length < limit) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          setLoading(false);
          if (currentPage === 1) {
            setWallpapers([]);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching wallpapers:", err);
        if (currentPage === 1) {
          setWallpapers([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchWallpapers();
  }, [currentPage, activeCategory]);

  // Reset pagination when category changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    const cacheKey = getWallpaperCacheKey(activeCategory, 1, limit);
    const cachedResponse = getValidWallpaperCache(cacheKey);

    setWallpapers(getWallpaperItems(cachedResponse));
    setHasMore(cachedResponse ? hasMoreWallpapers(cachedResponse, limit) : true);
    setLoading(!cachedResponse);
  }, [activeCategory]);

  // Fetch categories
  useEffect(() => {
    const getData = async () => {
      try {
        const cached = getValidWallpaperCache(WALLPAPER_CATEGORIES_CACHE_KEY);

        if (cached) {
          setCategories(cached);
          return;
        }

        const data = await wallpaperApis.getWallpaperCategories();
        const nextCategories = [{ _id: "All", name: { en: "All" } }, ...data.data];
        setWallpaperCache(WALLPAPER_CATEGORIES_CACHE_KEY, nextCategories);
        setCategories(nextCategories);
      } catch (error) {
        console.error("Error fetching wallpaper categories:", error);
      }
    };
    getData();
  }, []);

  // Infinite scroll handler with throttling
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

  // Memoized image URL getter
  const getImageUrl = useCallback((wp) => {
    if (wp.imagethumb && wp.imagethumb !== "") {
      return wp.imagethumb.startsWith("http")
        ? wp.imagethumb
        : `https://api.bhaktibhav.app${wp.imagethumb}`;
    }
    return wp.imageUrl.startsWith("http")
      ? wp.imageUrl
      : `https://api.bhaktibhav.app${wp.imageUrl}`;
  }, []);

  // Memoized navigation handler
  const handleNavigate = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/wallpaper/${id}`;
    } else {                                                                                                                                                                                                                                                                                                      
      if (accessType === "free") {
        return `/wallpaper/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!wallpapers.length) return <p className="text-center py-10">❌ No wallpapers found</p>;

  return (
    <>
    <SchemaMarkup schema={wallpaperSchema} />
      <Header />                                                                                                       
 
      <div className="flex gap-3 justify-start px-4 mt-4 mb-6 overflow-x-auto scrollbar-hide">
        {categories && categories.length > 0 && categories?.map((cat) => (
          <button
            key={cat._id}
            onClick={() => {setActiveCategory(cat._id); trackEvent(GA4Events.wallpaper_category_selected, { title: `${cat.name.en.charAt(0).toUpperCase() + cat.name.en.slice(1)}_wallpapers`, event_label: `${cat.name.en}_wallpaper_category_selected`, id: cat._id });}}
            className={`px-5 py-2 rounded-full border text-sm font-eng whitespace-nowrap transition ${activeCategory === cat._id
                ? "bg-[#9A283D] text-white"
                : "border-[#9A283D] text-[#9A283D]"
              }`}
          >
            {cat.name.en.charAt(0).toUpperCase() + cat.name.en.slice(1)}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-4">
        <ul className="grid grid-cols-2 gap-3">
          {wallpapers?.map((wp) => (
            <li key={wp._id}>
              <Link to={handleNavigate(wp._id, wp.accessType)} className="block">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
                  <div className="w-full aspect-[3/4] overflow-hidden">
                    <img
                      src={getImageUrl(wp)}
                      alt={wp.godName}
                      className={`w-full h-full object-cover ${isSubscribed ? "" : wp.accessType === "paid" ? "blur" : ""}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* {wp.accessType === "paid" && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow">
                      <Lock size={16} className="text-[#9A283D]" />
                    </div>
                  )} */}

                  <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                    <div  style={{paddingLeft: '6px', paddingRight: '6px'}}className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm py-1 rounded-full shadow-sm text-xs font-eng ${isSubscribed ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Download size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700" style={{fontSize: `${wp.downloads.length >= 3 ? "10px" : "11px"}`}}>{wp.downloads}</span>
                    </div>
                    <div  style={{paddingLeft: '6px', paddingRight: '6px'}} className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm py-1 rounded-full shadow-sm text-xs font-eng ${isSubscribed ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Eye size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700" style={{fontSize: `${wp.views.length >= 3 ? "10px" : "12px"}`}}>{wp.views}</span>
                    </div>
                    <div  style={{paddingLeft: '6px', paddingRight: '6px'}} className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm py-1 rounded-full shadow-sm text-xs font-eng ${isSubscribed ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Heart size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700" style={{fontSize: `${wp.likes.length >= 3 ? "10px" : "12px"}`}}>{wp.likes}</span>
                    </div>
                  </div>
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
        {/* {!hasMore && wallpapers.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी वॉलपेपर लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Wallpapers loaded</p>
          </div>
        )} */}
      </div>

      
    </>
  );
}
