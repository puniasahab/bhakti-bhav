const getMantraText = (value, language) => {
  if (typeof value === "string") return value.replace(/<[^>]*>/g, " ").trim();
  if (!value || typeof value !== "object") return "";
  return getMantraText(value[language] || value.hi || value.en || value.hinglish || value.text || value.title, language);
};

export const getJaapMantras = (mantras, language) => {
  if (!Array.isArray(mantras)) return [];
  return mantras.map((mantra, index) => ({
    key: mantra?._id ? String(mantra._id) : String(index),
    text: getMantraText(mantra, language)
  })).filter((mantra) => mantra.text);
};
