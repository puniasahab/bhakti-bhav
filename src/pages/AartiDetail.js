import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageContext } from "../contexts/LanguageContext";

function AartiDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const { language, fontSize } = useContext(LanguageContext);

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

  if (loading)
    return <p className="text-center py-10 theme_text">⏳ Loading...</p>;
  if (!detail)
    return <p className="text-center py-10 theme_text">❌ No data found!</p>;

  return (
    <>
      <Header />



      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center mb-3">
          <p
            className={`mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md ${fontSize}`}
          >
            {language === "hi" ? detail.name?.hi : detail.name?.en}
            <span className="font-eng text-sm ml-2">
              ({language === "hi" ? detail.name?.en : detail.name?.hi})
            </span>
          </p>
        </div>
 
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


          <div className={`theme_text text-base leading-loose mt-4 text-center ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ? detail.description?.hi.split("\n").map((line, idx) => (
              <p key={idx}>{line.replace(/,/g, ']')}</p>
            ))
            : detail.description?.en.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))
          }
        </div>

 
        <div className="mt-4 text-center">
          <p
            className={`theme_text ${language === "hi" ? fontSize : `italic font-eng ${fontSize}`}`}
          >
            {language === "hi" ? detail.description?.hi : detail.description?.en}
          </p>
        </div>

        {/* Audio */}
        {detail.audioUrl && (
          <div className="mt-6 flex justify-center">
            <audio controls className="w-full max-w-md">
              <source src={detail.audioUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

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

      <Footer />
    </>
  );
}

export default AartiDetail;
