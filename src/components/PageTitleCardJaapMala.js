// components/TitleCard.jsx
import React from "react";

const PageTitleCardJaapMala = ({ 
  titleHi, 
  titleEn, 
  language = "hi", 
  textSize = "text-xl", 
  engTextSize = "text-xs",
  customFontSize, // Font size in pixels for main title
  customEngFontSize, // Font size in pixels for subtitle
  isFromJaapMala = false // New prop to indicate if it's from JaapMala
}) => {
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
  return (
    <div className="flex justify-center items-center mb-3">
      <div className="w-auto py-1 px-4 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto theme_text font-bold shadow-md text-center">
        <div 
          className={`mb-0 font-eng ${!customFontSize ? textSize : ''}`}
          style={customFontSize ? { fontSize: customFontSize } : {}}
        >
          {language === "hi" ? getData(titleHi) : titleEn}
        </div>
        <div 
          className={`font-eng ${!customEngFontSize ? engTextSize : ''}`}
          style={customEngFontSize ? { fontSize: customEngFontSize } : {}}
        >
          ({language === "hi" ? titleEn : titleHi})
        </div>
      </div>
    </div>
  );
};

export default PageTitleCardJaapMala;
