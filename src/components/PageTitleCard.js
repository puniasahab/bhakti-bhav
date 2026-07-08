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
  isFromJaapMala = false, // New prop to indicate if it's from JaapMala
  isHinglishLanguageSelected = false // When true, show both Hindi and English titles together (Hindi bigger, English smaller, next line)
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
    // When hinglish mode is explicitly requested, show Hindi + English together
    // (Hindi on top, English smaller on the next line) regardless of activeLanguage.
    if (isHinglishLanguageSelected && (titleHi || titleEn)) {
      return {
        isHinglish: true,
        hindiText: titleHi ? getData(titleHi) : "",
        englishText: titleEn || ""
      };
    }

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
        className={`mb-0 w-auto py-1 px-4 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto theme_text font-[500] shadow-md text-center ${(!appliedFontSize || titleData.isHinglish) ? textSize : ''}`}
        style={{
          ...(appliedFontSize && !titleData.isHinglish ? { fontSize: appliedFontSize } : {}),
          borderLeft: "2px solid #f76009ff",
          borderRight: "2px solid #f76009ff",
          borderBottom: "2px solid #f76009ff",
          borderTop: "none",
        }}  
      >
        {titleData.isHinglish ? (
          <div className="flex flex-col items-center leading-tight">
            {titleData.hindiText && (
              <span
                className={`font-hindi ${!customFontSize ? "text-lg" : ""}`}
                style={customFontSize ? { fontSize: customFontSize } : {}}
              >
                {titleData.hindiText}
              </span>
            )}
            {titleData.englishText && (
              <span
                className={`block font-eng ${!customEngFontSize ? "text-xs" : ""}`}
                style={customEngFontSize ? { fontSize: customEngFontSize } : {}}
              >
                {titleData.englishText}
              </span>
            )}
          </div>
        ) : (
          <div className={titleData.className}>
            {titleData.text}
          </div>
        )}
      </p>
    </div>
  );
};

export default PageTitleCard;
