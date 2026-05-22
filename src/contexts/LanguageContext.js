import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { languageApis } from "../api";

export const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = "bhakti_bhav_language";

const normalizeLanguages = (response) => {
  const languages = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.languages)
        ? response.languages
        : [];

  return languages
    .filter((item) => item?.code && item?.name)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANGUAGE_STORAGE_KEY) || "hi");
  const [languages, setLanguages] = useState([]);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [languageError, setLanguageError] = useState("");
  const [fontSize, setFontSize] = useState("");

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  }, []);

  const fetchLanguages = useCallback(async () => {
    setLanguageLoading(true);
    setLanguageError("");

    try {
      const response = await languageApis.getLanguages();
      const normalizedLanguages = normalizeLanguages(response);
      setLanguages(normalizedLanguages);

      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const selectedLanguage = normalizedLanguages.find((item) => item.code === storedLanguage);

      if (!selectedLanguage && normalizedLanguages.length > 0) {
        const hindiLanguage = normalizedLanguages.find((item) => item.code === "hi");
        setLanguage(hindiLanguage?.code || normalizedLanguages[0].code);
      }
    } catch (error) {
      setLanguageError("Unable to load languages");
    } finally {
      setLanguageLoading(false);
    }
  }, [setLanguage]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const selectedLanguage = useMemo(
    () => languages.find((item) => item.code === language) || null,
    [language, languages]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        selectedLanguage,
        languages,
        languageLoading,
        languageError,
        fetchLanguages,
        fontSize,
        setFontSize
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
