import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import PageTitleCard from "../components/PageTitleCard";

import { useLocation } from "react-router-dom";

function VratKathaDetail() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const { play, pause, stop, isPlaying, currentTrack } = useAudio();
    const location = useLocation();

    useEffect(() => {
        if (!id) return;
        console.log("Fetching katha with id:", id);

        fetch(`https://api.bhaktibhav.app/frontend/katha/${id}`)
            .then((res) => res.json())
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
    }, [id]);

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
            localStorage.setItem('currentTrackName', `${detail.name?.hi || detail.name?.en} कथा`);
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
            const kathaName = detail.name?.hi || detail.name?.en || "व्रत कथा";
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
                                fontFamily: "Roboto Mono, monospace",
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

    return (
        <>
            <Header pageName={{ hi: "ozr dFkk", en: "Vrat Katha" }} hindiFontSize="true" />
            <PageTitleCard
                titleHi={detail.name.hi}
                titleEn={detail.name.en}
                customEngFontSize={"13px"}
                customFontSize={"18px"}

            />

            <div className="container mx-auto px-4 pb-24 theme_text">
                {detail.imageUrl && (
                    <div className="flex justify-center mt-4">
                        <img
                            src={`${detail.imageUrl}`}
                            alt={detail.name?.en}
                            className="w-60 h-60 object-cover rounded-xl shadow-lg border-4 border-white bg-[#690016]"
                        />
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <div className="bg-[rgba(255,250,244,0.6)] shadow rounded-lg px-6 py-3 md:flex-row gap-4 text-center border border-[#9A283D]">
                        <div className="flex justify-center items-center">
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.start.hi} %` : `${jsonFile.timings.start.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.start).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-center items-center">
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.end.hi} %` : `${jsonFile.timings.end.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.end).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <div className="mt-4">

                        <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`} onClick={() => { handleNativeShare() }}>
                            <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
                        </button>
                    </div>


                    <div className="mt-4">
                        <button
                            onClick={() => handlePlay(detail.audioUrl)}
                            disabled={!detail.audioUrl}
                            className={`px-6 py-2 flex items-center justify-center rounded-full 
                             transition ${language === "hi" ? "font-hindi" : "font-eng"} ${!detail.audioUrl
                                    ? "bg-[#9A283D]/50 text-white cursor-not-allowed"
                                    : (isPlaying && currentTrack === detail.audioUrl)
                                        ? "bg-red-600 text-white"
                                        : "bg_theme text-white"
                                }`}
                        >
                            {(isPlaying && currentTrack === detail.audioUrl) ? (
                                <>
                                    <span className="audio_pause_icon mr-2"></span> {language === "hi" ? jsonFile.pause.hi : jsonFile.pause.en}
                                </>
                            ) : (
                                <>
                                    <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.listen.hi : jsonFile.listen.en}
                                </>
                            )}
                        </button>

                    </div>
                </div>
                <div className="text-center my-8 text-xl">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[#9A283D] ${fontSize}`}>
                        {detail.mantra?.hi?.replace(/"/g, '').replace(/:/g, "ः")           // English colon → Devanagari visarga
                            .replace(/-/g, " ")           // Replace dash with space
                            .replace(/\//g, " ")          // Replace slash with space
                            .replace(/[(){}\[\]]/g, "")   // Remove brackets
                            .replace(/[.,;]/g, " ")       // Replace English punctuation
                            .replace(/[|]/g, "॥")         // Replace single danda bar | with Hindi double danda
                            .replace(/[^\u0900-\u097F\s।॥ः]/g, "").replace(/[०-९]/g, digit => hindiToEnglishMap[digit]) // Remove non-Devanagari chars
                            .normalize("NFC")}
                    </p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[#9A283D] ${fontSize}`}>
                        {detail.mantra?.hi?.replace(/:/g, "ः")           // English colon → Devanagari visarga
                            .replace(/-/g, " ")           // Replace dash with space
                            .replace(/\//g, " ")          // Replace slash with space
                            .replace(/[(){}\[\]]/g, "")   // Remove brackets
                            .replace(/[.,;]/g, " ")       // Replace English punctuation
                            .replace(/[|]/g, "॥")         // Replace single danda bar | with Hindi double danda
                            .replace(/[^\u0900-\u097F\s।॥ः]/g, "").replace(/[०-९]/g, digit => hindiToEnglishMap[digit]) // Remove non-Devanagari chars
                            .normalize("NFC")}
                    </p>
                </div>

                <div className="mb-4">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.en}</p>

                </div>

                <div className="mb-4">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.en}</p>
                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `}>
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl">iwtk fof/k </span>
                        ) : (
                            <span className="font-eng"> Puja Vidhi </span>

                        )}
                    </h2>

                    {language === "hi"
                        ? detail.pujaVidhi?.hi?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {HighlightNumbers(line)}
                            </p>
                        ))
                        : detail.pujaVidhi?.en?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line}
                            </p>
                        ))}

                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `}>
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl">iwtk lkexzh</span>
                        ) : (
                            <span className="font-eng">Puja Samagri</span>
                        )}

                    </h2>
                    <ul className={`list-inside text-[rgba(0,0,0,0.7)] ${fontSize} `}>
                        {language === "hi"
                            ? Array.isArray(detail.pujaSamagri?.hi)
                                ? detail.pujaSamagri.hi.map((item, i) => (
                                    <li key={`hi-${i}`} className="font-hindi">
                                        {HighlightNumbersPujaSamagiri(item)}
                                    </li>
                                ))
                                : detail.pujaSamagri?.hi
                                    ?.split(/\n|,/)
                                    .map((item, i) => (
                                        <li key={`hi-${i}`} className="font-hindi">
                                            {HighlightNumbersPujaSamagiri(item.trim())}
                                        </li>
                                    ))
                            : Array.isArray(detail.pujaSamagri?.en)
                                ? detail.pujaSamagri.en.map((item, i) => (
                                    <li key={`en-${i}`} className="font-eng">
                                        {item.replace(/,/g, ",")}
                                    </li>
                                ))
                                : detail.pujaSamagri?.en
                                    ?.split(/\n|,/)
                                    .map((item, i) => (
                                        <li key={`en-${i}`} className="font-eng">
                                            {item.trim().replace(/,/g, ",")}
                                        </li>
                                    ))}

                    </ul>


                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `} >
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl"> dFkk </span>
                        ) : (
                            <span className="font-eng">Katha</span>
                        )}

                    </h2>
                    {language === "hi"
                        ? <div className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize} break-words  w-full`} dangerouslySetInnerHTML={{
                            __html: detail.pujaMahatva?.hi.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/:/g, "ः")         // Replace colon with visarga
                                .replace(/ँ/g, "ं")          // Normalize chandrabindu if misencoded
                                .replace(/\u200D|\u200C/g, "  ").replace(/[.,;!?'"“”‘’]/g, " ")    // Remove English punctuation
                                .replace(/[\[\]{}()]/g, "")       // Remove brackets and parentheses
                                .replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ").replace(/[^\u0900-\u097F\s।॥]/g, "") // remove non-Devanagari chars except space & punctuation
                                .replace(/\u00A0/g, " ") // replace non-breaking space with normal space
                                .replace(/\u200B|\u200C|\u200D/g, " ") // remove zero-width chars
                                .replace(/\s+/g, " ").replace(/[०-९]/g, digit => hindiToEnglishMap[digit])// Remove zero-width joiners
                                .normalize("NFC")
                        }} />
                        : <div className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize} break-words w-full`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.en }} />
                    }
                </div>

                <div className="mt-4 w-full text-center">
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
