import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Headphones, Pause, Calendar, Clock, Sparkles } from "lucide-react";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { teachingApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import { homeSchema } from "../seo/schemas";
import { getTitleParts, getImageUrl, DEVANAGARI_FONT, ENGLISH_FONT } from "./GuruJi";

export const parseContentBlocks = (rawText) => {
  if (!rawText) return { hindi: [], english: [] };

  const lines = String(rawText)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const hi = [];
  const en = [];
  let switchedToEn = false;

  for (const line of lines) {
    const hasDev = /[\u0900-\u097F]/.test(line);
    const hasLat = /[a-zA-Z]/.test(line);

    // Switch to English/Hinglish section when line starts with ### or has Latin without Devanagari
    if (!switchedToEn && (line.startsWith("###") || (!hasDev && hasLat))) {
      switchedToEn = true;
    }

    if (switchedToEn) {
      en.push(line);
    } else {
      hi.push(line);
    }
  }

  return {
    hindi: hi,
    english: en,
  };
};

export default function GuruJiDetail() {
  const { categoryId, contentId, section: routeSection } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [searchParams] = useSearchParams();
  const queryLang = searchParams.get("lang");
  const effectiveLang = (queryLang || language || "").toLowerCase();
  const isEnglish = effectiveLang === "english" || effectiveLang === "en";

  // Audio Context integration
  const audioContext = useAudio();
  const currentTrack = audioContext?.currentTrack;
  const isPlaying = audioContext?.isPlaying;
  const play = audioContext?.play;
  const pause = audioContext?.pause;

  // Selected section: 'aboutUs' | 'teaching' | 'events'
  const activeSection = routeSection || location.state?.section || "aboutUs";

  const [content, setContent] = useState(location.state?.content || null);
  const [category, setCategory] = useState(location.state?.category || null);
  const [loading, setLoading] = useState(!location.state?.content);
  const [fontSize, setFontSize] = useState(16); // px

  // Fetch content if not provided in location.state
  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      if (content) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const targetId = contentId || categoryId;
        let fetchedData = null;

        // 1. Try fetching via category items
        try {
          const catRes = await teachingApis.getTeachingCategoryItems(targetId);
          if (catRes?.category) setCategory(catRes.category);
          const items = Array.isArray(catRes?.items) ? catRes.items : [];
          if (items.length > 0 && items[0]?._id) {
            const contentRes = await teachingApis.getTeachingContentV3(items[0]._id);
            if (contentRes?.data) fetchedData = contentRes.data;
          }
        } catch (_) { }

        // 2. Fallback: try fetching as contentId directly
        if (!fetchedData) {
          try {
            const contentRes = await teachingApis.getTeachingContentV3(targetId);
            if (contentRes?.data) fetchedData = contentRes.data;
          } catch (_) { }
        }

        if (isMounted && fetchedData) {
          setContent(fetchedData);
        }
      } catch (err) {
        console.error("Error loading Guru Ji details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [categoryId, contentId, content]);


  // Derived titles
  const guruNames = useMemo(() => {
    const raw = content?.name2 || content?.name || category?.name2 || category?.name || "";
    return getTitleParts(raw);
  }, [content, category]);

  const guruHindi = guruNames.hindi || "गुरु जी";
  const guruEnglish = guruNames.english || "Guru Ji";
  const guruDisplayName = isEnglish ? (guruEnglish || guruHindi) : (guruHindi || guruEnglish);

  // Section title mapping
  const sectionTitle = useMemo(() => {
    if (activeSection === "aboutUs") {
      return isEnglish
        ? (content?.sectionTitles?.aboutUs?.en || "About Us")
        : (content?.sectionTitles?.aboutUs?.hi || "हमारे बारे में");
    }
    if (activeSection === "teaching") {
      return isEnglish
        ? (content?.sectionTitles?.teaching?.en || "Teaching")
        : (content?.sectionTitles?.teaching?.hi || "उपदेश");
    }
    if (activeSection === "events") {
      return isEnglish
        ? (content?.sectionTitles?.events?.en || "Events")
        : (content?.sectionTitles?.events?.hi || "कार्यक्रम");
    }
    return isEnglish ? "About Us" : "हमारे बारे में";
  }, [activeSection, content, isEnglish]);

  // Current section data
  const currentSectionData = useMemo(() => {
    if (activeSection === "aboutUs") return content?.aboutUs || {};
    if (activeSection === "teaching") return content?.teaching || {};
    return {};
  }, [activeSection, content]);

  const audioUrl = currentSectionData?.audioUrl || "";
  const isPlayingThisAudio = Boolean(audioUrl && currentTrack === audioUrl && isPlaying);

  // Use current section's image1url with fallback to section imageUrl, then global fallbacks
  const guruImgUrl = useMemo(() => {
    // 1. Current section's image1url (e.g. teaching.image1url when in teaching, aboutUs.image1url when in aboutUs)
    const sectionImg1 =
      currentSectionData?.image1url ||
      currentSectionData?.image1Url;

    if (sectionImg1 && typeof sectionImg1 === "string" && sectionImg1.trim() !== "") {
      return getImageUrl(sectionImg1);
    }

    // 2. Current section's imageUrl (e.g. teaching.imageUrl when in teaching, aboutUs.imageUrl when in aboutUs)
    const sectionImg = currentSectionData?.imageUrl;
    if (sectionImg && typeof sectionImg === "string" && sectionImg.trim() !== "") {
      return getImageUrl(sectionImg);
    }

    // 3. Fallback: global content image1url or category image1url
    const globalImg1 =
      content?.image1url ||
      content?.image1Url ||
      category?.image1url ||
      category?.image1Url;

    if (globalImg1 && typeof globalImg1 === "string" && globalImg1.trim() !== "") {
      return getImageUrl(globalImg1);
    }

    // 4. Fallback: global content imageUrl or category imagethumb
    const globalFallback =
      content?.imageUrl ||
      content?.imagethumb ||
      category?.imageUrl ||
      category?.imagethumb;

    return globalFallback ? getImageUrl(globalFallback) : null;
  }, [content, currentSectionData, category]);

  const handleAudioToggle = () => {
    if (!audioUrl || !play) return;

    if (isPlayingThisAudio) {
      if (pause) pause();
    } else {
      play(audioUrl, {
        title: guruDisplayName,
        englishTitle: guruEnglish,
        subtitle: sectionTitle,
        imageUrl: guruImgUrl,
        category: "Guru Ji",
      });
    }
  };

  // Parse description text into Hindi and English/Hinglish blocks
  const { hindiBlocks, englishBlocks } = useMemo(() => {
    const rawText = currentSectionData?.audioDescription2 || currentSectionData?.audioDescription || "";
    const { hindi, english } = parseContentBlocks(rawText);
    return {
      hindiBlocks: hindi,
      englishBlocks: english,
    };
  }, [currentSectionData]);

  const activeBlocks = useMemo(() => {
    if (isEnglish) {
      return englishBlocks.length > 0 ? englishBlocks : hindiBlocks;
    }
    return hindiBlocks.length > 0 ? hindiBlocks : englishBlocks;
  }, [isEnglish, hindiBlocks, englishBlocks]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  const handleBack = () => {
    const targetCategoryId = categoryId || content?.kathaCategoryId || category?._id;
    if (targetCategoryId) {
      navigate(`/guru-ji/${targetCategoryId}`);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/guru-ji");
    }
  };

  return (
    <>
      <SEO
        title={`${sectionTitle} - ${guruDisplayName} | भक्ति भाव`}
        description={`Read ${sectionTitle} of ${guruDisplayName} on Bhakti Bhav.`}
        canonical={`https://bhaktibhav.app/guru-ji/${categoryId || contentId}/${activeSection}`}
        schema={homeSchema}
      />

      <div
        className="min-h-screen w-full flex flex-col text-[#9A283D]"
        style={{
          backgroundImage: "url('/img/repeat_bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
          backgroundColor: "#FAF9F5",
          fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
        }}
      >
        <div className="container mx-auto max-w-md flex-1 flex flex-col px-4 pb-16 pt-3 sm:max-w-xl">
          {/* ═════════ 1. GOLDEN APP BAR (Screenshot 3) ═════════ */}
          <header
            className="sticky top-0 z-40 flex items-center justify-between rounded-[22px] px-4 py-3 shadow-[0_8px_20px_rgba(154,40,61,0.08)] mb-4"
            style={{
              background: "linear-gradient(to right, #F2A13A, #FFF56A)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE8B5]/95 text-[#9A283D] active:scale-95 transition-transform"
                aria-label="Back"
              >
                <ChevronLeft size={26} strokeWidth={2.8} />
              </button>
              <h1
                style={{ fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT }}
                className="truncate text-[20px] font-bold leading-tight text-[#9A283D]"
              >
                {sectionTitle}
              </h1>
            </div>

            {/* Font size toggles: [A] and [A+] */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFontSize(16)}
                style={{ fontFamily: ENGLISH_FONT, color: "#800000" }}
                className="w-9 h-9 rounded-xl bg-white/95 border border-[#D4A020] text-sm font-bold flex items-center justify-center shadow-sm hover:bg-white active:scale-95 transition-all"
                title="Reset Font"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(24, s + 2))}
                style={{ fontFamily: ENGLISH_FONT, color: "#800000" }}
                className="w-9 h-9 rounded-xl bg-white/95 border border-[#D4A020] text-sm font-bold flex items-center justify-center shadow-sm hover:bg-white active:scale-95 transition-all"
                title="Increase Font"
              >
                A+
              </button>
            </div>
          </header>

          {/* ═════════ 2. CENTERED GURU SUB-BADGE (Screenshot 3) ═════════ */}
          <div className="flex justify-center mb-4">
            <div
              style={{
                border: "2px solid #E65C21",
                borderRadius: 18,
                background: "rgba(255,255,255,0.95)",
                padding: "7px 30px",
                boxShadow: "0 3px 12px rgba(154,40,61,0.06)",
                fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                fontSize: 18,
                fontWeight: 600,
                color: "#9A283D",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              {guruDisplayName}
            </div>
          </div>

          {/* ═════════ 3. GURU IMAGE (Screenshot 3 - shown for aboutUs and teaching) ═════════ */}
          {activeSection !== "events" && guruImgUrl && (
            <div className="flex justify-center my-3" style={{ height: 230 }}>
              <img
                crossOrigin="anonymous"
                src={guruImgUrl}
                alt={guruHindi}
                className="h-full w-auto object-contain filter drop-shadow-md"
                loading="lazy"
              />
            </div>
          )}

          {/* ═════════ 4. CONTENT BODY ═════════ */}
          {activeSection === "events" ? (
            /* Events List View */
            <div className="flex flex-col gap-5 mt-2">
              {Array.isArray(content?.events) && content.events.length > 0 ? (
                content.events.map((evt, idx) => {
                  const rawEvtImg = evt.image1url || evt.image1Url || evt.imageUrl;
                  const evtImg = rawEvtImg && typeof rawEvtImg === "string" && rawEvtImg.trim() !== "" ? getImageUrl(rawEvtImg) : null;
                  const { hindi: evtHi, english: evtEn } = parseContentBlocks(evt.description2 || evt.description || "");
                  const descLines = isEnglish
                    ? (evtEn.length > 0 ? evtEn : evtHi)
                    : (evtHi.length > 0 ? evtHi : evtEn);

                  return (
                    <div
                      key={evt._id || idx}
                      className="rounded-[22px] border border-[#E9DED8] bg-white p-5 shadow-[0_6px_18px_rgba(154,40,61,0.08)]"
                    >
                      {evtImg && evtImg !== "/img/default.png" && (
                        <div className="mb-4 h-40 overflow-hidden rounded-xl">
                          <img
                            src={evtImg}
                            alt="Event Banner"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      {(evt.eventDate || evt.eventTime) && (
                        <div
                          style={{ fontFamily: ENGLISH_FONT }}
                          className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#800000]"
                        >
                          {evt.eventDate && (
                            <span
                              style={{ fontFamily: ENGLISH_FONT }}
                              className="flex items-center gap-1.5 rounded-full bg-[#FFF0D4] px-3 py-1 font-sans"
                            >
                              <Calendar size={14} />
                              <span style={{ fontFamily: ENGLISH_FONT }}>{evt.eventDate}</span>
                            </span>
                          )}
                          {evt.eventTime && (
                            <span
                              style={{ fontFamily: ENGLISH_FONT }}
                              className="flex items-center gap-1.5 rounded-full bg-[#FFF0D4] px-3 py-1 font-sans"
                            >
                              <Clock size={14} />
                              <span style={{ fontFamily: ENGLISH_FONT }}>{evt.eventTime}</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        {descLines.map((line, lIdx) => {
                          const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
                          const cleanText = line.replace(/^[•\-*]\s*/, "").replace(/^###\s*/, "").replace(/\*\*/g, "");

                          if (lIdx === 0 && !isBullet) {
                            return (
                              <h3
                                key={lIdx}
                                style={{
                                  fontSize: fontSize + 2,
                                  fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                                }}
                                className="font-bold text-[#800000] leading-snug"
                              >
                                {cleanText}
                              </h3>
                            );
                          }

                          if (isBullet) {
                            return (
                              <div
                                key={lIdx}
                                className="flex items-start gap-2.5 my-1"
                                style={{
                                  fontSize,
                                  fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                                  lineHeight: 1.7,
                                }}
                              >
                                <span className="text-[#800000] font-bold shrink-0 mt-0.5">•</span>
                                <span className="text-[#333333]">{cleanText}</span>
                              </div>
                            );
                          }

                          return (
                            <p
                              key={lIdx}
                              style={{
                                fontSize,
                                fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                                lineHeight: 1.75,
                              }}
                              className="text-[#333333]"
                            >
                              {cleanText}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p
                  style={{ fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT }}
                  className="py-10 text-center text-gray-500"
                >
                  {isEnglish ? "Currently no events available" : "वर्तमान में कोई कार्यक्रम उपलब्ध नहीं है"}
                </p>
              )}
            </div>
          ) : (
            /* About Us / Teachings Text Flow (Screenshot 3 & 4) */
            <div
              className="mt-2 space-y-3 px-1 text-[#333333]"
              style={{
                lineHeight: 1.85,
                wordBreak: "break-word",
              }}
            >
              {activeBlocks.map((line, idx) => {
                const isBullet =
                  line.startsWith("•") ||
                  line.startsWith("-") ||
                  line.startsWith("*") ||
                  line.startsWith("•\t");
                const cleanText = line
                  .replace(/^[•\-*]\t?/, "")
                  .replace(/^###\s*/, "")
                  .replace(/\*\*/g, "")
                  .trim();

                // Section header detection (e.g. "प्रारंभिक जीवन और नामकरण", "मुख्य आश्रम (कैंची धाम)", "प्रसिद्ध चमत्कार")
                const isHeader =
                  !isBullet &&
                  (line.startsWith("###") ||
                    line.startsWith("**") ||
                    (line.length < 50 && !line.includes("।") && !line.includes(".")) ||
                    line.includes("प्रारंभिक जीवन") ||
                    line.includes("मुख्य आश्रम") ||
                    line.includes("प्रसिद्ध चमत्कार") ||
                    line.includes("मुख्य अभ्यास") ||
                    line.includes("सिखाने का"));

                if (isHeader) {
                  return (
                    <h3
                      key={idx}
                      style={{
                        fontSize: fontSize + 2,
                        fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                      }}
                      className="font-bold text-[#800000] pt-3 pb-1"
                    >
                      {cleanText}
                    </h3>
                  );
                }

                if (isBullet) {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 my-1.5 pl-1"
                      style={{
                        fontSize,
                        fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                        lineHeight: 1.75,
                      }}
                    >
                      <span className="text-[#800000] font-bold text-base shrink-0 mt-0.5">•</span>
                      <span className="text-[#333333]">{cleanText}</span>
                    </div>
                  );
                }

                return (
                  <p
                    key={idx}
                    style={{
                      fontSize,
                      fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
                      lineHeight: 1.8,
                    }}
                    className="text-[#333333] my-2"
                  >
                    {cleanText}
                  </p>
                );
              })}
            </div>
          )}

          {/* ═════════ 5. LISTEN BUTTON (Screenshot 4) ═════════ */}
          {audioUrl && (
            <div className="flex justify-center mt-8 mb-4">
              <button
                type="button"
                onClick={handleAudioToggle}
                className="flex items-center gap-3 rounded-full px-8 py-3.5 text-white shadow-[0_8px_20px_rgba(128,0,32,0.3)] active:scale-95 transition-all"
                style={{
                  background: isPlayingThisAudio ? "#660018" : "#800020",
                  fontFamily: ENGLISH_FONT,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {isPlayingThisAudio ? (
                  <>
                    <Pause size={20} className="fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Headphones size={20} />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ═════════ 6. DECORATIVE DIVIDER (Screenshot 4) ═════════ */}
          <div className="flex items-center justify-center gap-3 my-6 opacity-60">
            <span className="h-[1px] w-16 bg-[#C08040]" />
            <span className="text-xs text-[#C08040] flex items-center gap-1.5">
              <span>◆</span>
              <span>◆</span>
              <span>◆</span>
            </span>
            <span className="h-[1px] w-16 bg-[#C08040]" />
          </div>
        </div>
      </div>
    </>
  );
}
