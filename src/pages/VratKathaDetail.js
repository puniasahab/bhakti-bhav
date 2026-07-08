import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import PageTitleCard from "../components/PageTitleCard";

import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { useLocation } from "react-router-dom";
import { vratKathaApis } from "../api";
import { fixKrutiDevHtml, replaceSpecialChars } from "../commonFunctions";

function VratKathaDetail() {
    const { id, date } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const { play, pause, stop, isPlaying, currentTrack } = useAudio();
    const location = useLocation();

    const baseParams = useGA4BaseParams("Vrat Katha Detail Screen");
    const { trackEvent } = useGA4Tracker(baseParams);

    useEffect(() => {
        if (!id) return;
        console.log("Fetching katha with id:", id);
        console.log("Date parameter:", date);

        setLoading(true);
        vratKathaApis.fetchSingleVratKathaData("v3", id, language, date)
            .then((resJson) => {
                if (resJson.status === "success" && resJson.data) {
                    let parsed = { ...resJson.data };
                    console.log("Fetched katha:", parsed);
                    try {
                        parsed.paksh = JSON.parse(resJson.data.paksh);
                        parsed.time = JSON.parse(resJson.data.time);
                        parsed.mantra = JSON.parse(resJson.data.mantra);
                    } catch (e) {
                        console.warn("Error parsing JSON fields:", e);
                    }
                    setDetail(parsed);
                } else {
                    setDetail(null);
                    alert("No data found!");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching katha:", err);
                setDetail(null);
                setLoading(false);
            });
    }, [id, date, language]);

    const redirectToAartiPage = (artiId) => {
        if (!artiId) {
            // alert("No Arti ID available for this Katha.");
            return "/aarti";
        }

        return `/aarti/${artiId}`;
    };

    const handlePlay = (url) => {
        if (!url) return;

        // Check if this katha is currently playing
        if (currentTrack === url && isPlaying) {
            pause();
        } else {
            // Store katha name for the global player
            localStorage.setItem('currentTrackName', `${typeof detail.name === "string" ? detail.name : (detail.name?.hi || detail.name?.en)} कथा`);
            play(url);
        }
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
    if (!detail) return <p className="text-center py-10 theme_text">❌ No data found!</p>;

    const jsonFile = {
        "share": {
            "hi": "'ks;j djsa",
            "en": "Share"
        },
        "listen": {
            "hi": "dFkk lqusa",
            "en": "Listen"
        },
        "pause": {
            "hi": "can djsa",
            "en": "Pause"
        },
        "aarti": {
            "hi": "vkjrh",
            "en": "Aarti"
        },
        "timings": {
            "start": {
                "hi": "प्रारंभ",
                "en": "Start"
            },
            "end": {
                "hi": "समाप्त",
                "en": "End"
            }
        },
        "player": {
            "hi": "कथा प्लेयर",
            "en": "Katha Player"
        }
    }

    // Direct text-only sharing function using navigator.share
    const handleNativeShare = async () => {
        try {
            const kathaName = typeof detail.name === "string" ? detail.name : (detail.name?.hi || detail.name?.en || "व्रत कथा");
            const currentUrl = window.location.href;

            // Create share message exactly like the selected text
            const shareMessage = `🙏 ${kathaName} - Beautiful व्रत कथा from Bhakti Bhav! 🙏

📖 Read the complete कथा here: ${currentUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual कथा, mantras, and devotional content!

🔗 https://play.google.com/store/apps/details?id=com.bhakti_bhav

🙏 Har Har Mahadev 🙏`;

            // Direct sharing using navigator.share - no canvas or complex logic
            await navigator.share({
                title: `🙏 ${kathaName} - व्रत कथा from Bhakti Bhav! 🙏`,
                text: shareMessage
            });

            console.log('✅ Content shared successfully!');
        } catch (error) {
            // Only log if user didn't cancel the share dialog
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
            } else {
                console.log('User cancelled the share dialog');
            }
        }
    };

    
const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const formatHindiName = (name) => String(name || "")
  .replace(/\//g, "|").replace(/\|/g, "।")
  .replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½")
  .replace(/\:/g, "%").replace(/:/g, "ः")
  .replace(/ँ/g, "ं")
  .replace(/\u200D|\u200C/g, "  ")
  .replace(/[.,;!?'"""'']/g, " ")
  .replace(/[\[\]{}()]/g, "")
  .replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ")
  .replace(/[^\u0900-\u097F\s।॥]/g, "")
  .replace(/\u00A0/g, " ")
  .replace(/\u200B|\u200C|\u200D/g, " ")
  .replace(/\s+/g, " ")
  .normalize("NFC");

const getHinglishNameParts = (name) => {
  const lines = stripHtmlTags(name)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hindiText = lines[0] || "";
  const englishText = lines.slice(1).join(" ");

  return {
    hindiText,
    englishText: englishText
      ? englishText.startsWith("(") && englishText.endsWith(")")
        ? englishText
        : `(${englishText.replace(/^\(|\)$/g, "").trim()})`
      : ""
  };
};

const renderVratKathaName = (katha, language) => {
  if (language === "hi") {
    return formatHindiName(katha.name);
  }

  if (language !== "hinglish") {
    return katha.name;
  }

  const { hindiText, englishText } = getHinglishNameParts(katha.name2 || katha.name);

  if (!englishText) {
    return <span className="font-eng">{hindiText}</span>;
  }

  return (
    <>
      <span className="block font-hindi text-lg md:text-xl leading-tight">{hindiText}</span>
      <span className="block font-eng text-xs md:text-sm leading-tight">{englishText}</span>
    </>
  );
};

const getVratKathaAltText = (katha, language) => {
  if (language === "hinglish") {
    return stripHtmlTags(katha.name2 || katha.name);
  }

  return stripHtmlTags(katha.name);
};

const getPlainOrHtmlText = (value) => {
  if (Array.isArray(value)) return value.join("\n");
  if (value && typeof value === "object") return value.hinglish || value.en || value.hi || "";
  return value || "";
};

const withLineBreaks = (value) => String(getPlainOrHtmlText(value) || "")
  .replace(/\r\n/g, "\n")
  .replace(/\n/g, "<br />");

const hasHtmlTags = (value) => /<[^>]+>/.test(String(value || ""));

const normalizeHinglishHtml = (value) => {
  const html = withLineBreaks(value);

  return fixKrutiDevHtml(
    html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
      if (tag) return tag;
      if (!text) return match;
      return replaceSpecialChars(text);
    })
  );
};

const renderHinglishRichText = (value, className) => (
  <div
    className={className}
    dangerouslySetInnerHTML={{ __html: normalizeHinglishHtml(value) }}
  />
);

const renderVratKathaDetailTitle = (detail, language) => {
  if (language === "hinglish") {
    return renderVratKathaName(detail, language);
  }

  if (language === "hi") {
    return formatHindiName(typeof detail.name === "string" ? detail.name : (detail.name?.hi || ""))
      .replace(/[०-९]/g, digit => hindiToEnglishMap[digit]);
  }

  return typeof detail.name === "string" ? detail.name : (detail.name?.en || "");
};


    

    const hindiToEnglishMap = {
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9'
    };
    const englishToHindiMap = {
        '0': '०',
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९'
    };

    const fixHindiDigits = (text) => {
        if (!text) return text;

        // Replace Devanagari digits with ASCII numbers manually
        return text
            .replaceAll("०", "0")
            .replaceAll("१", "1")
            .replaceAll("२", "2")
            .replaceAll("३", "3")
            .replaceAll("४", "4")
            .replaceAll("५", "5")
            .replaceAll("६", "6")
            .replaceAll("७", "7")
            .replaceAll("८", "8")
            .replaceAll("९", "9");
    };

    // useEffect(() => {
    //     if (audioRef.current) {
    //         audioRef.current.pause();
    //         audioRef.current.currentTime = 0;
    //     }
    // }, [location])

    const HighlightNumbersPujaSamagiri = (text) => {
        const parts = text.split(/(\d+)/g);

        return (
            <span>
                {parts.map((part, index) =>
                    /^\d+$/.test(part) ? (
                        <span
                            key={index}
                            style={{
                                fontFamily: "Roboto Mono, mocode nospace",
                                // fontWeight: "600",
                                color: "black",
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        <span key={index}>{part.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/"/g, '').replace(/:/g, "ः")           // English colon → Devanagari visarga
                                            .replace(/-/g, " ")           // Replace dash with space
                                            .replace(/\//g, " ")          // Replace slash with space
                                            // .replace(/[(){}\[\]]/g, "")   // Remove brackets
                                            // .replace(/[.,;]/g, " ")       // Replace English punctuation
                                            .replace(/[|]/g, "॥")        // Replace single danda bar | with Hindi double danda
                                            // .replace(/[^\u0900-\u097F\s।॥ः]/g, "") // Remove non-Devanagari chars
                                            .normalize("NFC")}</span>
                    )
                )}
            </span>
        );
    }

    const HighlightNumbersKatha = (text) => {
        const parts = text.split(/(\d+)/g);

        return (
            <span>
                {parts.map((part, index) =>
                    /^\d+$/.test(part) ? (
                        <span
                            key={index}
                            style={{
                                fontFamily: "Roboto Mono, monospace",
                                // fontWeight: "600",
                                color: "black",
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        <span key={index}>{part.replace(/,/g, ']')
                            .replace(/\(/g, '¼')
                            .replace(/\)/g, '½')
                            .replace(/-/g, ' ')
                            .replace(/\:/g, 'ः')
                            .replace(/\//g, ' ')
                            .replace(/"/g, '”')
                            .replace(/``|''/g, '”')}</span>
                    )
                )}
            </span>
        );
    }

    

    const HighlightNumbers = (text) => {

        // Split text into segments — words, numbers, and symbols
        const parts = text.split(/(\d+)/g);

        return (
            <span>
                {parts.map((part, index) =>
                    /^\d+$/.test(part) ? (
                        <span
                            key={index}
                            style={{
                                fontFamily: "Roboto Mono, monospace",
                                // fontWeight: "600",
                                color: "black",
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        <span key={index}>{part.replace(/,/g, ']').replace(/\(/g, "¼").replace(/\)/g, "½").replace(/-/g, " ").replace(/\:/g, "ः").replace(/\//g, " ").replace(/"/g, "”")       // Replace plain English quotes with right Hindi quote
                                    .replace(/``|''/g, "”")   // Replace double single quotes
                                    .replace(/“/g, "")       // Normalize any weird quote forms
                                    .replace(/”/g, "")}</span>
                    )
                )}
            </span>
        );
    };

    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            // Format time in 12-hour format with AM/PM
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            // Convert to 12-hour format
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12
            const formattedHours = hours.toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    return (
        <>
            <Header pageName={{ hi: "ozr dFkk", en: "Vrat Katha" }} hindiFontSize="true" />
            <div className="h-2"></div>
            <PageTitleCard
                titleHi={language === "hi" ? renderVratKathaDetailTitle(detail, language) : ""}
                titleEn={language === "hi" ? "" : renderVratKathaDetailTitle(detail, language)}
                
                customEngFontSize={(() => { const n = language === "hinglish" ? stripHtmlTags(detail.name2 || detail.name || "") : (typeof detail.name === "string" ? detail.name : (detail.name?.en || "")); return n.length > 30 ? "14px" : n.length > 20 ? "15px" : "16px"; })()}
                customFontSize={"19px"}
            />

            <div className="container mx-auto px-4 pb-24 theme_text">
                {detail.imageUrl && (
                    <div className="flex justify-center mt-4">
                        <img
                            src={`${detail.imageUrl}`}
                            alt={getVratKathaAltText(detail, language)}
                            className="w-60 h-60 object-cover rounded-xl shadow-lg border-4 border-white bg-[#690016]"
                        />
                    </div>
                )}

                {detail.time && detail.time.start && detail.time.end && (
                <div className="flex justify-center mt-4">
                    <div className="bg-[rgba(255,250,244,0.6)] shadow rounded-lg px-6 py-3 md:flex-row gap-4 text-center border border-[#9A283D]">
                        <div className="flex justify-center items-center">
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.start.hi} %` : `${jsonFile.timings.start.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{formatDateToDDMMYYYY(detail.time?.start)}</p>
                        </div>
                        <div className="flex justify-center items-center">
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.end.hi} %` : `${jsonFile.timings.end.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{formatDateToDDMMYYYY(detail.time?.end)}</p>
                        </div>
                    </div>
                </div>
                )}

                <div className="flex justify-center gap-4">
                    <div className="mt-4">
                        <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`} onClick={() => {trackEvent(GA4Events.vrat_katha_shared, { vratKathaId: detail._id, event_label: "vrat_katha_shared_button_clicked" }); handleNativeShare() }}>
                            <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
                        </button>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => {trackEvent(GA4Events.vrat_katha_hear_cta_clicked, { vratKathaId: detail._id, event_label: "vrat_katha_hear_btn_clicked" }); handlePlay(detail.audioUrl)}}
                            disabled={!detail.audioUrl}
                            className={`px-6 py-2 flex items-center justify-center rounded-full transition ${language === "hi" ? "font-hindi" : "font-eng"} ${!detail.audioUrl ? "bg-[#9A283D]/50 text-white cursor-not-allowed" : (isPlaying && currentTrack === detail.audioUrl) ? "bg-red-600 text-white" : "bg_theme text-white"}`}
                        >
                            {(isPlaying && currentTrack === detail.audioUrl) ? (
                                <><span className="audio_pause_icon mr-2"></span> {language === "hi" ? jsonFile.pause.hi : jsonFile.pause.en}</>
                            ) : (
                                <><span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.listen.hi : jsonFile.listen.en}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mantra */}
                <div className="text-center my-8 text-xl">
                    {(() => {
                        if (language === "hinglish") {
                            return renderHinglishRichText(
                                detail.mantra2 || detail.mantra,
                                `font-hindi text-[#9A283D] ${fontSize}`
                            );
                        }

                        const mantraText = typeof detail.mantra === "string" ? detail.mantra : (language === "hi" ? detail.mantra?.hi : detail.mantra?.en) || "";
                        const cleaned = mantraText.replace(/"/g, '').replace(/:/g, "ः").replace(/-/g, " ").replace(/\//g, " ").replace(/[(){}\[\]]/g, "").replace(/[.,;]/g, " ").replace(/[|]/g, "॥").replace(/[^\u0900-\u097F\s।॥ः]/g, "").replace(/[०-९]/g, digit => hindiToEnglishMap[digit]).normalize("NFC");
                        return (
                            <p className={`${language === "hi" ? "font-hindi" : "font-eng"} text-[#9A283D] ${fontSize}`}>{cleaned}</p>
                        );
                    })()}
                </div>

                {/* Prarambh */}
                <div className="mb-4">
                    {(() => {
                        const text = typeof detail.prarambh === "string" ? detail.prarambh : (language === "hi" ? detail.prarambh?.hi : detail.prarambh?.en) || "";
                        return <p className={`${language === "hi" ? "font-hindi" : "font-eng"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{text}</p>;
                    })()}
                </div>

                {/* Samapt */}
                <div className="mb-4">
                    {(() => {
                        const text = typeof detail.samapt === "string" ? detail.samapt : (language === "hi" ? detail.samapt?.hi : detail.samapt?.en) || "";
                        return <p className={`${language === "hi" ? "font-hindi" : "font-eng"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{text}</p>;
                    })()}
                </div>

                {/* Puja Vidhi */}
                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize}`}>
                        {language === "hi" ? <span className="font-hindi text-2xl">iwtk fof/k </span> : <span className="font-eng"> Puja Vidhi </span>}
                    </h2>
                    {(() => {
                        if (language === "hinglish") {
                            return renderHinglishRichText(
                                detail.pujaVidhi2 || detail.pujaVidhi,
                                `font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`
                            );
                        }

                        const raw = typeof detail.pujaVidhi === "string" ? detail.pujaVidhi : (language === "hi" ? detail.pujaVidhi?.hi : detail.pujaVidhi?.en) || "";
                        return raw.split("\n").map((line, idx) => (
                            <p key={idx} className={`${language === "hi" ? "font-hindi" : "font-eng"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {language === "hi" ? HighlightNumbers(line) : line}
                            </p>
                        ));
                    })()}
                </div>

                {/* Puja Samagri */}
                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize}`}>
                        {language === "hi" ? <span className="font-hindi text-2xl">iwtk lkexzh</span> : <span className="font-eng">Puja Samagri</span>}
                    </h2>
                    <ul className={`list-inside text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                        {(() => {
                            if (language === "hinglish") {
                                const raw = getPlainOrHtmlText(detail.pujaSamagri2 || detail.pujaSamagri);

                                if (hasHtmlTags(raw)) {
                                    return (
                                        <li className="list-none">
                                            {renderHinglishRichText(raw, "font-hindi")}
                                        </li>
                                    );
                                }

                                return raw.split(/\n/).map((item, i) => (
                                    <li key={i} className="font-hindi">
                                        {replaceSpecialChars(item.trim())}
                                    </li>
                                ));
                            }

                            const raw = typeof detail.pujaSamagri === "string"
                                ? detail.pujaSamagri
                                : Array.isArray(detail.pujaSamagri)
                                    ? detail.pujaSamagri.join(", ")
                                    : (language === "hi" ? (Array.isArray(detail.pujaSamagri?.hi) ? detail.pujaSamagri.hi.join(", ") : detail.pujaSamagri?.hi) : (Array.isArray(detail.pujaSamagri?.en) ? detail.pujaSamagri.en.join(", ") : detail.pujaSamagri?.en)) || "";
                            return raw.split(/\n/).map((item, i) => (
                                <li key={i} className={language === "hi" ? "font-hindi" : "font-eng"}>
                                    {language === "hi" ? HighlightNumbersPujaSamagiri(item.trim()) : item.trim()}
                                </li>
                            ));
                        })()}
                    </ul>
                </div>

                {/* Katha / PujaMahatva */}
                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize}`}>
                        {language === "hi" ? <span className="font-hindi text-2xl"> dFkk </span> : <span className="font-eng">Katha</span>}
                    </h2>
                    {(() => {
                        if (language === "hinglish") {
                            return renderHinglishRichText(
                                detail.pujaMahatva2 || detail.pujaMahatva,
                                `font-hindi text-[rgba(0,0,0,0.7)] ${fontSize} break-words w-full`
                            );
                        }

                        const raw = typeof detail.pujaMahatva === "string" ? detail.pujaMahatva : (language === "hi" ? detail.pujaMahatva?.hi : detail.pujaMahatva?.en) || "";
                        if (language === "hi") {
                            const cleaned = raw.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/:/g, "ः").replace(/ँ/g, "ं").replace(/\u200D|\u200C/g, "  ").replace(/[.,;!?'"""'']/g, " ").replace(/[\[\]{}()]/g, "").replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ").replace(/[^\u0900-\u097F\s।॥]/g, "").replace(/\u00A0/g, " ").replace(/\u200B|\u200C|\u200D/g, " ").replace(/\s+/g, " ").replace(/[०-९]/g, digit => hindiToEnglishMap[digit]).normalize("NFC");
                            return <div className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize} break-words w-full`} dangerouslySetInnerHTML={{ __html: cleaned }} />;
                        }
                        return <div className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize} break-words w-full`} dangerouslySetInnerHTML={{ __html: raw }} />;
                    })()}
                </div>

                <div className="mt-4 w-full text-center" onClick={() => {
                    trackEvent(GA4Events.aarti_cta_tapped_on_vrat_katha, {
                        event_label: `aarti_cta_tapped_on_vrat_katha || "no_arti_id"}`,
                        aartiId: detail.artiId || "no_arti_id",
                    });
                }}>
                    <a href={redirectToAartiPage(detail.artiId)}
                        className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow inline-flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}
                    >
                        <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.aarti.hi : jsonFile.aarti.en}
                    </a>
                </div>
            </div>

        </>
    );  
}

export default VratKathaDetail;
