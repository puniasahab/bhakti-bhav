import React, { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import SEO from "../components/SEO";
import { homeSchema } from "../seo/schemas";
import { rashifalSchema } from "../schemas/pageSchemas";
import SchemaMarkup from "../components/SchemaMarkup";
import { LanguageContext } from "../contexts/LanguageContext";
const RASHIFAL_CACHE_TTL = 5 * 60 * 1000;
const RASHI_LIST_CACHE_KEY = "rashifal:rashi-list";
const rashifalCache = new Map();
const pendingRashifalRequests = new Map();

const getValidCachedRashifal = (cacheKey) => {
  const cached = rashifalCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < RASHIFAL_CACHE_TTL) {
    return cached.data;
  }

  rashifalCache.delete(cacheKey);
  return null;
};

const getCachedRashifal = async (cacheKey, fetcher) => {
  const cached = getValidCachedRashifal(cacheKey);

  if (cached) {
    return cached;
  }

  if (pendingRashifalRequests.has(cacheKey)) {
    return pendingRashifalRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      rashifalCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    })
    .finally(() => {
      pendingRashifalRequests.delete(cacheKey);
    });

  pendingRashifalRequests.set(cacheKey, request);
  return request;
};

const getRashiList = (response) =>
  response?.status === "success" && Array.isArray(response.data) ? response.data : [];

function Rashifal() {
  
    const { language } = useContext(LanguageContext);
  const cachedRashiList = getValidCachedRashifal(RASHI_LIST_CACHE_KEY);
  const [rashis, setRashis] = useState(() => getRashiList(cachedRashiList));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState(null);
  const [loading, setLoading] = useState(!cachedRashiList);

  const baseParams = useGA4BaseParams("Rashifal Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  const rashiImages = {
    mesh: "/img/aries.png",
    vrishabh: "/img/taurus.png",
    mithun: "/img/gemini.png",
    kark: "/img/cancer.png",
    singh: "/img/leo.png",
    kanya: "/img/virgo.png",
    tula: "/img/libra.png",
    vrishchik: "/img/scorpio.png",
    dhanu: "/img/sagittarius.png",
    makar: "/img/capricorn.png",
    kumbh: "/img/aquarius.png",
    meen: "/img/pisces.png",
  };

  useEffect(() => {
    if (!getValidCachedRashifal(RASHI_LIST_CACHE_KEY)) {
      setLoading(true);
    }

    getCachedRashifal(RASHI_LIST_CACHE_KEY, () =>
      fetch("https://api.bhaktibhav.app/frontend/all-rashis").then((res) => res.json())
    )
      .then((resJson) => {
        const nextRashis = getRashiList(resJson);

        if (nextRashis.length) {
          setRashis(nextRashis);
          console.log("Fetched rashis:", nextRashis);
        } else {
          setRashis([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setRashis([]);
        setLoading(false);
      });
  }, []);

  const openModal = async (rashi) => {


    trackEvent(GA4Events.rashi_selected, {
      id: rashi._id,
      event_label: `rashi_${rashi.key}_selected`,
      name_en: rashi.name?.en,
      name_hi: rashi.name?.hi,
    });
    console.log("Opening modal for rashi:", rashi._id);



    try {
      const data = await getCachedRashifal(
        `rashifal:today:${rashi._id}`,
        () => fetch(`https://api.bhaktibhav.app/frontend/today/${rashi._id}`).then((res) => res.json())
      );
      console.log("API response:", data);

      const todayData = Array.isArray(data) ? data[0] : null;
      let content = todayData?.points?.[0];

      if (!content || typeof content !== "object") {
        content = {
          hi: ["आज का राशिफ़ल उपलब्ध नहीं है।"],
          en: ["Rashifal not available."],
        };
      }

      setSelectedRashi({
        ...rashi,
        content,
        image: rashiImages[rashi.key] || "/img/default.png",
      });

      trackEvent(GA4Events.rashifal_viewed, {
        id: rashi._id,
        event_label: `rashifal_${rashi.key}_viewed`,
        name_en: rashi.name?.en,
        name_hi: rashi.name?.hi,
      });

      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching rashifal details:", err);
    }
  };

  const closeModal = () => {
    trackEvent(GA4Events.rashifal_pop_up_closed, {
      id: selectedRashi?._id,
      event_label: `rashifal_${selectedRashi?.key}_pop_up_closed`,
    });
    setModalOpen(false);
    setSelectedRashi(null);
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
function normalizeHindiText(text) {
  return text
    .replace(/[‚،﹐，]/g, ",")
    .replace(/[।﹒｡]/g, "।")
    .replace(/\s+/g, " ")
    .trim();
}
function normalizeEnglishText(text) {
  return text
    .replace(/[‚،﹐，]/g, ",")
    .replace(/[।﹒｡]/g, ".")
    .replace(/\.([A-Z])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const replacements = {
    ",": "၊",     // comma alternative — or you can keep "," if you prefer
    ";": "]",     // semicolon alternative (or just "।" if you want sentence end)
    ":": "꠱",     // colon alternative
    "?": "?",     // optional: can replace with "?"
    "!": "!",     // optional: can replace with "!"
    ".": "।",   // Hindi "पूर्णविराम" (Danda) 
    "-": "–",     
  };
  return (
    <>
      <SchemaMarkup schema={rashifalSchema} />
      <SEO title = "Daily Horoscope Hindi, Today Rashifal, Weekly & Monthly Rashifal | भक्ति भाव" description="Get today rashifal in Hindi, daily horoscope updates, and weekly & monthly zodiac predictions for all signs – Bhakti Bhav." canonical="https://bhaktibhav.app/rashifal" schema = {homeSchema}/>
      <Header pageName={{ hi: "jkf'kQy", en: "Rashifal" }} />

      <PageTitleCard
        titleHi={"vkt dk jkf'kQy"}
        titleEn={"Aaj Ka Rashifal"}
        isHinglishLanguageSelected={language === "hinglish"}
        customEngFontSize={"14px"}
        customFontSize={"22px"}
      />

        <div className="container mx-auto mt-4 px-4">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:py-6 py-3 text-center">
            {rashis.map((item) => (
              <li key={item._id}>
                <button
                  onClick={() => openModal(item)}
                  className="block bg-[#9A283D] shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl hover:rounded-[10px] hover:scale-105 transition-all duration-300 ease-in-out w-full"
                >
                  <div className="w-full h-24 flex items-center justify-center mt-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name.en}
                      className="w-auto rounded-md max-h-[100%]"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white font-eng">
                      {item.name.en}
                    </h2>
                    <p className="text-2xl rashi">{item.name.hi}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        {modalOpen && selectedRashi && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full relative p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center flex flex-col items-center">
                <div className="bg-[#9A283D] rounded-lg flex items-center justify-center  mb-4">
                  <img
                    src={selectedRashi.imageUrl}
                    alt={selectedRashi.name?.en}
                    className="h-32 w-auto rounded-md mx-auto"
                  />

                </div>
                <h2 className="text-2xl theme_text mb-1 font-eng">
                  {selectedRashi.name?.hi} <span className="ml-2 text-lg">({selectedRashi.name?.en})</span>
                </h2>

              </div>

              <div className="text-start theme_text my-5">
                {selectedRashi.content?.hi?.length > 0 && (
                  <ul className="space-y-2">
                    {selectedRashi.content.hi.map((line, idx) => (
                      <li key={idx} className="text-lg leading-relaxed flex items-start">
                        <span className="text-[#9A283D] mr-3 mt-1 flex-shrink-0 font-bold text-lg min-w-[16px]">●</span>
                        <span className="flex-1 text-md">
                          {normalizeHindiText(line).replace(/\.\.\./g, "---").replace(/,/g, "]").replace(/:/g, "ः").replace(/[,:;.!?-]/g, match => replacements[match] || match)        // Replace colon with visarga
                    .replace(/ँ/g, "ं")          // Normalize chandrabindu if misencoded
                    .replace(/\u200D|\u200C/g, " ") // Remove zero-width joiners
                    .normalize("NFC")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedRashi.content?.en?.length > 0 && (
                  <ul className="space-y-2 mt-4">
                    {selectedRashi.content.en.map((line, idx) => (
                      <li key={idx} className="text-lg leading-relaxed font-eng flex items-start">
                        <span className="text-[#9A283D] mr-3 mt-1 flex-shrink-0 font-bold text-lg min-w-[16px]">●</span>
                        <span className="flex-1">
                          {normalizeEnglishText(line).replace(/\.\.\./g, "---").replace(/,/g, ",")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mx-auto text-center mt-6">
                <button
                  onClick={closeModal}
                  className="text-white text-md font-eng bg-[#9A283D] rounded-full px-6 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      
    </>
  );
}

export default Rashifal;
