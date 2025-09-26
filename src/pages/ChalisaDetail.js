import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageContext } from "../contexts/LanguageContext";

export default function ChalisaDetail() {
  const { id } = useParams();
  const [chalisa, setChalisa] = useState(null); // single object
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

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
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  if (loading)
    return <p className="text-center py-10 theme_text">⏳ Loading...</p>;
  if (!chalisa)
    return <p className="text-center py-10">❌ No chalisa found</p>;

  return (
    <>
      <Header />
 
      <div className="flex justify-center items-center mb-3">
        <p
          className={`mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md ${fontSize}`}
        >
          {language === "hi" ? chalisa.name.hi : chalisa.name.en}
          <span className="font-eng text-sm ml-2">
            ({language === "hi" ? chalisa.name.en : chalisa.name.hi})
          </span>
        </p>
      </div>
 
      <div className="container mx-auto px-4 mt-4"> 
        
        {chalisa.imageUrl && (
          <div className="w-full h-64 flex items-center justify-center mb-4">
            <img
              src={
                chalisa.imageUrl.startsWith("http")
                  ? chalisa.imageUrl
                  : `https://api.bhaktibhav.app${chalisa.imageUrl}`
              }
              alt={chalisa.name?.hi || chalisa.name?.en}
               className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
            />
          </div>
        )}
        

        <div className="mt-4"> 
          {chalisa.audioUrl && (
            <button
              onClick={handlePlay}
              className="px-4 py-2 theme_bg text-white rounded hover:bg-orange-600 transition"
            >
              <span className="audio_icon"></span> Chalisa Sune
            </button>
          )}

          <audio ref={audioRef} className="hidden">
            <source src={chalisa.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className={`theme_text text-base leading-loose ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ? chalisa.text.hi.split("\n").map((line, idx) => (
              <p key={idx}>{line.replace(/,/g, ']')}</p>
            ))
            : chalisa.text.en.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))
          }
        </div>
 
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={chalisa.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        {/* )} */}
      </div>

      <Footer />
    </>
  );
}
