import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function MantraDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null); // store object, not array
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, isPlaying, currentTrack, audioRef } = useAudio();
  const [loopStates, setLoopStates] = useState({});

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

  const handlePlay = (url, mantraId) => {
    if (!url) return; // no audio available
    
    // If the same audio is playing, pause it
    if (currentTrack === url && isPlaying) {
      pause();
      return;
    }
    
    // Play the new audio using global audio context
    play(url);
    localStorage.setItem('currentTrackName', `${detail.name?.hi} मंत्र`);

    // Set loop state if enabled for this mantra
    if (audioRef.current && loopStates[mantraId]) {
      audioRef.current.loop = true;
    }
  };

  const toggleLoop = (mantraId, audioUrl) => {
    if (!audioUrl) return;
    
    const newLoopState = !loopStates[mantraId];
    setLoopStates(prev => ({
      ...prev,
      [mantraId]: newLoopState
    }));
    
    // If this is the currently playing audio, update its loop property immediately
    if (currentTrack === audioUrl && audioRef.current) {
      audioRef.current.loop = newLoopState;
    }
  };

  const replayAudio = (audioUrl, mantraId) => {
    if (currentTrack === audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        play(audioUrl);
      }
    } else {
      // If not currently playing, start playing
      handlePlay(audioUrl, mantraId);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
  if (!detail) return <p className="text-center py-10">❌ No mantras found</p>;

  return (
    <div className="min-h-screen">
      <Header pageName={{ hi: "ea=", en: "Mantra" }} fontSizeOption="true" />
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
              return lengthA - lengthB; // Sort by ascending order (shortest first)
              // Use: return lengthB - lengthA; // For descending order (longest first)
            })
            ?.map((item, index) => (
              <div
                key={item._id || index}
                className="bg-[#FFD35A] text-center p-4 rounded-lg shadow relative"
              >
                <p
                  className={`theme_text text-[21px] font-semibold font-hindi ${fontSize}
                  }`}
                >
                  {item.text?.hi
                    .replace(/:/g, "ः")         // Replace colon with visarga
                    .replace(/ँ/g, "ं")          // Normalize chandrabindu if misencoded
                    .replace(/\u200D|\u200C/g, " ") // Remove zero-width joiners
                    .normalize("NFC")}
                </p>

                <div className="mt-8 mb-2 w-full flex items-center justify-center">
                  <button
                    onClick={() => handlePlay(item.audioUrl?.hi, item._id || index)}
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
                    onClick={() => toggleLoop(item._id || index, item.audioUrl?.hi)}
                    disabled={!item.audioUrl?.hi}
                    className={`ml-3 p-2 flex items-center justify-center rounded-full transition font-hindi 
                    ${!item.audioUrl?.hi
                        ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                        : loopStates[item._id || index]
                          ? "bg-green-600 text-white"
                          : "bg_theme text-white"
                      }`}
                  >
                    <span className="audio_repeat_icon"></span>
                  </button>

                  {/* <button
                    onClick={() => replayAudio(item.audioUrl?.hi, item._id || index)}
                    disabled={!item.audioUrl?.hi}
                    className={`ml-3 p-2 flex items-center justify-center rounded-full transition font-hindi 
                    ${!item.audioUrl?.hi
                        ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                        : "bg_theme text-white"
                      }`}
                  >
                    <span className="audio_restart_icon">↻</span>
                  </button> */}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
