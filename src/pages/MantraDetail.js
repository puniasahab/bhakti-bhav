import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function MantraDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null); // store object, not array
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);

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

  const handlePlay = (url) => {
    if (!url) return; // no audio available
    if (currentAudio === url) {
      audioRef.current.pause();
      setCurrentAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setCurrentAudio(url);

      audioRef.current.onended = () => {
        setCurrentAudio(null);
      };
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail) return <p className="text-center py-10">❌ No mantras found</p>;

  return (
    <div className="min-h-screen">
      <Header pageName={{ hi: "ea=", en: "Mantra" }} fontSizeOption="true" />
      <PageTitleCard
        titleHi={"ea="}
        titleEn={"Mantra"} 
        textSize="text-lg"
      /> 

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center mb-6">
          <img
            src={
              detail.imageUrl?.startsWith("http")
                ? detail.imageUrl
                : `https://api.bhaktibhav.app${detail.imageUrl}`
            }
            alt={detail.name?.hi || detail.name?.en}
            className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-xl shadow-lg"
          />
        </div>

        <div className="space-y-4">
          {detail.mantras?.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-[#FFD35A] text-center p-4 rounded-lg shadow relative"
            >
              <p
                className={`theme_text text-[24px] font-semibold font-hindi ${fontSize}
                  }`}
              >
                {item.text?.hi}
              </p>

              <div className="mt-4 w-full flex items-center justify-center">
                <button
                  onClick={() => handlePlay(item.audioUrl?.hi)}
                  disabled={!item.audioUrl?.hi}
                  className={`p-2 flex items-center justify-center rounded-full 
                    transition font-hindi 
                    ${!item.audioUrl?.hi
                      ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                      : currentAudio === item.audioUrl?.hi
                        ? "bg_theme text-white"
                        : "bg_theme text-white"
                    }`}
                >
                  {currentAudio === item.audioUrl?.hi ? (
                    <span className="audio_pause_icon"></span>
                  ) : (
                    <span className="audio_icon"></span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.loop = !audioRef.current.loop;
                    }
                  }}
                  disabled={!item.audioUrl?.hi}
                  className={`ml-3 p-2 flex items-center justify-center rounded-full transition font-hindi 
                    ${!item.audioUrl?.hi
                      ? "bg-[#9A283D]/50 text-gray-500 cursor-not-allowed"
                      : audioRef.current?.loop
                        ? "bg-green-600 text-white"
                        : "bg_theme text-white"
                    }`}
                >
                  <span className="audio_repeat_icon"></span>
                </button>

                {item.audioUrl?.hi && (
                  <audio ref={audioRef} className="hidden">
                    <source src={item.audioUrl.hi} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
