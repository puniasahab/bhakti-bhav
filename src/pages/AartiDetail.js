import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import PageTitleCard from "../components/PageTitleCard";

function AartiDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);

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
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail)
    return <p className="text-center py-10 theme_text">❌ No data found!</p>;

  return (
    <>
      <Header pageName={{ hi: "vkjrh", en: "Aarti" }} hindiFontSize="true" />
      <PageTitleCard
        titleHi={"vkjrh"}
        titleEn={"Aarti"} 
        
      />
      <div className="container mx-auto px-4"> 
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

            <button className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center font-hindi">
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> 'ks;j djsa
            </button>
          </div>

          <div className="mt-4">
            {detail.audioUrl && (
              <button
                onClick={handlePlay}
                className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center"
              >
                <span className="audio_icon mr-2"></span> vkjrh lqusa
              </button>
            )}

            <audio ref={audioRef} className="hidden">
              <source src={detail.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
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

        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">
            {detail.audioUrl && (
              <button
                onClick={handlePlay}
                className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center"
              >
                <span className="audio_icon mr-2"></span> vkjrh lqusa
              </button>
            )}

            <audio ref={audioRef} className="hidden">
              <source src={detail.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
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
