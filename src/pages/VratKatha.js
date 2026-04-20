import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
// import { useNavigate } from "react-router-dom";
import { cachedFetch } from "../utils/apiCache";
import SEO from "../components/SEO";

import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { homeSchema } from "../seo/schemas";


export default function VratKatha() {
  const navigate = useNavigate();
  const [kathas, setKathas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const baseParams = useGA4BaseParams("Vrat Katha Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  // Memoryize subscription status to prevent re-computation on each render
  const isSubscribed = useMemo(() => getSubscriptionStatusFromLS(), []);
  const hasToken = useMemo(() => getTokenFromLS(), []);
  // const navigate = useNavigate();
  const { setCategoryData } = useKatha();

  const processRawData = useCallback((categories = [], uncategorizedKathas = []) => {
    const newData = [
      ...(categories?.map(item => ({
        ...item,
        isCategory: true,
      })) || []),
      ...(uncategorizedKathas?.map(item => ({
        ...item,
        isCategory: false,
      })) || [])
    ];

    // Assign accessType to categories based on their kathas
    newData.forEach((item) => {
      if (item.isCategory && item.kathas) {
        const allKathasPaid = item.kathas.every(katha => katha.accessType === "paid");
        item.accessType = allKathasPaid ? "paid" : "free";
      }
    });

    return newData;
  }, []);

  // Helper function to sort data
  const sortData = useCallback((data) => {
    return [...data].sort((a, b) => {
      if (a.accessType === "free" && b.accessType === "paid") {
        return -1;
      } else if (a.accessType === "paid" && b.accessType === "free") {
        return 1;
      }
      return 0;
    });
  }, []);

  // Helper function to remove duplicates by _id
  const removeDuplicates = useCallback((data) => {
    const seen = new Set();
    return data.filter(item => {
      if (seen.has(item._id)) {
        return false;
      }
      seen.add(item._id);
      return true;
    });
  }, []);

  const getSortedData = (json) => {
    const newData = [
      ...(json?.categories?.map(item => ({
        ...item, isCategory: true,
      })) || []),
      ...(json?.uncategorizedKathas?.map(item => ({
        ...item, isCategory: false,
      })) || [])
    ]

    newData?.map((item) => {
      if (item.isCategory) {
        const allKathasPaid = item.kathas.every(katha => katha.accessType === "paid");
        if (allKathasPaid) {
          item.accessType = "paid";
        }
        else {
          item.accessType = "free";
        }
      }

    })

    newData.sort((a, b) => {
      if (a.accessType === "free" && b.accessType === "paid") {
        return -1;
      }
      else if (a.accessType === "paid" && b.accessType === "free") {
        return 1;
      }
      else {
        return 0;
      }
    });
    return newData;
  }

  useEffect(() => {
    async function fetchKathas() {
      try {
        /// all-kathas
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        const json = await cachedFetch(
          `https://api.bhaktibhav.app/api/v1/frontend/katha-categories?page=${currentPage}&limit=${limit}`,
          {},
          5 * 60 * 1000 // Cache for 5 minutes
        );

        if (json.status === 'success') {
          const categories = json?.categories || [];
          const uncategorizedKathas = json?.uncategorizedKathas || [];

          // Calculate total items received
          const totalItemsReceived = json?.data?.length;
          // const totalItemsReceived = categories.length + uncategorizedKathas.length;

          // Check if we received any data
          if (totalItemsReceived === 0) {
            // No more data available
            setHasMore(false);
            setLoadingMore(false);
            setLoading(false);
            return;
          }

          console.log("API Response:", json.data);

          // setKathas(json?.data)

          if (currentPage === 1) {
            // const sortedData = getSortedData(json);
            setKathas(json?.data);
          }
          else {
            setKathas(prevKathas => [...prevKathas, ...json?.data]);
          }

          // Process new data from API
          // const processedNewData = processRawData(categories, uncategorizedKathas);

          // if (currentPage === 1) {
          // First page - just set the sorted data
          // const sortedData = sortData(processedNewData);
          // setKathas(sortedData);
          // } 

          // else {
          // Subsequent pages - merge with existing data
          // setKathas(prevKathas => {
          //   // Combine previous data with new data
          //   const combinedData = [...prevKathas, ...processedNewData];
          //   // Remove duplicates
          //   const uniqueData = removeDuplicates(combinedData);
          //   // Sort the combined data
          //   return sortData(uniqueData);
          // });
          // }

          // Check if there's more data to load
          if (totalItemsReceived < limit) {
            setHasMore(false);
          }
        } else {
          // API returned non-success status
          if (currentPage === 1) {
            setKathas([]);
          }
          setHasMore(false);
        }


        // if (json.status === "success" && Array.isArray(json.data)) {
        // Flatten all kathas from all categories
        // const allKathas = [];
        // json.forEach(category => {
        //   if (category.kathas && Array.isArray(category.kathas)) {
        //     allKathas.push(...category.kathas);
        //   }
        // });
        // Sorting code starts from here 
        // const newData = [
        //   ...json.categories.map(item => ({
        //     ...item, isCategory: true,
        //   })),
        //   ...json.uncategorizedKathas.map(item => ({
        //     ...item, isCategory: false,
        //   }))
        // ]

        // newData.map((item) => {
        //   if (item.isCategory) {
        //     const allKathasPaid = item.kathas.every(katha => katha.accessType === "paid");
        //     if (allKathasPaid) {
        //       item.accessType = "paid";
        //     }
        //     else {
        //       item.accessType = "free";
        //     }
        //   }

        // })

        // newData.sort((a, b) => {
        //   if(a.accessType === "free" && b.accessType === "paid") {
        //     return -1;
        //   }
        //   else if(a.accessType === "paid" && b.accessType === "free") {
        //     return 1;
        //   }
        //   else {
        //     return 0;
        //   }
        // });
        // sorting code ends here

        // newData.sort((a, b) => {
        //   if (a.isCategory && !b.isCategory) {
        //     const allKathasPaid = a.kathas.every(katha => katha.accessType === "paid");
        //     if (allKathasPaid && b.accessType === "paid") {
        //       return 0;
        //     }
        //     else if (allKathasPaid && b.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }
        //   }
        //   if (!a.isCategory && b.isCategory) {
        //     const allKathasPaid = b.kathas.every(katha => katha.accessType === "paid");
        //     if (allKathasPaid && a.accessType === "paid") {
        //       return 0;
        //     }
        //     else if (allKathasPaid && a.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }

        //   }
        //   if (!a.isCategory && !b.isCategory) {
        //     if (a.accessType === "free" && b.accessType === "paid") {
        //       return -1;
        //     }
        //     else if (a.accessType === "paid" && b.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return 0;
        //     }
        //   }

        //   if (a.isCategory && b.isCategory) {
        //     const allKathasPaidA = a.kathas.every(katha => katha.accessType === "paid");
        //     const allKathasPaidB = b.kathas.every(katha => katha.accessType === "paid");
        //     if ((allKathasPaidA && allKathasPaidB) || (!allKathasPaidA && !allKathasPaidB)) {
        //       return 0;
        //     }
        //     else if (!allKathasPaidA && !allKathasPaidB) {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }
        //   }
        // })
        // } else {
        //   setKathas([]);
        // }
      } catch (error) {
        console.error("API Error:", error);
        setKathas([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchKathas();
  }, [currentPage]);


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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!kathas.length) return <p className="text-center py-10">❌ No kathas found</p>;

  // const handleNavigation = (id, index) => {
  //   if (kathas[index]?.kathas?.length > 0) {
  //     // Set the category data in context before navigation
  //     setCategoryData(kathas[index].kathas, kathas[index].name);
  //     navigate(`/vrat-katha/categoryDetails/${id}`);
  //   }
  //   else {
  //     navigate(`/vrat-katha/${id}`);
  //   }
  // }

  const handleNavigate = (id, index, accessType, type, kathaId) => {
    const isActiveSubscription = getSubscriptionStatusFromLS();
    console.log("get Subscription Status From LS", isActiveSubscription);
    console.log("Type of subscription status:", typeof isActiveSubscription);
    if (isActiveSubscription) {
      if (type === 'multiple') {
        navigate(`/vrat-katha/categoryDetails/${id}`);
        trackEvent(GA4Events.vrat_katha_category_selected, {
          vratKathaCatgoryId: id,
          event_label: "vrat_katha_category_selected",
          name_en: kathas[index].name?.en,
          name_hi: kathas[index].name?.hi,
        });
      }
      else {
        trackEvent(GA4Events.vrat_katha_selected, {
          vratKathaId: kathaId,
          event_label: "vrat_katha_selected",
          name_en: kathas[index].name?.en,
          name_hi: kathas[index].name?.hi,
        });
        navigate(`/vrat-katha/${kathaId}`);
      }
    }
    else {
      if (type === 'single') {
        if (accessType === 'free') {
          trackEvent(GA4Events.vrat_katha_selected, {
            vratKathaId: kathaId,
            event_label: "vrat_katha_selected",
            name_en: kathas[index].name?.en,
            name_hi: kathas[index].name?.hi,
          });
          navigate(`/vrat-katha/${kathaId}`);
        }
        else {
          if (getTokenFromLS()) {
            navigate("/payment");
          }
          else {
            navigate("/login");
          }
        }
      }
      else {
        trackEvent(GA4Events.vrat_katha_category_selected, {
          vratKathaCatgoryId: id,
          event_label: "vrat_katha_category_selected",
          name_en: kathas[index].name?.en,
          name_hi: kathas[index].name?.hi,
        });
        navigate(`/vrat-katha/categoryDetails/${id}`);
      }
    }
  }

  // const handleNavigate = (id, index, accessType) => {
  //   const isActiveSubscription = getSubscriptionStatusFromLS();
  //   console.log("get Subscription Status From LS", isActiveSubscription);
  //   console.log("Type of subscription status:", typeof isActiveSubscription);
  //   if (isActiveSubscription) {
  //     console.log("Inside subscription true");
  //     if (kathas[index]?.kathas?.length > 0 || kathas[index]?.isCategory) {
  //       setCategoryData(kathas[index].kathas, kathas[index].name);
  //       navigate(`/vrat-katha/categoryDetails/${id}`);
  //     }
  //     else {
  //       navigate(`/vrat-katha/${id}`);
  //     }
  //   }
  //   else {
  //     if (kathas[index]?.kathas?.length > 0 || kathas[index]?.isCategory) {
  //       if (kathas[index]?.kathas?.length > 0) {
  //         // Set the category data in context before navigation
  //         setCategoryData(kathas[index].kathas, kathas[index].name);
  //         navigate(`/vrat-katha/categoryDetails/${id}`);
  //       }
  //       // Update this route as needed
  //     }

  //     else if (!kathas[index]?.isCategory) {
  //       if (kathas[index]?.accessType === "free") {
  //         navigate(`/vrat-katha/${id}`);
  //       }
  //       else {
  //         if (getTokenFromLS()) {
  //           navigate("/payment");
  //         }
  //         else {
  //           navigate("/login");
  //         }
  //       }
  //     }
  //     else {
  //       if (getTokenFromLS()) {
  //         return "/payment";
  //       }
  //       else {
  //         return "/login";
  //       }
  //     }
  //   }

  // }

  const getPaidLogic = (katha) => {
    if (katha.isCategory) {
      const allKathasPaid = katha.kathas.every(katha => katha.accessType === "paid");
      if (allKathasPaid) {
        return "blur-sm";
      }
      else {
        return "";
      }
    }
    else {
      return katha.accessType === "paid" ? "blur-sm" : "";
    }
  }
  return (
    <>

      <SEO title="Complete Hindu Vrat Katha Collection in Hindi | All Vrat Stories | भक्ति भाव" description="Explore complete Hindu vrat katha collection including Ekadashi, Pradosh, Purnima, and more with pooja vidhi and benefits in Hindi" canonical="https://bhaktibhav.app/vrat-katha" schema={homeSchema}/>
      <Header />

      <PageTitleCard
        titleHi={"ozr dFkk"}
        titleEn={"Vrat Katha"}
        customEngFontSize={"14px"}
        customFontSize={"24px"}

      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {kathas.map((katha, index) => (
            <li key={katha._id}>
              <div
                onClick={() => handleNavigate(katha._id, index, katha.accessType, katha.type, katha.kathaId)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden cursor-pointer"
              >
                <div className="w-full h-40 flex items-center justify-center overflow-hidden  ">
                  <img

                    src={`${katha.imagethumb}`}
                    alt={katha.name?.hi || katha.name?.en}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}
                  />
                </div>
                <div className="p-2">
                  {katha.name?.hi && (
                    <h2 className={`md:text-xl text-lg font-semibold truncate font-hindi pt-3 ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}>
                      {katha.name.hi.replace(/\//g, "|").replace(/\|/g, "।")}
                    </h2>
                  )}
                  {katha.name?.en && (
                    <p className={`text-sm truncate font-eng ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}>{katha.name.en}</p>
                  )}

                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A283D]"></div>
          <span className="ml-2 text-[#9A283D] font-eng">Loading more...</span>
        </div>
      )}

    </>
  );
}
