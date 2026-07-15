import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import SEO from "../components/SEO";
import { categoryContentApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import { homeSchema } from "../seo/schemas";
import { replaceSpecialChars, fixKrutiDevHtml } from "../commonFunctions";
import SchemaMarkup from "../components/SchemaMarkup";
import { getKahaniyaDetailSchema, getKahaniyaSchema } from "../schemas/pageSchemas";

const normalizeAssetUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://api.bhaktibhav.app${url}`;
};

const getContentDetail = (response) => response?.data || response || null;

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

// Splits an HTML title into its separate <p> blocks (each block's inner text, tags stripped).
const getParagraphBlocks = (title) => {
  const html = String(title || "");
  const matches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];

  if (matches.length > 0) {
    return matches
      .map((match) => stripHtmlTags(match[1]))
      .filter(Boolean);
  }

  // No <p> tags found — treat the whole string as a single block
  const single = stripHtmlTags(html);
  return single ? [single] : [];
};

const getHinglishTitleParts = (title) => {
  const normalizedTitle = String(title || "").trim();

  // 1) Preferred: title split into separate <p> blocks — first block is Hindi, second is English
  const paragraphBlocks = getParagraphBlocks(normalizedTitle);
  if (paragraphBlocks.length >= 2) {
    return {
      hindiText: paragraphBlocks[0],
      englishText: paragraphBlocks.slice(1).join(" ").replace(/^\(([\s\S]*)\)$/, "$1").trim()
    };
  }

  // 2) Fallback: title split via <br> tags (single <p> or no <p> at all)
  const withoutPTags = normalizedTitle.replace(/<\/?p[^>]*>/gi, "").trim();
  const [hindiText = "", englishText = ""] = withoutPTags.split(/<\/?br\s*\/?>/i);
  const cleanHindiText = stripHtmlTags(hindiText);
  const cleanEnglishText = stripHtmlTags(englishText);

  if (!cleanEnglishText) {
    const titleWithoutTags = stripHtmlTags(withoutPTags);
    const parenthesizedEnglish = titleWithoutTags.match(/^(.*?)\s*(\([^()]*[A-Za-z][^()]*\))\s*$/);

    if (parenthesizedEnglish) {
      return {
        hindiText: parenthesizedEnglish[1].trim(),
        englishText: parenthesizedEnglish[2].replace(/^\(([\s\S]*)\)$/, "$1").trim()
      };
    }
  }

  return {
    hindiText: cleanHindiText,
    englishText: cleanEnglishText
  };
};

// KrutiDev/font-hindi glyph mapping renders a literal "?" as a different symbol.
// Split text on "?" and wrap each "?" in a neutral (non font-hindi) span so it
// always renders as an actual question mark, regardless of the parent font class.
const renderTextWithSafeQuestionMarks = (text) => {
  if (typeof text !== "string" || !text.includes("?")) return text;

  const parts = text.split("?");
  return parts.reduce((acc, part, index) => {
    if (index > 0) {
      acc.push(<span key={`q-${index}`} className="font-eng">?</span>);
    }
    if (part) acc.push(part);
    return acc;
  }, []);
};

const renderHinglishTitle = (title) => {
  const { hindiText, englishText } = getHinglishTitleParts(title);

  if (!englishText) {
    return <span className="font-eng">{renderTextWithSafeQuestionMarks(stripHtmlTags(title))}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-[19px]">{renderTextWithSafeQuestionMarks(hindiText)}</span>
      <span className="block font-eng text-[14px] leading-tight">{renderTextWithSafeQuestionMarks(englishText)}</span>
    </>
  );
};

export default function KahaniyaDetails() {
  const { contentId } = useParams();
  const location = useLocation();
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, isPlaying, currentTrack } = useAudio();
  const [detail, setDetail] = useState(() => location.state?.item || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function fetchDetails() {
      try {
        setLoading(true);
        const response = await categoryContentApis.fetchContentDetailsByContentId(contentId, language);
        const contentDetail = getContentDetail(response);

        if (isActive) {
          setDetail(contentDetail);
        }
      } catch (error) {
        if (isActive) {
          console.error("Kahaniya details API Error:", error);
          setDetail(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isActive = false;
    };
  }, [contentId, language]);

  const title = useMemo(() => {
    if (typeof detail?.title === "string") return detail.title;
    return detail?.title?.[language] || detail?.title?.hi || detail?.title?.en || "Kahaniya";
  }, [detail, language]);

  const imageUrl = normalizeAssetUrl(detail?.imageUrl);
  const audioUrl = normalizeAssetUrl(detail?.audioUrl);
  const contentHtml = detail?.description || detail?.khaniya || "";
  const isCurrentAudioPlaying = audioUrl && currentTrack === audioUrl && isPlaying;
  const { englishText: titleEnglishText } = useMemo(
    () => getHinglishTitleParts(title),
    [title]
  );
  const pageTitleEn = language === "hinglish"
    ? renderHinglishTitle(title)
    : (titleEnglishText || stripHtmlTags(title));

  const labels = {
    share: {
      hi: "'ks;j djsa",
      en: "Share"
    },
    listen: {
      hi: "dgkuh lqusa",
      en: "Listen"
    },
    pause: {
      hi: "can djsa",
      en: "Pause"
    }
  };

  const handlePlay = () => {
    if (!audioUrl) return;

    if (isCurrentAudioPlaying) {
      pause();
      return;
    }

    localStorage.setItem("currentTrackName", title);
    play(audioUrl);
  };

  const handleNativeShare = async () => {
    try {
      const currentUrl = window.location.href;
      const shareMessage = `🙏 ${title} - Kahaniya from Bhakti Bhav! 🙏

📖 Read/Listen Kahaniya: ${currentUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual content!

🔗 App Link: https://play.google.com/store/apps/details?id=com.bhakti_bhav

🙏 Har Har Mahadev 🙏`;

      await navigator.share({
        title: `🙏 ${title} - Kahaniya from Bhakti Bhav! 🙏`,
        text: shareMessage
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;

  if (!detail) {
    return (
      <>
        <Header pageName={{ hi: "कहानियां", en: "Kahaniya" }} hindiFontSize={language === "hi"} />
        <p className="text-center py-10 theme_text">❌ No data found!</p>
      </>
    );
  }

  function formatDate(date) {
    const pad = n => String(n).padStart(2, '0');

    return (
        date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds()) +
        '+05:30'
    );
}

const datePublished = formatDate(new Date());

  return (
    <>
    {/* <SchemaMarkup schema={getKahaniyaSchema(contentId, datePublished)} /> */}
      <SEO
        title={`${title} | भक्ति भाव`}
        description={title}
        canonical={`https://bhaktibhav.app/kahaniya-details/${contentId}`}
        schema={homeSchema}
      />
      <Header pageName={{ hi: "कहानियां", en: "Kahaniya" }} hindiFontSize={language === "hi"} />
      <div className="h-2"></div>
      <PageTitleCard
        titleHi={language === "hi" ? fixKrutiDevHtml(replaceSpecialChars(stripHtmlTags(title))) : ""}
        titleEn={language === "hi" ? "" : pageTitleEn}
        customEngFontSize="16px"
        customFontSize="19px"
      />

      <div className="container mx-auto px-4 mt-4 pb-20">
        {imageUrl && (
          <div className="flex justify-center mb-6">
            <img
              crossOrigin="anonymous"
              src={imageUrl}
              alt={stripHtmlTags(title)}
              className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-xl shadow-lg object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">
            <button
              className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}
              onClick={handleNativeShare}
            >
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" />
              {language === "hi" ? labels.share.hi : labels.share.en}
            </button>
          </div>

          {audioUrl && (
            <div className="mt-4">
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${
                  isCurrentAudioPlaying ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                }`}
              >
                {isCurrentAudioPlaying ? (
                  <>
                    <span className="audio_pause_icon mr-2"></span>
                    {language === "hi" ? labels.pause.hi : labels.pause.en}
                  </>
                ) : (
                  <>
                    <span className="audio_icon mr-2"></span>
                    {language === "hi" ? labels.listen.hi : labels.listen.en}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div
          className={`theme_text leading-loose mt-4 text-center ${fontSize} ${language === "hi" ? "font-hindi" : "font-eng"}`}
          dangerouslySetInnerHTML={{
            __html: language === "hi"
              ? fixKrutiDevHtml(replaceSpecialChars(contentHtml))
              : contentHtml
          }}
        />
      </div>
    </>
  );
}
