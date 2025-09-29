// components/TitleCard.jsx
import React from "react";

const PageTitleCard = ({ titleHi, titleEn, language = "hi", textSize = "text-xl", engTextSize="text-xs" }) => {
  return (
    <div className="flex justify-center items-center mb-3">
      <p
        className={`mb-0 w-auto py-1 px-4 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto theme_text font-bold shadow-md ${textSize}`}
      >
        {language === "hi" ? titleHi : titleEn}
        <span className={`font-eng text-xs ml-2 ${engTextSize}`}>
          ({language === "hi" ? titleEn : titleHi})
        </span>
      </p>
    </div>
  );
};

export default PageTitleCard;
