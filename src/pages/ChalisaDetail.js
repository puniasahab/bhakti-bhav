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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!chalisa)
    return <p className="text-center py-10">❌ No chalisa found</p>;

  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} hindiFontSize="true" />

      <PageTitleCard
        titleHi={chalisa.name.hi}
        titleEn={chalisa.name.en}
        customEngFontSize={'14px'}
        customFontSize={'20px'}
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

            <button className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center font-hindi">
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> 'ks;j djsa
            </button>
          </div>

          <div className="mt-4">
            {chalisa.audioUrl && (
              <button
                onClick={handlePlay}
                className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center"
              >
                <span className="audio_icon mr-2"></span> pkyhlk lqusa
              </button>
            )}

            <audio ref={audioRef} className="hidden">
              <source src={chalisa.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>



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
