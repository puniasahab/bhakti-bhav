import { createContext, useState } from "react";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("hi");
  const [fontSize, setFontSize] = useState("");

  return (
    <LanguageContext.Provider value={{ language, setLanguage, fontSize, setFontSize }}>
      {children}
    </LanguageContext.Provider>
  );
}
