import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import Loader from "../components/Loader";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";

export default function VratKathaCategoryDetails() {
  const [kathaCategoryData, setKathaCategoryData] = useState({ category: {}, kathas: [] });
  const [loading, setLoading] = useState(true);
  const { selectedCategoryKathas, selectedCategoryName } = useKatha();
  const navigate = useNavigate();
  const { id } = useParams();

  const baseParams = useGA4BaseParams("Vrat Katha Category Details Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    // If no data is available, redirect back to main katha page
    // if (!selectedCategoryKathas.length) {
    //   navigate('/vrat-katha');
    // }
    fetch(`https://api.bhaktibhav.app/api/v1/frontend/katha-category/${id}`).then(res => res.json()).then(resJson => {
      if (resJson.status === "success" && resJson.category) {
        // Data is available, do nothing
        console.log("This is data that we have to show", resJson.kathas);
        setKathaCategoryData({ category: resJson.category, kathas: resJson.kathas });
        setLoading(false);
      }
      else {
        // No data, navigate back
        // navigate('/vrat-katha');
      }
    }).catch(err => {
      console.error("Error fetching category details:", err);
      // navigate('/vrat-katha');
    });
  }, [id, navigate]);

  if (!kathaCategoryData?.kathas?.length) {
    return <div>Loading...</div>;
  }


  const getNavigationPath = (id, accessType) => {
  if (getSubscriptionStatusFromLS()) return `/vrat-katha/${id}`;
  if (accessType === "free") return `/vrat-katha/${id}`;
  if (getTokenFromLS()) return "/payment";
  return "/login";
};
const handleTrackEvent = (id, katha) => {
  const accessType = katha.accessType;
  if (getSubscriptionStatusFromLS() || accessType === "free") {
    trackEvent(GA4Events.vrat_katha_selected, {
      vratKathaId: id,
      event_label: "vrat_katha_selected_from_category_details",
      name_en: katha.name?.en,
      name_hi: katha.name?.hi,
    });
  }
};

  // const handleNavigation = (id, accessType, katha) => {
  //   if (getSubscriptionStatusFromLS()) {
  //     trackEvent(GA4Events.vrat_katha_selected, {
  //       vratKathaId: id,
  //       event_label: "vrat_katha_selected_from_category_details",
  //       name_en: katha.name?.en,
  //       name_hi: katha.name?.hi,
  //     });
  //     return `/vrat-katha/${id}`;
  //   }
  //   else {
  //     if (accessType === "free") {
  //       trackEvent(GA4Events.vrat_katha_selected, {
  //         vratKathaId: id,
  //         event_label: "vrat_katha_selected_from_category_details",
  //         name_en: katha.name?.en,
  //         name_hi: katha.name?.hi,
  //       });
  //       return `/vrat-katha/${id}`;
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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;



  return (
    <>
      <Header hideEditIcon={true} showProfileHeader={true} profileText="भक्ति भाव" />
      <div className="h-2"></div>
      <PageTitleCard
        titleHi={kathaCategoryData?.category.name?.hi || "dFkk"}
        titleEn={kathaCategoryData?.category.name?.en || "Katha"}
        customEngFontSize={"13px"}
        customFontSize={"19px"}
      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {kathaCategoryData?.kathas?.sort((a, b) => {
            if (a.accessType === "free" && b.accessType === "paid") return -1;
            if (a.accessType === "paid" && b.accessType === "free") return 1;
            return 0;
          }).map((katha) => (
            <li key={katha._id}>
              <Link
                to={getNavigationPath(katha._id, katha.accessType)}
                onClick = {() => {handleTrackEvent(katha._id, katha);}}
                className="relative block rounded-xl overflow-hidden shadow-lg"
              >
                <div className="overflow_bg">
                  <img
                    src={katha.imagethumb || katha.imageUrl}
                    alt={katha.name?.hi || katha.name?.en}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%] ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}>
                    {katha.name?.hi && (
                      <h2 className="text-xl font-bold font-hindi">
                        {katha.name.hi.replace(/\//g, "|").replace(/\|/g, "।")}
                      </h2>
                    )}
                    {katha.name?.en && (
                      <p className="text-sm font-eng">{katha.name.en}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* <Footer /> */}
    </>
  );
}
