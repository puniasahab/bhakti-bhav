import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageContext } from "../contexts/LanguageContext";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function ChalisaDetail() {
  const { id } = useParams();
  const [chalisa, setChalisa] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { language, fontSize } = useContext(LanguageContext);

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
    
    // If audio player is already showing for this audio
    if (currentAudio === url && showAudioPlayer) {
      // Hide the audio player and stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        // Clear event listeners before setting to null
        audioRef.current.onloadedmetadata = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
        audioRef.current.onplay = null;
        audioRef.current = null;
      }
      setShowAudioPlayer(false);
      setCurrentAudio(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } else {
      // Show audio player and start playing
      if (audioRef.current) {
        audioRef.current.pause();
        // Clear existing event listeners
        audioRef.current.onloadedmetadata = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
        audioRef.current.onplay = null;
      }
      
      audioRef.current = new Audio(url);
      setCurrentAudio(url);
      setShowAudioPlayer(true);
      setIsPlaying(true);
      audioRef.current.play();

      // Audio event listeners
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };

      audioRef.current.onended = () => {
        // Auto-hide when audio completes
        setCurrentAudio(null);
        setShowAudioPlayer(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      };

      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };

      audioRef.current.onplay = () => {
        setIsPlaying(true);
      };
    }
  };

  const handlePlayerPlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCloseAudioPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Clear event listeners before setting to null
      audioRef.current.onloadedmetadata = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.onplay = null;
      audioRef.current = null;
    }
    setCurrentAudio(null);
    setShowAudioPlayer(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleSeek = (e) => {
    if (audioRef.current && duration > 0) {
      const seekTime = (e.target.value / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
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
      "hi": "can djsa" ,
      "en": "Pause"
    }
  }

  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} hindiFontSize="true" />

      <PageTitleCard
        titleHi={chalisa.name.hi}
        titleEn={chalisa.name.en}
        customEngFontSize={'13px'}
        customFontSize={'18px'}
      />

      <div className="container mx-auto px-4 mt-4">

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

            <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}>
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
            </button>
          </div>

          <div className="mt-4">
            {chalisa.audioUrl && (
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${
                  showAudioPlayer ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                }`}
              >
                {showAudioPlayer ? (
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

            <audio ref={audioRef} className="hidden">
              <source src={chalisa.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>

        {/* Audio Player Preview */}
        {showAudioPlayer && (
          <div className="flex justify-center mt-6 mb-6">
            <div className="bg-white border-2 border-[#9A283D] rounded-xl p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-hindi text-[#9A283D] font-semibold text-sm">pkyhlk प्लेयर</h3>
                <button 
                  onClick={handleCloseAudioPlayer}
                  className="text-[#9A283D] hover:text-red-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayerPlayPause}
                  className="bg-[#9A283D] text-white rounded-full p-3 hover:bg-[#7A1F2D] transition-colors duration-200 flex-shrink-0"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #9A283D 0%, #9A283D ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-eng">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        <div className={`theme_text text-center text-base leading-loose ${fontSize} ${language === "hi" ? "font-hindi" : "font-eng"}`}>
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
