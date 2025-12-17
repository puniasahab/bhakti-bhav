import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function MantraDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, isPlaying, currentTrack, audioRef } = useAudio();
  const [currentLoopMantra, setCurrentLoopMantra] = useState(null);

  useEffect(() => {
    async function fetchMantras() {
      try {
        const res = await fetch(`https://api.bhaktibhav.app/frontend/mantra/${id}`);
        const json = await res.json();
        setDetail(json.data || null);
      } catch (error) {
        console.error("API Error:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMantras();
  }, [id]);

  // Monitor audio state changes to clear loop when audio stops
  useEffect(() => {
    if (!isPlaying && currentLoopMantra) {
      setCurrentLoopMantra(null);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
    }
  }, [isPlaying, currentLoopMantra]);

  // Monitor track changes to clear loop when switching tracks
  useEffect(() => {
    if (currentTrack && currentLoopMantra) {
      const currentLoopUrl = detail?.mantras?.find(m => (m._id || detail.mantras.indexOf(m)) === currentLoopMantra)?.audioUrl?.hi;
      if (currentTrack !== currentLoopUrl) {
        setCurrentLoopMantra(null);
        if (audioRef.current) {
          audioRef.current.loop = false;
        }
      }
    }
  }, [currentTrack, currentLoopMantra, detail?.mantras]);

  const handlePlay = (url, mantraId) => {
    if (!url) return;
    
    if (currentTrack === url && isPlaying) {
      pause();
      setCurrentLoopMantra(null);
      if (audioRef.current) {
        audioRef.current.loop = false;
      }
      return;
    }
    
    if (currentTrack !== url) {
      setCurrentLoopMantra(null);
    }
    
    play(url);
    localStorage.setItem('currentTrackName', `${detail.name?.hi} मंत्र`);
  };

  const toggleLoop = (mantraId, audioUrl) => {
    if (!audioUrl) return;
    
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
      play(audioUrl);
      setCurrentLoopMantra(mantraId);
      localStorage.setItem('currentTrackName', `${detail.name?.hi} मंत्र`);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.loop = true;
        }
      }, 100);
    }
  };

  const replayAudio = (audioUrl, mantraId) => {
    if (currentTrack === audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        play(audioUrl);
      }
    } else {
      handlePlay(audioUrl, mantraId);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
  if (!detail) return <p className="text-center py-10">❌ No mantras found</p>;

  return (
    <div className="min-h-screen">
      <Header pageName={{ hi: "ea=", en: "Mantra" }} fontSizeOption="true" />
      <div className="h-2"></div>
      <PageTitleCard
        titleHi={detail.name.hi}
        titleEn={detail.name.en} 
        customEngFontSize={"13px"}
        customFontSize={"19px"}
      /> 

      <div className="container mx-auto px-4">
        <div className="flex justify-center my-6">
          <img
            src={
              detail.imageUrl?.startsWith("http")
                ? detail.imageUrl
                : `https://api.bhaktibhav.app${detail.imageUrl}`
            }
            alt={detail.name?.hi || detail.name?.en}
            className="max-w-[300px] max-h-[300px] rounded-xl shadow-lg"
          />
        </div>

        <div className="space-y-4">
          {detail.mantras
            ?.sort((a, b) => {
              const lengthA = a.text?.hi?.length || 0;
              const lengthB = b.text?.hi?.length || 0;
              return lengthA - lengthB;
            })
            ?.map((item, index) => {
              const mantraId = item._id || index;
              const isCurrentlyLooping = currentLoopMantra === mantraId;
              
              return (
                <div
                  key={mantraId}
                  className="bg-[#FFD35A] text-center p-4 rounded-lg shadow relative"
                >
                  <p
                    className={`theme_text text-[21px] font-semibold font-hindi ${fontSize}`}
                  >
                    {item.text?.hi
                      .replace(/:/g, "ः")
                      .replace(/ँ/g, "ं")
                      .replace(/,/g, "]")
                      .replace(/\u200D|\u200C/g, " ")
                      .normalize("NFC")}
                  </p>

                  <div className="mt-8 mb-2 w-full flex items-center justify-center">
                    <button
                      onClick={() => handlePlay(item.audioUrl?.hi, mantraId)}
                      disabled={!item.audioUrl?.hi}
                      className={`p-2 flex items-center justify-center rounded-full 
                      transition font-hindi 
                      ${!item.audioUrl?.hi
                          ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                          : currentTrack === item.audioUrl?.hi && isPlaying
                            ? "bg_theme text-white"
                            : "bg_theme text-white"
                        }`}
                    >
                      {currentTrack === item.audioUrl?.hi && isPlaying ? (
                        <span className="audio_pause_icon"></span>
                      ) : (
                        <span className="audio_icon"></span>
                      )}
                    </button>

                    <button
                      onClick={() => toggleLoop(mantraId, item.audioUrl?.hi)}
                      disabled={!item.audioUrl?.hi}
                      className={`ml-3 p-2 flex items-center justify-center rounded-full transition font-hindi 
                      ${!item.audioUrl?.hi
                          ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                          : isCurrentlyLooping
                            ? "bg-green-600 text-white"
                            : "bg_theme text-white"
                        }`}
                    >
                      <span className="audio_repeat_icon"></span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
