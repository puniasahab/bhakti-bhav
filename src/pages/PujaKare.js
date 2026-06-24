import React, { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { pujaKareApis } from "../api";
import { usePujaKare } from "../contexts/PujaKareContext";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import SchemaMarkup from "../components/SchemaMarkup";
import { pujaKareSchema } from "../schemas/pageSchemas";

const PUJA_KARE_CACHE_TTL = 5 * 60 * 1000;
const pujaKarePageCache = new Map();
const pendingPujaKareRequests = new Map();

const getPujaKareCacheKey = (page, limit) => `puja-kare:${page}:${limit}`;

const getValidCachedPujaKare = (cacheKey) => {
  const cached = pujaKarePageCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < PUJA_KARE_CACHE_TTL) {
    return cached.data;
  }

  pujaKarePageCache.delete(cacheKey);
  return null;
};

const getCachedPujaKare = async (cacheKey, fetcher) => {
  const cached = getValidCachedPujaKare(cacheKey);

  if (cached) {
    return cached;
  }

  if (pendingPujaKareRequests.has(cacheKey)) {
    return pendingPujaKareRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      pujaKarePageCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    })
    .finally(() => {
      pendingPujaKareRequests.delete(cacheKey);
    });

  pendingPujaKareRequests.set(cacheKey, request);
  return request;
};

const getPujaKareItems = (response) => (Array.isArray(response?.data) ? response.data : []);

const hasMorePujaKare = (response, limit) => getPujaKareItems(response).length >= limit;

export default function PujaKare() {
  const limit = 10;
  const firstPageCacheKey = getPujaKareCacheKey(1, limit);
  const cachedFirstPage = getValidCachedPujaKare(firstPageCacheKey);
  const cachedFirstPageItems = getPujaKareItems(cachedFirstPage);
  const [items, setItems] = useState(cachedFirstPageItems);
  const [loading, setLoading] = useState(!cachedFirstPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(() =>
    cachedFirstPage ? hasMorePujaKare(cachedFirstPage, limit) : true
  );
  const { updatePujaKareItems } = usePujaKare();

  const baseParams = useGA4BaseParams("Puja Kare Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    async function fetchItems() {
      try {
        const cacheKey = getPujaKareCacheKey(currentPage, limit);
        const hasCachedResponse = Boolean(getValidCachedPujaKare(cacheKey));

        if (currentPage === 1) setLoading(!hasCachedResponse);
        else setLoadingMore(true);
        
        const res = await getCachedPujaKare(cacheKey, () =>
          pujaKareApis.getPujaKareItems(currentPage, limit)
        );
        const itemsData = getPujaKareItems(res);
        
        if (currentPage === 1) {
          setItems(itemsData);
        } else {
          setItems(prevItems => [...prevItems, ...itemsData]);
        }
        
        // Check if there's more data
        setHasMore(hasMorePujaKare(res, limit));
        
        // Update context with the fetched data
        updatePujaKareItems(itemsData);
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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!items.length) return <p className="text-center py-10 text-white">❌ No items found</p>;

  return (
    <>
    <SchemaMarkup schema={pujaKareSchema} />
      <Header pageName={{ hi: "iwtk djs", en: "Puja kare" }} />
      <div className="h-1"></div>
      <PageTitleCard
        titleHi={"iwtk djs"}
        titleEn={"Puja kare"}
      />

      <div className="mt-4 container mx-auto px-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          {items.map((item) => {
            let parsedName = { hi: "", en: "" };
            if (typeof item.name === 'string') {
              parsedName = item.name ? JSON.parse(item.name) : { hi: "", en: "" };

            }
            else {
              parsedName = item.name;
            }
            return (


              <li key={item._id}>
                <Link
                  to={`/puja-kare/${item._id}`}
                  onClick = {() => {
                      trackEvent(GA4Events.pooja_karein_card_selected, {
                          event_label: "puja_kare_card_clicked_on_puja_karein_section",
                          id: item._id,
                          name_en: parsedName.en,
                          name_hi: parsedName.hi,
                      });
                  }}
                  className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
                >
                  <div className="w-full h-36 flex items-center justify-center">
                    <img
                      src={item.imagethumb || "/img/default.png"}
                      alt={item.title}
                      className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-2">
                    <h2 className="md:text-lg text-lg font-semibold truncate font-hindi pt-2">{parsedName.hi}</h2>
                    <p className="md:text-md text-md truncate font-eng">({parsedName.en})</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading more...</span>
          </div>
        )}
        
        {/* No more data indicator */}
        {/* {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी पूजा करे लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Puja Kare loaded</p>
          </div>
        )} */}
      </div>


    </>
  );
}
