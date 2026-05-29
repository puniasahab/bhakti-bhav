// components/TitleCard.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

const PageTitleCard = ({ 
  titleHi, 
  titleEn, 
  language, 
  fontEnglish = false,
  textSize = "text-xl", 
  customFontSize,    // Font size in pixels for Hindi title
  customEngFontSize, // Font size in pixels for English title
  isFromJaapMala = false // New prop to indicate if it's from JaapMala
}) => {
  const { language: selectedLanguage } = useContext(LanguageContext);
  const activeLanguage = language || selectedLanguage || "hi";

   const convertHindiToEnglishNumerals = (text) => {
    if (!text) return text;
    const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let convertedText = text;
    hindiNumerals.forEach((hindi, index) => {
      convertedText = convertedText.replace(new RegExp(hindi, 'g'), englishNumerals[index]);
    });
    return convertedText;
  };

  const getData = (text) => {
    return isFromJaapMala ? convertHindiToEnglishNumerals(text) : text;
  }

  const getTitleData = () => {
    if (activeLanguage === "hi" && titleHi) {
      return {
        text: getData(titleHi),
        className: fontEnglish ? "font-eng" : "font-hindi"
      };
    }

    if (activeLanguage !== "hi" && titleEn) {
      return {
        text: titleEn,
        className: "font-eng"
      };
    }

    if (titleHi) {
      return {
        text: getData(titleHi),
        className: fontEnglish ? "font-eng" : "font-hindi"
      };
    }

    return {
      text: titleEn,
      className: "font-eng"
    };
  };

  const titleData = getTitleData();
  const appliedFontSize = activeLanguage === "hi"
    ? customFontSize
    : (customEngFontSize || customFontSize);

  return (
    <div className="flex justify-center items-center mt-1 mb-3">
      <p
        className={`mb-0 w-auto py-1 px-4 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto theme_text font-[500] shadow-md text-center ${!appliedFontSize ? textSize : ''}`}
        style={{
          ...(appliedFontSize ? { fontSize: appliedFontSize } : {}),
          borderLeft: "2px solid #f76009ff",
          borderRight: "2px solid #f76009ff",
          borderBottom: "2px solid #f76009ff",
          borderTop: "none",
        }}  
      >
        <div className={titleData.className}>
          {titleData.text}
        </div>
      </p>
    </div>
  );
};

export default PageTitleCard;
