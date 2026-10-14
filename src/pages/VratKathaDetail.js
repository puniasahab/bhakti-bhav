import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Share2,
  Headphones,
  Pause,
  Clock,
  Music,
  Flame,
  Sparkles,
} from "lucide-react";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { vratKathaApis } from "../api";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";

// ── Inlined Localization & Formatting Helpers ──
const isDevanagari = (str) => {
  if (!str || typeof str !== "string") return false;
  return /[\u0900-\u097F]/.test(str);
};

const safeJsonParse = (val) => {
  if (!val) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const getLocalizedNames = (name, name2) => {
  let hindi = "";
  let english = "";

  const jsonName = safeJsonParse(name);
  const jsonName2 = safeJsonParse(name2);

  if (jsonName && typeof jsonName === "object" && (jsonName.hi || jsonName.en)) {
    hindi = jsonName.hi || "";
    english = jsonName.en || "";
  } else if (jsonName2 && typeof jsonName2 === "object" && (jsonName2.hi || jsonName2.en)) {
    hindi = jsonName2.hi || "";
    english = jsonName2.en || "";
  }

  const extractLines = (val) => {
    if (!val || typeof val !== "string") return [];
    return val
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const lines = [...extractLines(name2), ...extractLines(name)];

  for (const line of lines) {
    if (isDevanagari(line) && !hindi) {
      hindi = line;
    } else if (!isDevanagari(line) && !english) {
      english = line;
    }
  }

  if (!hindi && lines[0] && isDevanagari(lines[0])) hindi = lines[0];
  if (!english && lines[1] && !isDevanagari(lines[1])) english = lines[1];

  if (!hindi && typeof name === "string" && name && isDevanagari(name)) hindi = name.trim();
  if (!english && typeof name2 === "string" && name2 && !isDevanagari(name2)) english = name2.trim();

  if (!hindi && english) hindi = english;
  if (!english && hindi) english = hindi;
  if (!hindi && !english) {
    const raw = typeof name === "string" ? name : typeof name2 === "string" ? name2 : "";
    hindi = raw;
    english = raw;
  }

  return {
    hindi: hindi.trim(),
    english: english.trim(),
    primary: hindi.trim() || english.trim(),
    secondary: english.trim() || hindi.trim(),
  };
};

const formatTithiDateTime = (isoDateStr) => {
  if (!isoDateStr) return { date: "", time: "" };
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return { date: String(isoDateStr), time: "" };

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${formattedHours}:${minutes} ${ampm}`,
    };
  } catch (e) {
    return { date: String(isoDateStr), time: "" };
  }
};

const sanitizeHtml = (html) => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "");
};
// Ensure numbers inside text are rendered using English font (bypassing KrutiDev numeral mapping)
const renderWithEnglishNumbers = (text) => {
  if (!text) return null;
  const parts = String(text).split(/([0-9]+)/g);
  return parts.map((part, index) =>
    /^[0-9]+$/.test(part) ? (
      <span
        key={index}
        className="font-eng inline"
        style={{ fontFamily: "'PoppinsRegular', sans-serif" }}
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

const wrapNumbersInHtml = (html) => {
  if (!html) return "";
  return html.replace(/(<[^>]+>)|([0-9]+)/g, (match, tag, num) => {
    if (tag) return tag;
    if (num) {
      return `<span class="font-eng" style="font-family: 'PoppinsRegular', sans-serif;">${num}</span>`;
    }
    return match;
  });
};

// Helper: Pick first valid, non-empty content (handles [] and "" gracefully)
const getNonEmptyContent = (primary, fallback) => {
  const hasData = (val) => {
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) {
      return (
        val.length > 0 &&
        val.some((x) => (typeof x === "string" ? x.trim().length > 0 : Boolean(x)))
      );
    }
    if (typeof val === "string") return val.trim().length > 0;
    return Boolean(val);
  };

  if (hasData(primary)) return primary;
  if (hasData(fallback)) return fallback;
  return primary || fallback || null;
};

export default function VratKathaDetail() {
  const { id, date } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("katha"); // 'katha' | 'vidhi' | 'samagri' | 'muhurat'
  const [fontSizePx, setFontSizePx] = useState(16);

  const { language, fontSize, setFontSize } = useContext(LanguageContext);
  const { play, pause, isPlaying, currentTrack, trackMetadata, setTrackMetadata } = useAudio();

  const baseParams = useGA4BaseParams("Vrat Katha Detail Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const apiLang = language === "en" ? "en" : language === "hinglish" ? "hinglish" : "hi";
    vratKathaApis
      .fetchSingleVratKathaData("v3", id, apiLang, date)
      .then((resJson) => {
        if (resJson && resJson.status === "success" && resJson.data) {
          const raw = resJson.data;
          let parsedTime = raw.time;
          if (typeof raw.time === "string") {
            try {
              parsedTime = JSON.parse(raw.time);
            } catch (e) {
              parsedTime = null;
            }
          }

          setDetail({
            ...raw,
            time: parsedTime || raw.time,
          });
        } else {
          setDetail(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching single katha detail:", err);
        setDetail(null);
        setLoading(false);
      });
  }, [id, date, language]);

  // Audio Play / Pause handler
  const isThisAudioPlaying =
    Boolean(detail?.audioUrl) && currentTrack === detail.audioUrl && isPlaying;

  // Auto-sync image and metadata if this katha audio is already active/loaded in the player
  useEffect(() => {
    if (detail && currentTrack === detail.audioUrl && (!trackMetadata?.imageUrl || trackMetadata.imageUrl === "")) {
      const names = getLocalizedNames(detail.name, detail.name2);
      const trackTitle = `${names.hindi || names.english || "व्रत कथा"} कथा`;
      const trackEnglishTitle = names.english ? `${names.english} Katha` : "";
      const artwork = detail.imageUrl || detail.imagethumb || detail.image || "";

      if (artwork) {
        setTrackMetadata((prev) => ({
          ...prev,
          title: prev?.title || trackTitle,
          englishTitle: prev?.englishTitle || trackEnglishTitle,
          imageUrl: artwork,
          subtitle: prev?.subtitle || "Bhakti Bhav Vrat Katha",
          category: prev?.category || "व्रत कथा",
        }));
        localStorage.setItem("currentTrackImage", artwork);
      }
    }
  }, [detail, currentTrack, trackMetadata?.imageUrl, setTrackMetadata]);

  const handleAudioToggle = () => {
    if (!detail?.audioUrl) return;

    trackEvent(GA4Events.vrat_katha_hear_cta_clicked, {
      vratKathaId: detail._id,
      event_label: "vrat_katha_hear_btn_clicked",
    });

    if (isThisAudioPlaying) {
      pause();
    } else {
      const names = getLocalizedNames(detail.name, detail.name2);
      const trackTitle = `${names.hindi || names.english || "व्रत कथा"} कथा`;
      const trackEnglishTitle = names.english ? `${names.english} Katha` : "";
      const artwork = detail.imageUrl || detail.imagethumb || detail.image || "";

      localStorage.setItem("currentTrackName", trackTitle);
      localStorage.setItem("currentTrackEnglishName", trackEnglishTitle);
      localStorage.setItem("currentTrackImage", artwork);
      localStorage.setItem("currentTrackSubtitle", "Bhakti Bhav Vrat Katha");
      localStorage.setItem("currentTrackCategory", "व्रत कथा");

      play(detail.audioUrl, {
        title: trackTitle,
        englishTitle: trackEnglishTitle,
        imageUrl: artwork,
        subtitle: "Bhakti Bhav Vrat Katha",
        category: "व्रत कथा",
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!detail) return;
    trackEvent(GA4Events.vrat_katha_shared, {
      vratKathaId: detail._id,
      event_label: "vrat_katha_shared_button_clicked",
    });

    const names = getLocalizedNames(detail.name, detail.name2);
    const title = names.hindi || names.english || "व्रत कथा";
    const shareUrl = window.location.href;
    const shareMessage = `🙏 ${title} - भक्ति भाव व्रत कथा 🙏\n\n📖 संपूर्ण कथा, पूजा विधि व मुहूर्त यहाँ पढ़ें:\n${shareUrl}\n\n📱 डाउनलोड करें भक्ति भाव ऐप:\nhttps://bhakti-bhav-referral.onelink.me/VOv8\n\n🙏 हर हर महादेव 🙏`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `🙏 ${title} - व्रत कथा | भक्ति भाव`,
          text: shareMessage,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard?.writeText?.(shareUrl);
          alert("लिंक कॉपी हो गया है!");
        }
      }
    } else {
      navigator.clipboard?.writeText?.(shareUrl);
      alert("लिंक कॉपी हो गया है!");
    }
  };

  if (loading) {
    return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl text-[#851C2C] font-semibold mb-4">❌ कोई कथा नहीं मिली!</p>
        <button
          onClick={() => navigate("/vrat-katha")}
          className="bg-[#851C2C] text-white px-6 py-2 rounded-full font-medium"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  const names = getLocalizedNames(detail.name, detail.name2);
  const hindiTitle = names.hindi || names.primary;
  const englishTitle = names.english || names.secondary;

  // Format Tithi dates
  const startTime = detail.time?.start ? formatTithiDateTime(detail.time.start) : null;
  const endTime = detail.time?.end ? formatTithiDateTime(detail.time.end) : null;
  const hasTithiInfo = Boolean(startTime?.date || endTime?.date);

  // Content for tabs

  // Katha HTML
  const rawKathaHtml =
    getNonEmptyContent(
      language === "en" ? detail.pujaMahatva2 : detail.pujaMahatva,
      language === "en" ? detail.pujaMahatva : detail.pujaMahatva2
    ) || "";
  const sanitizedKatha = sanitizeHtml(rawKathaHtml);

  // Puja Vidhi text
  const rawVidhi = getNonEmptyContent(
    language === "en" ? detail.pujaVidhi2 : detail.pujaVidhi,
    language === "en" ? detail.pujaVidhi : detail.pujaVidhi2
  );
  const vidhiContent =
    typeof rawVidhi === "string"
      ? rawVidhi
      : Array.isArray(rawVidhi)
        ? rawVidhi.join("\n")
        : "";

  // Puja Samagri parsing
  const rawSamagri = getNonEmptyContent(
    language === "en" ? detail.pujaSamagri2 : detail.pujaSamagri,
    language === "en" ? detail.pujaSamagri : detail.pujaSamagri2
  );

  const parseSamagri = (raw) => {
    if (!raw) return [];
    let target = raw;
    if (typeof target === "string" && target.trim().startsWith("[") && target.trim().endsWith("]")) {
      try {
        const parsed = JSON.parse(target);
        if (Array.isArray(parsed)) target = parsed;
      } catch (e) { }
    }

    let items = [];
    if (Array.isArray(target)) {
      items = target.flatMap((entry) => {
        if (typeof entry === "string") {
          return entry.split(/,|\n|;/);
        }
        return [entry];
      });
    } else if (typeof target === "string") {
      items = target.split(/,|\n|;/);
    }

    return items
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length > 0 && s !== "•" && s !== "-");
  };

  const samagriList = parseSamagri(rawSamagri);

  // Puja Muhurat
  const rawMuhurat = getNonEmptyContent(
    language === "en" ? detail.pujaMuharat2 : detail.pujaMuharat,
    language === "en" ? detail.pujaMuharat : detail.pujaMuharat2
  );
  const muhuratContent =
    typeof rawMuhurat === "string"
      ? rawMuhurat
      : Array.isArray(rawMuhurat)
        ? rawMuhurat.join("\n")
        : "";


  return (
    <>
      <SEO
        title={`${hindiTitle || englishTitle} - व्रत कथा, पूजा विधि व मुहूर्त | भक्ति भाव`}
        description={`पढ़ें ${hindiTitle || englishTitle} व्रत कथा, पूजा विधि, सामग्री और शुभ मुहूर्त हिंदी में।`}
        canonical={`https://bhaktibhav.app/vrat-katha/${id}`}
      />

      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col text-gray-800">
        {/* ── Top Header Toolbar matching Reference Screenshot ── */}
        <header className="sticky top-0 z-40 w-full bg-[#F5BF46] shadow-sm px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/vrat-katha");
                }
              }}
              className="p-1 text-[#851C2C] hover:opacity-80 transition active:scale-95"
              aria-label="Go Back"
            >
              <ChevronLeft size={28} strokeWidth={2.8} />
            </button>
            <span className="text-[#851C2C] font-bold text-lg md:text-xl font-hindi">
              व्रत कथा
            </span>
          </div>

          {/* Font Size Controls [A] and [A+] with incremental capacity up to 26px */}
          <div className="flex items-center gap-2 font-eng">
            <button
              type="button"
              onClick={() => setFontSizePx(16)}
              style={{ fontFamily: "'PoppinsRegular', -apple-system, sans-serif" }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border border-[#851C2C] text-sm font-semibold transition font-eng active:scale-95 ${
                fontSizePx === 16
                  ? "bg-[#851C2C]/15 font-bold"
                  : "bg-transparent hover:bg-[#851C2C]/10"
              } text-[#851C2C]`}
              title="Normal Font Size (16px)"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSizePx((prev) => Math.min(26, prev + 2))}
              style={{ fontFamily: "'PoppinsRegular', -apple-system, sans-serif" }}
              className={`px-2.5 h-8 flex items-center justify-center rounded-lg border border-[#851C2C] text-sm font-semibold transition font-eng active:scale-95 ${
                fontSizePx > 16
                  ? "bg-[#851C2C]/15 font-bold"
                  : "bg-transparent hover:bg-[#851C2C]/10"
              } text-[#851C2C]`}
              title={`Increase Font Size (Current: ${fontSizePx}px, Max: 26px)`}
            >
              A+
            </button>
          </div>
        </header>

        {/* ── Main Content Area ── */}
        <main className="w-full max-w-lg md:max-w-xl mx-auto px-3.5 sm:px-4 pt-2 pb-12 text-gray-800">
          {/* ── Double-Bordered Rounded Title Box matching Screenshots ── */}
          <div className="flex justify-center mb-2">
            <div className="relative inline-block px-6 py-2 bg-white/95 rounded-2xl border-2 border-[#D96B27] shadow-[0_4px_12px_rgba(217,107,39,0.12)]">
              <div className="absolute inset-[2.5px] rounded-[13px] border border-[#D96B27]/40 pointer-events-none"></div>
              <div className="relative z-10 text-center">
                <h1 className="text-xl md:text-2xl font-bold text-[#851C2C] font-hindi leading-snug">
                  {hindiTitle}
                </h1>
                {englishTitle && englishTitle !== hindiTitle && (
                  <p className="text-sm md:text-base font-semibold text-[#851C2C] font-eng mt-0.5 leading-snug">
                    {englishTitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Centered Deity / Hero Image matching Reference Screenshot ── */}
          {(detail.imageUrl || detail.imagethumb) && (
            <div className="flex justify-center my-3">
              <img
                src={detail.imageUrl || detail.imagethumb}
                alt={hindiTitle}
                className="w-auto h-48 sm:h-56 md:h-64 max-w-[260px] sm:max-w-[300px] object-contain vrat-katha-hero-img"
              />
            </div>
          )}

          {/* ── Date & Tithi Card (Two columns with calendar icons) ── */}
          {hasTithiInfo && (
            <div className="my-2.5 bg-white rounded-2xl p-2.5 sm:p-4 shadow-sm border border-gray-100 w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                {/* Tithi Start */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 pr-1.5 sm:pr-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#FDEAEB] flex items-center justify-center text-[#851C2C]">
                    <Calendar size={18} className="sm:w-5 sm:h-5" strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                      तिथि प्रारंभ:
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-gray-900 font-eng truncate">
                      {startTime?.date || "—"}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-gray-500 font-eng truncate">
                      {startTime?.time || "—"}
                    </span>
                  </div>
                </div>

                {/* Tithi End */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 pl-2 sm:pl-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#FDEAEB] flex items-center justify-center text-[#851C2C]">
                    <Calendar size={18} className="sm:w-5 sm:h-5" strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                      तिथि समाप्त:
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-gray-900 font-eng truncate">
                      {endTime?.date || "—"}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-gray-500 font-eng truncate">
                      {endTime?.time || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Action Bar: Share & Listen Buttons ── */}
          <div className="flex items-center justify-center gap-3 my-3">
            {/* Share Button (Solid Maroon Pill) */}
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-[#851C2C] hover:bg-[#6E1624] text-white py-2.5 px-4 rounded-full shadow-[0_4px_12px_rgba(133,28,44,0.3)] transition font-semibold text-sm sm:text-base font-eng active:scale-95"
            >
              <Share2 size={18} strokeWidth={2.4} />
              <span>Share</span>
            </button>

            {/* Listen Button (Light Cream/Peach Pill) */}
            <button
              type="button"
              onClick={handleAudioToggle}
              disabled={!detail.audioUrl}
              className={`flex-1 max-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border transition font-semibold text-sm sm:text-base font-eng active:scale-95 ${
                !detail.audioUrl
                  ? "bg-[#FFF5ED]/50 border-gray-200 text-gray-400 cursor-not-allowed"
                  : isThisAudioPlaying
                  ? "bg-[#FDECE2] border-[#851C2C] text-[#851C2C] shadow-inner"
                  : "bg-[#FFF5ED] hover:bg-[#FDECE2] border-[#F3D7C5] text-[#851C2C] shadow-sm"
              }`}
            >
              {isThisAudioPlaying ? (
                <>
                  <Pause size={18} strokeWidth={2.4} />
                  <span>Pause &gt;</span>
                </>
              ) : (
                <>
                  <Headphones size={18} strokeWidth={2.4} />
                  <span>Listen &gt;</span>
                </>
              )}
            </button>
          </div>

          {/* ── 4 Interactive Tabs ── */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 my-3 overflow-x-auto pb-1 no-scrollbar w-full max-w-full">
            {[
              { id: "katha", label: "कथा" },
              { id: "vidhi", label: "पूजा विधि" },
              { id: "samagri", label: "पूजा सामग्री" },
              { id: "muhurat", label: "पूजा मुहूर्त" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 text-center py-2 px-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "bg-[#851C2C] text-white shadow-[0_4px_12px_rgba(133,28,44,0.25)]"
                      : "bg-[#FFF8F5] text-[#851C2C] border border-[#E8BCC2] hover:bg-[#FDECE2]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F2E5DC] p-3.5 sm:p-5 mb-4 w-full max-w-full overflow-hidden break-words">
            {/* TAB 1: KATHA */}
            {activeTab === "katha" && (
              <div>
                {/* Card Header Badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#FDECE2] flex items-center justify-center p-1.5 shadow-sm">
                    <img
                      src="/img/kumbh-kalash_509984 1.png"
                      alt="कथा"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <Sparkles size={18} className="text-[#851C2C] hidden" />
                  </div>
                  <h2 className="text-[#851C2C] font-bold text-base sm:text-lg font-hindi">
                    कथा
                  </h2>
                </div>

                {/* Katha Rich Text Body */}
                {sanitizedKatha ? (
                  <div
                    style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}
                    className="font-devanagari text-gray-800 leading-normal [&>p]:mb-2.5 [&_*]:!text-[inherit]"
                    dangerouslySetInnerHTML={{ __html: wrapNumbersInHtml(sanitizedKatha) }}
                  />
                ) : (
                  <p className="text-gray-500 font-devanagari text-center py-4">
                    कथा का विवरण उपलब्ध नहीं है।
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: PUJA VIDHI */}
            {activeTab === "vidhi" && (
              <div>
                {/* Card Header Badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#FDECE2] flex items-center justify-center p-1.5 shadow-sm">
                    <img
                      src="/img/deep.png"
                      alt="पूजा विधि"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <Flame size={18} className="text-[#851C2C] hidden" />
                  </div>
                  <h2 className="text-[#851C2C] font-bold text-base sm:text-lg font-hindi">
                    पूजा विधि
                  </h2>
                </div>

                {/* Vidhi content */}
                {vidhiContent ? (
                  <div
                    style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}
                    className="font-devanagari text-gray-800 leading-relaxed whitespace-pre-line"
                  >
                    {renderWithEnglishNumbers(vidhiContent)}
                  </div>
                ) : (
                  <p className="text-gray-500 font-devanagari text-center py-4">
                    पूजा विधि का विवरण उपलब्ध नहीं है।
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: PUJA SAMAGRI */}
            {activeTab === "samagri" && (
              <div>
                {/* Card Header Badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#FDECE2] flex items-center justify-center p-1.5 shadow-sm">
                    <img
                      src="/img/card_bg_icon.png"
                      alt="पूजा सामग्री"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <Sparkles size={18} className="text-[#851C2C] hidden" />
                  </div>
                  <h2 className="text-[#851C2C] font-bold text-base sm:text-lg font-hindi">
                    पूजा सामग्री
                  </h2>
                </div>

                {/* Samagri bullet list */}
                {samagriList.length > 0 ? (
                  <ul className="space-y-1.5 pt-0.5">
                    {samagriList.map((item, idx) => (
                      <li
                        key={idx}
                        style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}
                        className="flex items-start font-devanagari text-gray-800"
                      >
                        <span className="text-[#851C2C] text-lg leading-none mr-2 mt-0.5 select-none">
                          •
                        </span>
                        <span className="leading-relaxed">{renderWithEnglishNumbers(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 font-devanagari text-center py-4">
                    पूजा सामग्री का विवरण उपलब्ध नहीं है।
                  </p>
                )}
              </div>
            )}

            {/* TAB 4: PUJA MUHURAT */}
            {activeTab === "muhurat" && (
              <div>
                {/* Card Header Badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#FDECE2] flex items-center justify-center p-1.5 shadow-sm text-[#851C2C]">
                    <Clock size={20} strokeWidth={2.3} />
                  </div>
                  <h2 className="text-[#851C2C] font-bold text-base sm:text-lg font-hindi">
                    पूजा मुहूर्त
                  </h2>
                </div>

                {/* Muhurat content */}
                {muhuratContent ? (
                  <div
                    style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}
                    className="font-devanagari text-gray-800 leading-relaxed whitespace-pre-line"
                  >
                    {renderWithEnglishNumbers(muhuratContent)}
                  </div>
                ) : (
                  <p className="text-gray-500 font-devanagari text-center py-4">
                    पूजा मुहूर्त का विवरण उपलब्ध नहीं है।
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Aarti Button (Conditional on artiId) matching Screenshot 5 ── */}
          {detail.artiId && (
            <div className="flex justify-center my-4">
              <Link
                to={`/aarti/${detail.artiId}`}
                onClick={() => {
                  trackEvent(GA4Events.aarti_cta_tapped_on_vrat_katha, {
                    event_label: "aarti_cta_tapped_on_vrat_katha",
                    aartiId: detail.artiId,
                  });
                }}
                className="flex items-center justify-center gap-2 bg-[#851C2C] hover:bg-[#6E1624] text-white px-7 py-2.5 rounded-full shadow-[0_4px_14px_rgba(133,28,44,0.35)] transition font-semibold text-base font-hindi active:scale-95"
              >
                <Music size={19} strokeWidth={2.4} />
                <span>आरती</span>
              </Link>
            </div>
          )}

          {/* ── Footer Decoration Divider matching Screenshot 5 ── */}
          <div className="flex items-center justify-center my-5 text-gray-400 gap-2 select-none">
            <div className="h-[1px] w-16 sm:w-24 bg-gray-300"></div>
            <span className="text-gray-500 text-sm tracking-widest font-serif">❖ ❖</span>
            <div className="h-[1px] w-16 sm:w-24 bg-gray-300"></div>
          </div>
        </main>
      </div>
    </>
  );
}
