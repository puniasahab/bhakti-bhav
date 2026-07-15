import React, { useState, useEffect, useContext } from "react";
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
import { vratKathaApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { renderHindiText } from "../utils/renderHindiText";

export default function VratKathaCategoryDetails() {
  const [kathaCategoryData, setKathaCategoryData] = useState({ category: {}, kathas: [] });
  const [loading, setLoading] = useState(true);
  const { selectedCategoryKathas, selectedCategoryName } = useKatha();
  const navigate = useNavigate();
  const { id } = useParams();

  const baseParams = useGA4BaseParams("Vrat Katha Category Details Screen");
  const { trackEvent } = useGA4Tracker(baseParams);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    setLoading(true);
    vratKathaApis.fetchVratKathaCategoryData("v3", id, language)
      .then(resJson => {
        if (resJson.status === "success" && resJson.category) {
          console.log("This is data that we have to show", resJson.kathas);
          setKathaCategoryData({ category: resJson.category, kathas: resJson.kathas });
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Error fetching category details:", err);
      });
  }, [id, language]);

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

  const HighlightNumbers = (text) => {

        // Split text into segments — words, numbers, and symbols
        const parts = text.split(/(\d+)/g);

        return (
            <span>
                {parts.map((part, index) =>
                    /^\d+$/.test(part) ? (
                        <span
                            key={index}
                            style={{
                                fontFamily: "Roboto Mono, monospace",
                                // fontWeight: "600",
                                color: "black",
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        <span key={index}>{part.replace(/,/g, ']').replace(/\(/g, "¼").replace(/\)/g, "½").replace(/-/g, " ").replace(/\:/g, "ः").replace(/\//g, " ").replace(/"/g, "”")       // Replace plain English quotes with right Hindi quote
                                    .replace(/``|''/g, "”")   // Replace double single quotes
                                    .replace(/“/g, "")       // Normalize any weird quote forms
                                    .replace(/”/g, "")}</span>
                    )
                )}
            </span>
        );
    };

    

    const hindiToEnglishMap = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};



const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const formatHindiName = (name) => String(name || "")
  .replace(/\//g, "|").replace(/\|/g, "।")
  .replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½")
  .replace(/\:/g, "%").replace(/:/g, "ः")
  .replace(/ँ/g, "ं")
  .replace(/\u200D|\u200C/g, "  ")
  .replace(/[.,;!?'"""'']/g, " ")
  .replace(/[\[\]{}()]/g, "")
  .replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ")
  .replace(/[^\u0900-\u097F\s।॥]/g, "")
  .replace(/\u00A0/g, " ")
  .replace(/\u200B|\u200C|\u200D/g, " ")
  .replace(/\s+/g, " ")
  .normalize("NFC");

const getHinglishNameParts = (name) => {
  const lines = stripHtmlTags(name)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hindiText = lines[0] || "";
  const englishText = lines.slice(1).join(" ");

  return {
    hindiText,
    englishText: englishText
      ? englishText.startsWith("(") && englishText.endsWith(")")
        ? englishText
        : `(${englishText.replace(/^\(|\)$/g, "").trim()})`
      : ""
  };
};

const renderVratKathaName = (katha, language) => {
  if (language === "hi") {
    return formatHindiName(katha.name);
  }

  if (language !== "hinglish") {
    return katha.name;
  }

  const { hindiText, englishText } = getHinglishNameParts(katha.name2 || katha.name);

  if (!englishText) {
    return <span className="font-eng">{hindiText}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-lg md:text-xl leading-tight">{formatHindiName(hindiText)}</span>
      <span className="block font-eng text-xs md:text-sm leading-tight">{englishText}</span>
    </>
  );
};

const getVratKathaAltText = (katha, language) => {
  if (language === "hinglish") {
    return stripHtmlTags(katha.name2 || katha.name);
  }

  return stripHtmlTags(katha.name);
};



const formatKathaName = (name) => {
  return (typeof name === "string" ? name : (name?.hi || ""))
    // Step 1 - Normalize unicode
    .normalize("NFC")
    // Step 2 - Convert Hindi digits to English digits
    .replace(/[०-९]/g, digit => hindiToEnglishMap[digit])
    // Step 3 - Convert forward slash to Hindi danda
    .replace(/\//g, "।")
    // Step 4 - Remove zero-width characters
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    // Step 5 - Collapse multiple spaces
    .replace(/\s+/g, " ")
    // Step 6 - Trim
    .trim();
};

const renderMixedText = (text) => {
  if (!text) return null;

  const parts = text.split(/([0-9().,:]+)/g);

  return parts.map((part, index) => {
    if (/^[0-9().,:]+$/.test(part)) {
      return (
        <div key={index} className="font-eng">
          {part}
        </div>
      );
    }
    return (
      <div key={index} className="font-hindi">
        {part}
      </div>
    );
  });
};

  return (
    <>
      <Header hideEditIcon={true} showProfileHeader={true} profileText="भक्ति भाव" />
      <div className="h-2"></div>
      {(() => {
        const rawName = kathaCategoryData?.category?.name;
        const nameStr = typeof rawName === "string" ? rawName : (rawName?.hi || "");
        const hiName = nameStr.replace(/\//g, "|").replace(/\|/g, "।").replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/:/g, "ः").replace(/ँ/g, "ं").replace(/\u200D|\u200C/g, "  ").replace(/[.,;!?'"""'']/g, " ").replace(/[\[\]{}()]/g, "").replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ").replace(/[^\u0900-\u097F\s।॥]/g, "").replace(/\u00A0/g, " ").replace(/\u200B|\u200C|\u200D/g, " ").replace(/\s+/g, " ").normalize("NFC") || "dFkk";
        const enName = typeof rawName === "string" ? rawName : (rawName?.en || "Katha");
        const hinglishLanguageNames = kathaCategoryData?.category?.name2.split("\n");
        const hiHin = hinglishLanguageNames[0];
        const enHin = hinglishLanguageNames[1];
        return (
          <PageTitleCard
            titleHi={language === 'hinglish' ? hiHin : hiName}
            titleEn={language === 'hinglish' ? enHin : enName}
            isHinglishLanguageSelected={language === "hinglish"}
            customEngFontSize={language === 'hinglish' ? '15px' : '16px'}
            customFontSize={"19px"}
          />
        );
      })()}


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
                onClick={() => { handleTrackEvent(katha._id, katha); }}
                className="relative block rounded-xl overflow-hidden shadow-lg"
              >
                <div className={`overflow_bg ${language === "hinglish" ? "aarti-hinglish-title" : ""}`}>
                  <img
                    src={katha.imagethumb || katha.imageUrl}
                    alt={typeof katha.name === "string" ? katha.name : (katha.name?.hi || katha.name?.en || "")}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 ${language === 'hinglish' ? 'top-[52%]' : 'top-[60%]'} ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}>
                    {language !== "hinglish" && katha.name && (
                      <h2 className={`text-${katha.name.length > 20 ? 'sm' : 'md'} font-bold ${language === "hi" ? "font-hindi" : "font-eng text-sm"}`}>
                        {language === "hi"
                          ? id === "6a17ded44f7e9477ea58e92c" ? renderHindiText(typeof katha.name === "string" ? katha.name : (katha.name?.hi || ""))
                              : (typeof katha.name === "string" ? katha.name : (katha.name?.hi || "")).replace(/\//g, "|").replace(/\|/g, "।").replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/:/g, "ः").replace(/ँ/g, "ं").replace(/\u200D|\u200C/g, "  ").replace(/[.,;!?'"""'']/g, " ").replace(/[\[\]{}()]/g, "").replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ").replace(/[^\u0900-\u097F\s।॥]/g, "").replace(/\u00A0/g, " ").replace(/\u200B|\u200C|\u200D/g, " ").replace(/\s+/g, " ").replace(/[०-९]/g, digit => hindiToEnglishMap[digit]).normalize("NFC")
                          : (typeof katha.name === "string" ? katha.name : (katha.name?.en || katha.name?.hi || ""))}
                      </h2>
                    )}

                     {language === "hinglish" && (katha.name2 || katha.name) && (
                                        <h2 className={`font-semibold pt-3 text-center font-eng text-sm ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}>
                                          {renderVratKathaName(katha, language)}
                                        </h2>
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
