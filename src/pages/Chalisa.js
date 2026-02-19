import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import { cachedFetch } from "../utils/apiCache";

export default function Chalisa() {
  const [chalisa, setChalisa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of items per page

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  useEffect(() => {
    async function fetchChalisa() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        
        // Use cached fetch for better performance
        const json = await cachedFetch(
          `https://api.bhaktibhav.app/frontend/all-Chalisas-v1?page=${currentPage}&limit=${limit}`,
          {},
          5 * 60 * 1000 // Cache for 5 minutes
        );

        if (json.status === "success" && Array.isArray(json.data)) {
          if (currentPage === 1) {
            setChalisa(json.data);
          } else {
            setChalisa(prevChalisa => [...prevChalisa, ...json.data]);
          }
          
          // Check if there are more items to load
          if (json.data.length < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) {
            setChalisa([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("API Error:", error);
        if (currentPage === 1) {
          setChalisa([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchChalisa();
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
      return `/chalisa/${id}`;
    } else {
      if (accessType === "free") {
        return `/chalisa/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!chalisa.length) return <p className="text-center py-10">❌ No chalisa found</p>;

  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} />
      <div className= "h-1"></div>
      <PageTitleCard
        titleHi={"चालीसा"}
        titleEn={"Chalisa"}
        customFontSize={"18px"}
        customEngFontSize={"13px"}
        
      /> 

      {/* Katha Grid */}
      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {chalisa.map((chalisa) => (
            <li key={chalisa._id}>
              <Link
                to={handleNavigate(chalisa._id, chalisa.accessType)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden"
              > 
                <div className="w-full h-40 flex items-center justify-center">
                  <img
                    src={chalisa.imagethumb?.startsWith("http")
                      ? chalisa.imagethumb
                      : `https://api.bhaktibhav.app${chalisa.imagethumb}`
                    }
                    alt={chalisa.name?.hi || chalisa.name?.en}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${isSubscribed ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div> 

                <div className="px-3 py-4">
                  {chalisa.name?.hi && (
                    <h2 className={`md:text-lg text-lg font-semibold truncate font-hindi pt-2 ${isSubscribed ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}>
                      {chalisa.name.hi}
                    </h2>
                  )}
                  {chalisa.name?.en && (
                    <p className={`text-sm truncate font-eng ${isSubscribed ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}>{chalisa.name.en}</p>
                  )} 
                </div>
              </Link>
            </li>
          ))}
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
      {/* {!hasMore && chalisa.length > 0 && (
        <div className="text-center py-4 text-gray-500 font-eng">
          No more चालीसा to load
        </div>
      )} */}

      
    </>
  );
}
