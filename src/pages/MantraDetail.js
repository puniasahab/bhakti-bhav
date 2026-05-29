import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { mantraApis } from "../api";

export default function MantraDetail() {
  const { id } = useParams();
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
        const json = await mantraApis.getMantraById("v3", id, language);
        setDetail(json.data || null);
      } catch (error) {
        console.error("API Error:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMantras();
  }, [id, language]);

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
      const currentLoopUrl = detail?.mantras?.find(m => (m._id || detail.mantras.indexOf(m)) === currentLoopMantra)?.audioUrl;
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
    localStorage.setItem('currentTrackName', `${detail.name} मंत्र`);
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
      localStorage.setItem('currentTrackName', `${detail.name} मंत्र`);
      
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
        titleHi={language === "hi" ? detail.name : ""}
        titleEn={language === "hi" ? "" : detail.name}
        customEngFontSize={"16px"}
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
            alt={detail.name || ""}
            className="max-w-[300px] max-h-[300px] rounded-xl shadow-lg"
          />
        </div>

        <div className="space-y-4">
          {detail.mantras
            ?.sort((a, b) => {
              const lengthA = a.text?.length || 0;
              const lengthB = b.text?.length || 0;
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
                    {(item.text || "")
                      .replace(/:/g, "ः")
                      .replace(/ँ/g, "ं")
                      .replace(/,/g, "]")
                      .replace(/\u200D|\u200C/g, " ")
                      .normalize("NFC")}
                  </p>

                  <div className="mt-8 mb-2 w-full flex items-center justify-center">
                    <button
                      onClick={() => {trackEvent(GA4Events.mantra_played, { event_label: "mantra_played_from_mantra_detail_page", mantraId }); handlePlay(item.audioUrl, mantraId)}}
                      disabled={!item.audioUrl}
                      className={`p-2 flex items-center justify-center rounded-full 
                      transition font-hindi 
                      ${!item.audioUrl
                          ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                          : currentTrack === item.audioUrl && isPlaying
                            ? "bg_theme text-white"
                            : "bg_theme text-white"
                        }`}
                    >
                      {currentTrack === item.audioUrl && isPlaying ? (
                        <span onClick={() => {trackEvent(GA4Events.audio_pause, { event_label: "audio_pause_from_mantra_detail_page", mantraId }); }} className="audio_pause_icon"></span>
                      ) : (
                        <span className="audio_icon"></span>
                      )}
                    </button>

                    <button
                      onClick={() => {trackEvent(GA4Events.mantra_loop_toggled, { event_label: "mantra_loop_toggled_from_mantra_detail_page", mantraId }); toggleLoop(mantraId, item.audioUrl)}}
                      disabled={!item.audioUrl}
                      className={`ml-3 p-2 flex items-center justify-center rounded-full transition font-hindi 
                      ${!item.audioUrl
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
