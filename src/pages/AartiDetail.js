import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import PageTitleCard from "../components/PageTitleCard";

function AartiDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
  const { play, pause, stop, isPlaying, currentTrack } = useAudio();

  useEffect(() => {
    fetch(`https://api.bhaktibhav.app/frontend/arti/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === "success" && data.data) {
          setDetail(data.data);
          console.log("Fetched aarti detail:", data.data);
        } else {
          setDetail(null);
          alert("No data found!");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);


  const handlePlay = () => {
    const url = detail.audioUrl?.startsWith("http")
      ? detail.audioUrl
      : `https://api.bhaktibhav.app${detail.audioUrl}`;
    
    if (!url) return;
    
    // Check if this aarti is currently playing
    if (currentTrack === url && isPlaying) {
      pause();
    } else {
      // Store aarti name for the global player
      localStorage.setItem('currentTrackName', detail.name?.hi || detail.name?.en || 'आरती');
      play(url);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail)
    return <p className="text-center py-10 theme_text">❌ No data found!</p>;

  const jsonFile = {
    "share": {
      "hi": "'ks;j djsa",
      "en": "Share"
    },
    "listen": {
      "hi": "vkjrh lqusa",
      "en": "Listen"
    },
    "pause": {
      "hi": "can djsa" ,
      "en": "Pause"
    },
    "player": {
      "hi": "आरती प्लेयर",
      "en": "Aarti Player"
    }
  }
  const shareText = `🌸 ${detail.name?.en || "Aarti"} 🌸\n\n${detail.text?.hi || ""}\n\nListen here: ${window.location.href}`;
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${detail.name?.en || "Aarti"}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <>
      <Header pageName={{ hi: "vkjrh", en: "Aarti" }} hindiFontSize="true" />
      <PageTitleCard
        titleHi={detail.name.hi}
        titleEn={detail.name.en} 
        customEngFontSize={"13px"}
        customFontSize={"19px"}
        
      />
      <div className="container mx-auto px-4 pb-20"> 
        {detail.imageUrl && (
          <img
            src={
              detail.imageUrl.startsWith("http")
                ? detail.imageUrl
                : `https://api.bhaktibhav.app${detail.imageUrl}`
            }
            alt={detail.name?.en || "Aarti Image"}
            className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
          />
        )}

        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">

            <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}
            onClick={handleNativeShare}
            >
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
            </button>
          </div>

          <div className="mt-4">
            {detail.audioUrl && (
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${
                  currentTrack === (detail.audioUrl?.startsWith("http") ? detail.audioUrl : `https://api.bhaktibhav.app${detail.audioUrl}`) && isPlaying ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                }`}
              >
                {currentTrack === (detail.audioUrl?.startsWith("http") ? detail.audioUrl : `https://api.bhaktibhav.app${detail.audioUrl}`) && isPlaying ? (
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

        <div className={`theme_text leading-loose mt-4 text-center ${fontSize}  ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ? 
            <div dangerouslySetInnerHTML={{ __html: detail.description?.hi.replace(/\.\.\./g, "---").replace(/,/g, "]") }} /> 
            :  
            <div dangerouslySetInnerHTML={{ __html: detail.description?.en }} />
          }
        </div>

        {/* Text */}
        {detail.text && (
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg shadow max-w-2xl mx-auto">
            <pre
              className={`whitespace-pre-wrap leading-relaxed ${language === "hi" ? `font-hindi ${fontSize}` : `italic font-eng ${fontSize}`}`}
            >
              {language === "hi" ? detail.text.hi : detail.text.en}
            </pre>
          </div>
        )}


      </div>

      
    </>
  );
}

export default AartiDetail;
