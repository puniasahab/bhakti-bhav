import React, { useEffect, useState, useMemo, useCallback } from "react";
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


export default function Mantra() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const baseParams = useGA4BaseParams("Mantra Screen");
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
          `https://api.bhaktibhav.app/frontend/all-mantras-v1?page=${currentPage}&limit=${limit}`,
          {},
          5 * 60 * 1000 // Cache for 5 minutes
        );
        
        if (json.status === "success" && Array.isArray(json.data)) {
          if (currentPage === 1) {
            setItems(json.data);
          } else {
            setItems(prevItems => [...prevItems, ...json.data]);
          }
          
          // Check if there's more data
          if (json.data.length < limit) {
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

  // Infinite scroll handler with throttling for better performance
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

  const handleTrackEvent = (id, mantra) => {
      trackEvent(GA4Events.mantra_selected, { event_label: "mantra_selected_from_mantra_list", mantraName: mantra, mantraId: id });
  }

  // Memoized navigation handler
  const handleNavigation = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/mantra/${id}`;
    } else {
      if (accessType === "free") {
         return `/mantra/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!items.length) return <p className="text-center py-10 theme_text font-eng">❌ No mantras found</p>;

  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-hindi text-white">
      <Header />

      <PageTitleCard
        titleHi={"ea="}
        titleEn={"Mantra"}
        customEngFontSize={"13px"}
        customFontSize={"23px"}

      />

      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item._id}>
              <Link

                to={handleNavigation(item._id, item.accessType)}
                onClick = {() => handleTrackEvent(item._id, item.name?.en)}
                className="theme_bg bg-white rounded-xl shadow p-4 text-center hover:bg-yellow-50 transition flex flex-col"
              >
                <div className={`w-full h-36 flex items-center justify-center ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}>
                  <img
                    src={item.imagethumb || "/img/default-mantra.png"}
                    alt={item.title}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-2">
                  <h2 className={`md:text-lg text-lg font-semibold truncate font-hindi mt-1 ${isSubscribed ? "" : item.accessType === "paid" ? "blur" : ""}`}>{item.name.hi}</h2>
                  <p className={`md:text-md text-sm font-semibold truncate font-eng ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>({item.name.en})</p>

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
        {/* {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी मंत्र लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Mantras loaded</p>
          </div>
        )} */}

      </div>


    </div>
  );
}
