import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { LanguageContext } from "../contexts/LanguageContext";
import Header from "../components/Header";

export default function MantraDetail() {
  const { id } = useParams();
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, fontSize, setLanguage, setFontSize} = useContext(LanguageContext); // ✅ use context
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchMantras() {
      try {
        const res = await fetch(`https://api.bhaktibhav.app/frontend/mantra/${id}`);
        const json = await res.json();
        setMantras(json.data || []);
      } catch (error) {
        console.error("API Error:", error);
        setMantras([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMantras();
  }, [id]);

  const handlePlay = (url) => {
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

  if (loading) return <p className="text-center py-10">⏳ Loading...</p>;
  if (!mantras.length) return <p className="text-center py-10">❌ No mantras found</p>;

  return (
    <div className="min-h-screen bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat">
      
      <Header />

      <div className="container mx-auto px-4 py-6">
         
        <div className="flex justify-center mb-6">
          <img
              src={
                mantras.image.startsWith("http")
                  ? mantras.image
                  : `https://api.bhaktibhav.app${mantras.image}`
              }
              alt={mantras.name?.hi || mantras.name?.en}
               className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
            />
        </div>
 
        <div className="space-y-4">
          {mantras.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-[#FFD35A] text-center p-4 rounded-lg shadow relative"
            >
              <p className={`${fontSize} text-[#5a001d] font-semibold ${language === "hi" ? "font-hindi" : "font-eng"}`}>
                {language === "hi" ? item.text?.hi : item.text?.en}
              </p>
 
              <button
                onClick={() => handlePlay(item.audioUrl)}
                className={`absolute bottom-2 right-2 p-2 rounded-full transition ${
                  currentAudio === item.audioUrl
                    ? "bg-red-600 text-white"
                    : "bg-[#610419] text-white hover:bg-[#7a0028]"
                }`}
              >
                {currentAudio === item.audioUrl ? "⏸" : "▶"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
