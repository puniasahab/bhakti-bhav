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
const RASHI_LIST_API_URL = "https://api.bhaktibhav.app/api/v1/frontend-v4/all-rashis-v3";
const getRashifalDetailApiUrl = (rashiId) => `https://api.bhaktibhav.app/api/v1/frontend-v4/today-v3/${rashiId}`;
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

const splitRashiName = (item) => {
  if (item?.name && typeof item.name === "object") {
    return {
      hi: item.name.hi || "",
      en: item.name.en || "",
    };
  }

  const nameParts = String(item?.name2 || item?.name || "")
    .split(/\n|<br\s*\/?>/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    hi: nameParts[0] || "",
    en: nameParts[1] || "",
  };
};

const normalizeRashiItem = (item) => {
  const normalizedName = splitRashiName(item);
  const id = item?._id || item?.id;

  return {
    ...item,
    _id: id,
    id,
    key: item?.key || id,
    name: normalizedName,
    position: Number(item?.position) || 0,
  };
};

const getRashiList = (response) =>
  response?.status === "success" && Array.isArray(response.data)
    ? response.data
        .map(normalizeRashiItem)
        .filter((item) => item._id && item.key)
        .sort((a, b) => a.position - b.position)
    : [];

const getStringList = (value) => Array.isArray(value)
  ? value.filter((item) => typeof item === "string" && item.trim())
  : [];

const getRashifalDetailPayload = (data) => {
  if (Array.isArray(data)) return data[0] || {};
  if (Array.isArray(data?.data)) return data.data[0] || {};
  return data?.data || data || {};
};

const getRashifalContent = (data) => {
  const payload = getRashifalDetailPayload(data);
  const legacyHindiPoints = Array.isArray(payload?.points) ? payload.points : payload?.points?.hi;
  const hi = getStringList(payload?.points2?.[0]).length
    ? getStringList(payload.points2[0])
    : getStringList(legacyHindiPoints);
  const en = getStringList(payload?.points2?.[1]).length
    ? getStringList(payload.points2[1])
    : getStringList(payload?.points?.en);

  return {
    hi: hi.length ? hi : ["आज का राशिफ़ल उपलब्ध नहीं है।"],
    en: en.length ? en : ["Rashifal not available."],
  };
};

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
      fetch(RASHI_LIST_API_URL).then((res) => res.json())
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
        () => fetch(getRashifalDetailApiUrl(rashi._id)).then((res) => res.json())
      );
      console.log("API response:", data);

      setSelectedRashi({
        ...rashi,
        content: getRashifalContent(data),
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

  return (
    <>
      <SchemaMarkup schema={rashifalSchema} />
      <SEO title = "Daily Horoscope Hindi, Today Rashifal, Weekly & Monthly Rashifal | भक्ति भाव" description="Get today rashifal in Hindi, daily horoscope updates, and weekly & monthly zodiac predictions for all signs – Bhakti Bhav." canonical="https://bhaktibhav.app/rashifal" schema = {homeSchema}/>
      <Header showBrandBackHeader pageName={{ hi: "jkf'kQy", en: "Rashifal" }} />

      <PageTitleCard
        titleHi={"vkt dk jkf'kQy"}
        titleEn={"Aaj Ka Rashifal"}
        isHinglishLanguageSelected={language === "hinglish"}
        customEngFontSize={"14px"}
        customFontSize={"22px"}
      />

        <div className="container mx-auto max-w-md px-4 pb-28 pt-4 md:max-w-5xl">
          <ul className="grid grid-cols-3 gap-x-4 gap-y-6 text-center max-[374px]:gap-x-3 max-[374px]:gap-y-5 md:grid-cols-4 md:gap-5">
            {rashis.map((item) => (
              <li key={item._id}>
                <button
                  onClick={() => openModal(item)}
                  className="group flex min-h-[156px] w-full flex-col items-center justify-start overflow-hidden rounded-[18px] border border-[#EEDFBF] bg-[#FFFCF7] px-2.5 py-4 shadow-[0_5px_16px_rgba(154,40,61,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(154,40,61,0.12)] max-[374px]:min-h-[148px] max-[374px]:px-2 max-[374px]:py-3 md:min-h-[180px]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#F0DFC0] bg-[#FFF2D9] max-[374px]:h-14 max-[374px]:w-14 md:h-20 md:w-20">
                    <img
                      src={item.imageUrl || rashiImages[item.key] || "/img/default.png"}
                      crossOrigin="anonymous"
                      alt={item.name.en || item.name.hi || "Rashi"}
                      className="h-11 w-11 object-contain max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14"
                      style={{
                        filter: "brightness(0) saturate(100%) invert(20%) sepia(32%) saturate(1981%) hue-rotate(312deg) brightness(89%) contrast(89%)",
                      }}
                    />
                  </div>
                  <div className="mt-3 flex w-full flex-1 flex-col items-center">
                    <h2 className="font-devanagari text-[22px] font-bold leading-tight text-[#9A283D] max-[374px]:text-[20px] md:text-2xl">
                      {item.name.hi}
                    </h2>
                    <div className="my-2 flex w-full items-center justify-center gap-1.5 text-[#B99758]">
                      <span className="h-px w-8 bg-[#D8C293]" />
                      <span className="text-[11px] leading-none">✦</span>
                      <span className="h-px w-8 bg-[#D8C293]" />
                    </div>
                    <p className="font-eng text-[15px] font-semibold leading-tight text-[#9A283D] max-[374px]:text-sm md:text-base">
                      {item.name.en}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        {modalOpen && selectedRashi && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-0 py-0"
            onClick={closeModal}
          >
            <div
              className="relative max-h-[82vh] w-[78vw] min-w-[300px] max-w-[565px] overflow-y-auto rounded-[28px] bg-white px-6 py-7 shadow-[0_18px_45px_rgba(0,0,0,0.2)] max-[374px]:w-[86vw] max-[374px]:min-w-0 max-[374px]:px-5 max-[374px]:py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center flex flex-col items-center">
                <img
                  src={selectedRashi.imageUrl || selectedRashi.image}
                  crossOrigin="anonymous"
                  alt={selectedRashi.name?.en || selectedRashi.name?.hi || "Rashi"}
                  className="h-[74px] w-[74px] object-contain max-[374px]:h-16 max-[374px]:w-16"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(20%) sepia(32%) saturate(1981%) hue-rotate(312deg) brightness(89%) contrast(89%)",
                  }}
                />
                <h2 className="font-devanagari mt-3 text-[18px] font-bold leading-tight text-[#9A283D] max-[374px]:text-[22px]">
                  {selectedRashi.name?.hi}
                </h2>
                <div className="my-2.5 flex w-40 items-center justify-center gap-2 text-[#B99758]">
                  <span className="h-px flex-1 bg-[#D8C293]" />
                  <span className="text-sm leading-none">✦</span>
                  <span className="h-px flex-1 bg-[#D8C293]" />
                </div>
                <p className="font-eng text-[16px] font-semibold leading-tight text-[#9A283D] max-[374px]:text-xl">
                  {selectedRashi.name?.en}
                </p>
              </div>

              <div className="mt-6 text-start text-[#9A283D] max-[374px]:mt-5">
                {selectedRashi.content?.hi?.length > 0 && (
                  <ul className="space-y-3">
                    {selectedRashi.content.hi.map((line, idx) => (
                      <li key={idx} className="font-devanagari flex items-start text-[16px] leading-[1.22] max-[374px]:text-[17px]">
                        <span className="mr-4 mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9A283D]" />
                        <span className="flex-1">
                          {normalizeHindiText(line).replace(/\.\.\./g, "---").replace(/ँ/g, "ं").replace(/\u200D|\u200C/g, " ").normalize("NFC")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedRashi.content?.hi?.length > 0 && selectedRashi.content?.en?.length > 0 && (
                  <div className="my-5 flex w-full items-center justify-center gap-2 text-[#B99758]">
                    <span className="h-px w-24 bg-[#D8C293]" />
                    <span className="text-sm leading-none">✦</span>
                    <span className="h-px w-24 bg-[#D8C293]" />
                  </div>
                )}

                {selectedRashi.content?.en?.length > 0 && (
                  <ul className="space-y-3">
                    {selectedRashi.content.en.map((line, idx) => (
                      <li key={idx} className="font-eng flex items-start text-[15px] leading-[1.22] max-[374px]:text-[17px]">
                        <span className="mr-4 mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9A283D]" />
                        <span className="flex-1">
                          {normalizeEnglishText(line).replace(/\.\.\./g, "---").replace(/,/g, ",")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mx-auto mt-6 text-center max-[374px]:mt-5">
                <button
                  onClick={closeModal}
                  className="rounded-full bg-[#9A283D] px-9 py-3.5 font-eng text-lg font-semibold text-white shadow-[0_8px_16px_rgba(154,40,61,0.22)] max-[374px]:px-8 max-[374px]:py-3 max-[374px]:text-base"
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
