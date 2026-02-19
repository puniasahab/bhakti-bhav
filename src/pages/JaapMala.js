import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";
import { cachedFetch } from "../utils/apiCache";

function JaapMala() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // Memoize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);

  useEffect(() => {
    const fetchJaapMalaData = async () => {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        
        // Use cached fetch for better performance
        const result = await cachedFetch(
          `https://api.bhaktibhav.app/frontend/all-jaapmala-v1?page=${currentPage}&limit=${limit}`,
          {},
          5 * 60 * 1000 // Cache for 5 minutes
        );
        
        if (result.status === "success" && Array.isArray(result.data)) {
          if (currentPage === 1) {
            setData(result.data);
          } else {
            setData(prevData => [...prevData, ...result.data]);
          }
          
          // Check if there's more data
          if (result.data.length < limit) {
            setHasMore(false);
          }
        } else {
          if (currentPage === 1) {
            setData([]);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
        if (currentPage === 1) {
          setData([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchJaapMalaData();
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

  // Memoized navigation handler
  const handleNavigate = useCallback((id, accessType) => {
    if (isSubscribed) {
      return `/jaapmala/${id}`;
    } else {
      if (accessType === "free") {
        return `/jaapmala/${id}`;
      } else {
        return hasToken ? "/payment" : "/login";
      }
    }
  }, [isSubscribed, hasToken]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  function toHindiDigits(str) {
  const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
  return str.replace(/\d/g, d => map[d]);
}


const HindiWithEnglishNumbers = ( text ) => {
  // Split text by numbers while keeping numbers in result
  const parts = text.split(/(\d+)/);

  return (
    <h2 className="text-xl font-bold">
      {parts.map((part, index) => {
        if (/^\d+$/.test(part)) {
          // Numbers only
          return (
            <span key={index} className="font-eng">
              {part}
            </span>
          );
        } else {
          // Hindi or other text
          return (
            <span key={index} className="font-hindi" style={{fontSize: '18px'}}>
              {part}
            </span>
          );
        }
      })}
    </h2>
  );
};

  return (
    <>
      <Header pageName={{ hi: "tkkp ekyk", en: "Jaap mala" }} />
      <PageTitleCard
        titleHi={"tki ekyk"}
        titleEn={"Jaap mala"}
        customEngFontSize={"13px"}
        customFontSize={"21px"}
      />

      <div className="container mx-auto px-4">

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((item) => (
            <li key={item._id}>
              <Link
                to={handleNavigate(item._id, item.accessType)}
                className="relative block rounded-xl overflow-hidden shadow-lg  "
              >
                <div className={`overflow_bg`}>

                  <img
                    src={
                      item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : `https://api.bhaktibhav.app${item.imageUrl}`
                    }
                    alt={item.title.en}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%] ${isSubscribed ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                    {/* <h2 className="text-xl font-bold" 
                    // style={{fontFamily: "KrutiDev"}}>
                      >{item.title.hi}</h2> */}
                      {HindiWithEnglishNumbers(item.title.hi)}
                    <p className="text-sm font-eng" style={{fontSize: '13px'}}>{item.title.en}</p>
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
        {/* {!hasMore && data.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>🙏 सभी जप माला लोड हो गए हैं 🙏</p>
            <p className="text-sm">All Jaap Mala loaded</p>
          </div>
        )} */}
      </div>

    </>
  );
}

export default JaapMala;
