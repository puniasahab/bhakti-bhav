import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function ChalisaDetail() {
  const { id } = useParams();
  const [chalisa, setChalisa] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, stop, isPlaying, currentTrack } = useAudio();

  useEffect(() => {
    async function fetchChalisa() {
      try {
        const res = await fetch(
          `https://api.bhaktibhav.app/frontend/chalisa/${id}`
        );
        const json = await res.json();

        if (json.status === "success" && json.data) {
          setChalisa(json.data);
          console.log("Fetched chalisa detail:", json.data);
        } else {
          setChalisa(null);
          alert("No data found!");
        }
      } catch (error) {
        console.error("API Error:", error);
        setChalisa(null);
      } finally {
        setLoading(false);
      }
    }

    fetchChalisa();
  }, [id]);

  const handlePlay = () => {
    const url = chalisa.audioUrl;
    if (!url) return;

    // Check if this chalisa is currently playing
    if (currentTrack === url && isPlaying) {
      pause();
    } else {
      // Store chalisa name in localStorage or you could modify the AudioContext to accept metadata
      localStorage.setItem('currentTrackName', `${chalisa.name?.hi || chalisa.name?.en}`);
      play(url);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
  if (!chalisa)
    return <p className="text-center py-10">❌ No chalisa found</p>;

  const jsonFile = {
    "share": {
      "hi": "'ks;j djsa",
      "en": "Share"
    },
    "listen": {
      "hi": "pkyhlk lqusa",
      "en": "Listen"
    },
    "pause": {
      "hi": "can djsa",
      "en": "Pause"
    },
    "player": {
      "hi": "चालीसा प्लेयर",
      "en": "Chalisa Player"
    }
  }

  // Direct sharing function using navigator.share only
  const handleNativeShare = async () => {
    try {
      const chalisaName = chalisa?.name?.hi || chalisa?.name?.en || "चालीसा";
      const currentUrl = window.location.href;
      
      // Create share message exactly like WallpaperDetail.js template
      const shareMessage = `🙏 ${chalisaName} - Beautiful चालीसा from Bhakti Bhav! 🙏

🌟 ${chalisaName} चालीसा 🌟

📖 Read/Listen चालीसा: ${currentUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual wallpapers, mantras, and devotional content!

🔗 App Link: https://play.google.com/store/apps/details?id=com.bhakti_bhav

🙏 Har Har Mahadev 🙏`;

      // Direct sharing using navigator.share - no clipboard fallbacks
      await navigator.share({
        title: `🙏 ${chalisaName} - चालीसा from Bhakti Bhav! 🙏`,
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
  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} hindiFontSize="true" />

      <PageTitleCard
        titleHi={chalisa.name.hi}
        titleEn={chalisa.name.en}
        customEngFontSize={'13px'}
        customFontSize={'18px'}
      />

      <div className="container mx-auto px-4 mt-4 pb-20">

        {chalisa.imageUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={
                chalisa.imageUrl.startsWith("http")
                  ? chalisa.imageUrl
                  : `https://api.bhaktibhav.app${chalisa.imageUrl}`
              }
              alt={chalisa.name?.hi || chalisa.name?.en}
              className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-xl shadow-lg"
            />
          </div>
        )}


        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">

            <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`} onClick={handleNativeShare}>
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
            </button>
          </div>

          <div className="mt-4">
            {chalisa.audioUrl && (
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${currentTrack === chalisa.audioUrl && isPlaying ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                  }`}
              >
                {currentTrack === chalisa.audioUrl && isPlaying ? (
                  <>
                    <span className="audio_pause_icon mr-2"></span> {language === "hi" ? jsonFile.pause.hi : jsonFile.pause.en}
                  </>
                ) : (
                  <>
                    <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.listen.hi : jsonFile.listen.en}
                  </>
                )}
              </button>
            )}
          </div>
        </div>


        <div className={`theme_text text-center leading-loose ${fontSize} ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ?
            <div dangerouslySetInnerHTML={{ __html: chalisa.text.hi.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%") }} />
            // chalisa.text.hi.split("\n").map((line, idx) => (
            //   <p key={idx}>{line.replace(/,/g, ']')}</p>
            // ))
            // : chalisa.text.en.split("\n").map((line, idx) => (
            //   <p key={idx}>{line}</p>
            // ))
            : <div dangerouslySetInnerHTML={{ __html: chalisa.text.en }} />
          }
        </div>

      </div>


    </>
  );
}
