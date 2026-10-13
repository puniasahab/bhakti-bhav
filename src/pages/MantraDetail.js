import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Pause, Play, Repeat } from "lucide-react";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { mantraApis } from "../api";

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const parseMantraTitle = (detail, language) => {
  if (!detail) return "";
  let hi = "";
  let en = "";

  if (typeof detail.name === "string" && detail.name.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(detail.name);
      hi = parsed.hi || "";
      en = parsed.en || "";
    } catch (e) {
      hi = detail.name.trim();
    }
  } else if (typeof detail.name === "string") {
    hi = detail.name.trim();
  } else if (detail.name && typeof detail.name === "object") {
    hi = detail.name.hi || "";
    en = detail.name.en || "";
  }

  if (detail.name2 && typeof detail.name2 === "string") {
    const lines = detail.name2.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      if (!hi) hi = lines[0];
      if (!en) en = lines[1];
    } else if (lines.length === 1 && !en) {
      en = lines[0];
    }
  }

  // In english, display the english title; in hindi and hinglish, display the hindi title
  if (language === "en") {
    return en || hi || "Mantra";
  }
  return hi || en || "मंत्र";
};

export default function MantraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, isPlaying, currentTrack, audioRef } = useAudio();
  const [currentLoopMantra, setCurrentLoopMantra] = useState(null);

  const baseParams = useGA4BaseParams("Mantra Detail Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    async function fetchMantras() {
      try {
        setLoading(true);
        const json = await mantraApis.getMantraById("v3", id, language);
        setDetail(json.data || null);
      } catch (error) {
        console.error("API Error fetching mantra:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchMantras();
    }
  }, [id, language]);

  // Clear loop when audio stops
  useEffect(() => {
    if (!isPlaying && currentLoopMantra) {
      setCurrentLoopMantra(null);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
    }
  }, [isPlaying, currentLoopMantra, audioRef]);

  // Clear loop when track changes
  useEffect(() => {
    if (currentTrack && currentLoopMantra) {
      const currentLoopUrl = detail?.mantras?.find(
        (m, idx) => (m._id || idx) === currentLoopMantra
      )?.audioUrl;
      if (currentTrack !== currentLoopUrl) {
        setCurrentLoopMantra(null);
        if (audioRef.current) {
          audioRef.current.loop = false;
        }
      }
    }
  }, [currentTrack, currentLoopMantra, detail?.mantras, audioRef]);

  const handlePlay = (url, mantraId, verseTitle) => {
    if (!url) return;

    if (currentTrack === url && isPlaying) {
      pause();
      trackEvent(GA4Events.audio_pause, {
        event_label: "audio_pause_from_mantra_detail_page",
        mantraId,
      });
      setCurrentLoopMantra(null);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
      return;
    }

    if (currentTrack !== url) {
      setCurrentLoopMantra(null);
    }

    trackEvent(GA4Events.mantra_played, {
      event_label: "mantra_played_from_mantra_detail_page",
      mantraId,
    });

    const deityHindi = detail?.name ? `${detail.name} मंत्र` : "मंत्र";
    const deityEng = detail?.name2 ? detail.name2.split("\n")[1] || "" : "";
    const artwork = detail?.imageUrl || detail?.imagethumb || "";

    play(url, {
      title: deityHindi,
      englishTitle: deityEng,
      imageUrl: artwork,
      subtitle: "Bhakti Bhav Mantra",
      category: "मंत्र",
    });
  };

  const toggleLoop = (mantraId, audioUrl) => {
    if (!audioUrl) return;

    trackEvent(GA4Events.mantra_loop_toggled, {
      event_label: "mantra_loop_toggled_from_mantra_detail_page",
      mantraId,
    });

    if (currentLoopMantra === mantraId) {
      setCurrentLoopMantra(null);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
      return;
    }

    if (currentTrack === audioUrl) {
      setCurrentLoopMantra(mantraId);
      if (audioRef.current) {
        audioRef.current.loop = true;
      }
    } else {
      const deityHindi = detail?.name ? `${detail.name} मंत्र` : "मंत्र";
      const deityEng = detail?.name2 ? detail.name2.split("\n")[1] || "" : "";
      const artwork = detail?.imageUrl || detail?.imagethumb || "";

      play(audioUrl, {
        title: deityHindi,
        englishTitle: deityEng,
        imageUrl: artwork,
        subtitle: "Bhakti Bhav Mantra",
        category: "मंत्र",
      });
      setCurrentLoopMantra(mantraId);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.loop = true;
        }
      }, 100);
    }
  };

  if (loading) {
    return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFBF7]">
        <p className="text-xl text-[#851C2C] font-semibold mb-4">❌ कोई मंत्र नहीं मिला!</p>
        <button
          onClick={() => navigate("/mantra")}
          className="bg-[#851C2C] text-white px-6 py-2 rounded-full font-medium"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  const displayTitle = parseMantraTitle(detail, language);
  const heroImageUrl = detail.imageUrl || detail.imagethumb;

  const getVerseText = (verse) => {
    if (!verse) return "";
    // In English mode, display text2 if available; in Hindi & Hinglish, display text
    const raw = language === "en" ? (verse.text2 || verse.text || "") : (verse.text || verse.text2 || "");
    return stripHtmlTags(raw)
      .replace(/:/g, "ः")
      .replace(/ँ/g, "ं")
      .replace(/,/g, " ")
      .replace(/\u200D|\u200C/g, " ")
      .normalize("NFC");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800">
      <SEO
        title={`${displayTitle} - मंत्र संग्रह व ऑडियो | भक्ति भाव`}
        description={`सुनें और पढ़ें ${displayTitle} मंत्र, पाठ और जाप भक्ति भाव पर।`}
        canonical={`https://bhaktibhav.app/mantra/${id}`}
      />

      {/* ── Unchanged Header ── */}
      <Header pageName={{ hi: "ea=", en: "Mantra" }} fontSizeOption="true" />
      <div className="h-2"></div>

      {/* ── Main Content Area (Lower of Header) ── */}
      <main className="container mx-auto max-w-md md:max-w-lg px-4 pt-1 pb-20">
        {/* ── Deity Title Flanked with Left/Right Diya Ornaments ── */}
        <div className="flex items-center justify-center gap-3 mt-3 mb-1">
          <img
            src="/img/deep.png"
            alt="diya"
            className="w-5 h-5 object-contain select-none"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <h1
            className={`text-2xl sm:text-3xl font-bold text-[#851C2C] tracking-wide text-center ${
              language === "en" ? "font-eng" : "font-hindi"
            }`}
          >
            {displayTitle}
          </h1>
          <img
            src="/img/deep.png"
            alt="diya"
            className="w-5 h-5 object-contain select-none scale-x-[-1]"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* ── Decorative Golden Divider with Center Lotus Icon ── */}
        <div className="flex items-center justify-center my-3 max-w-[280px] mx-auto select-none">
          <div className="h-[1px] flex-1 bg-[#D9A05B]"></div>
          <span className="px-2.5 text-[#D9A05B] text-base leading-none">🪷</span>
          <div className="h-[1px] flex-1 bg-[#D9A05B]"></div>
        </div>

        {/* ── Centered Deity Hero Illustration Image (Natural Cutout) ── */}
        {heroImageUrl && (
          <div className="flex justify-center my-3 sm:my-4">
            <img
              src={heroImageUrl}
              alt={displayTitle}
              className="w-auto h-52 sm:h-60 md:h-64 max-w-[260px] sm:max-w-[300px] object-contain drop-shadow-sm select-none"
            />
          </div>
        )}

        {/* ── Mantra Verses List Cards Matching Screenshot ── */}
        <div className="space-y-3.5 my-4">
          {detail.mantras?.map((item, index) => {
            const mantraId = item._id || index;
            const isThisPlaying = currentTrack === item.audioUrl && isPlaying;
            const isThisLooping = currentLoopMantra === mantraId;
            const verseText = getVerseText(item);

            return (
              <div
                key={mantraId}
                className="bg-white rounded-2xl border border-[#D98A95] px-4 py-3 sm:py-3.5 flex items-center justify-between shadow-sm hover:shadow transition"
              >
                {/* Verse Text */}
                <div className="flex-1 pr-3">
                  <p
                    className={`text-base sm:text-lg font-bold text-[#851C2C] leading-snug ${
                      language === "en" ? "font-eng" : "font-hindi"
                    } ${fontSize || ""}`}
                  >
                    {verseText}
                  </p>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 sm:h-9 w-[1px] bg-gray-200 mr-3 shrink-0"></div>

                {/* Interactive Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  {/* Play / Pause Circular Maroon Button */}
                  <button
                    type="button"
                    onClick={() => handlePlay(item.audioUrl, mantraId, verseText)}
                    disabled={!item.audioUrl}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition ${
                      !item.audioUrl
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#851C2C] hover:bg-[#6E1624] text-white active:scale-95"
                    }`}
                    aria-label={isThisPlaying ? "Pause" : "Play"}
                  >
                    {isThisPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* Repeat Loop Circular Button */}
                  <button
                    type="button"
                    onClick={() => toggleLoop(mantraId, item.audioUrl)}
                    disabled={!item.audioUrl}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition active:scale-95 ${
                      !item.audioUrl
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : isThisLooping
                        ? "border-[#851C2C] bg-[#851C2C] text-white shadow-sm"
                        : "border-gray-300 bg-white text-gray-600 hover:border-[#851C2C] hover:text-[#851C2C]"
                    }`}
                    aria-label="Toggle loop"
                    title={isThisLooping ? "Loop active" : "Enable loop"}
                  >
                    <Repeat size={16} strokeWidth={2.3} />
                  </button>

                  {/* Right Arrow Chevron */}
                  <ChevronRight size={18} className="text-gray-400 select-none" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
