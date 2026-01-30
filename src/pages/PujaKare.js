import React, { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { pujaKareApis } from "../api";
import { usePujaKare } from "../contexts/PujaKareContext";

export default function PujaKare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const { updatePujaKareItems } = usePujaKare();

  useEffect(() => {
    async function fetchItems() {
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);
        
        const res = await pujaKareApis.getPujaKareItems(currentPage, limit);
        const itemsData = res.data || [];
        
        if (currentPage === 1) {
          setItems(itemsData);
        } else {
          setItems(prevItems => [...prevItems, ...itemsData]);
        }
        
        // Check if there's more data
        if (itemsData.length < limit) {
          setHasMore(false);
        }
        
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
