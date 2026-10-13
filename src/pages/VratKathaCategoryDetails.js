import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import PageTitleCard from "../components/PageTitleCard";
import Loader from "../components/Loader";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { vratKathaApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { renderHindiText } from "../utils/renderHindiText";

export default function VratKathaCategoryDetails() {
  const [kathaCategoryData, setKathaCategoryData] = useState({ category: {}, kathas: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Support both /vrat-katha/categoryDetails/:id and /vrat-katha/category/:categoryId routes
  const { id, categoryId } = useParams();
  const currentId = id || categoryId;

  const baseParams = useGA4BaseParams("Vrat Katha Category Details Screen");
  const { trackEvent } = useGA4Tracker(baseParams);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    vratKathaApis
      .fetchVratKathaCategoryData("v3", currentId, language)
      .then((resJson) => {
        if (resJson.status === "success" && resJson.category) {
          setKathaCategoryData({ category: resJson.category, kathas: resJson.kathas || [] });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching category details:", err);
        setLoading(false);
      });
  }, [currentId, language]);

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

  if (loading)
    return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;


  return (
    <>
      <Header hideEditIcon={true} showProfileHeader={true} profileText="भक्ति भाव" backRoute="/vrat-katha" />
      <div className="h-2"></div>
      {(() => {
        const rawName = kathaCategoryData?.category?.name;
        const hiName = (typeof rawName === "string" ? rawName : rawName?.hi || "").trim();
        const enName = (typeof rawName === "string" ? rawName : rawName?.en || "Katha").trim();
        const name2 = kathaCategoryData?.category?.name2 || "";
        const hinglishLanguageNames = name2.includes("\n") ? name2.split("\n") : [name2, ""];
        const hiHin = hinglishLanguageNames[0]?.trim() || hiName;
        const enHin = hinglishLanguageNames[1]?.trim() || enName;
        return (
          <PageTitleCard
            titleHi={language === "hinglish" ? hiHin : hiName}
            titleEn={language === "hinglish" ? enHin : enName}
            isHinglishLanguageSelected={language === "hinglish"}
            customEngFontSize={language === "hinglish" ? "15px" : "16px"}
            customFontSize={"19px"}
          />
        );
      })()}

      <div className="container mx-auto px-4 mt-3">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {kathaCategoryData?.kathas
            ?.sort((a, b) => {
              if (a.accessType === "free" && b.accessType === "paid") return -1;
              if (a.accessType === "paid" && b.accessType === "free") return 1;
              return 0;
            })
            .map((katha) => (
              <li key={katha._id}>
                <Link
                  to={getNavigationPath(katha._id, katha.accessType)}
                  onClick={() => {
                    handleTrackEvent(katha._id, katha);
                  }}
                  className="relative block rounded-xl overflow-hidden shadow-lg"
                >
                  <div>
                    <img
                      src={katha.imagethumb || katha.imageUrl}
                      alt={
                        typeof katha.name === "string"
                          ? katha.name
                          : katha.name?.hi || katha.name?.en || ""
                      }
                      className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${
                        getSubscriptionStatusFromLS()
                          ? ""
                          : katha.accessType === "paid"
                          ? "blur-sm"
                          : ""
                      }`}
                    />
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
