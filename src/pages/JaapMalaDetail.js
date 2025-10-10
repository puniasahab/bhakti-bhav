import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { LanguageContext } from "../contexts/LanguageContext";
import Loader from "../components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageTitleCard from "../components/PageTitleCard";
import PageTitleCardJaapMala from "../components/PageTitleCardJaapMala";

function JaapMalaDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize, setLanguage, setFontSize } = useContext(LanguageContext);
  const [currentIndex, setCurrentIndex] = useState(1);

  // Function to convert Hindi numerals to English numerals
  // const convertHindiToEnglishNumerals = (text) => {
  //   if (!text) return text;
  //   const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  //   const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
  //   let convertedText = text;
  //   hindiNumerals.forEach((hindi, index) => {
  //     convertedText = convertedText.replace(new RegExp(hindi, 'g'), englishNumerals[index]);
  //   });
  //   return convertedText;
  // };

  useEffect(() => {
    fetch(`https://api.bhaktibhav.app/frontend/jaapmala/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        setDetail(data.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail) return <p className="text-center mt-10">No data found!</p>;

  return (
    <>
      <Header pageName={{ hi: "tki ekyk", en: "Jaap mala" }} />

      <PageTitleCardJaapMala
        titleHi={detail.title.hi}
        titleEn={detail.title.en}
        customEngFontSize={"13px"}
        customFontSize={"15px"}
        isFromJaapMala={true}
      />

      <div className="container mx-auto px-4 relative">
        
        {/* Count Display */}
        <div className="text-center mb-4 mt-4">
          <span className="bg-[rgba(255,250,244,0.8)] px-4 py-2 rounded-full theme_text font-semibold text-sm font-eng">
            {currentIndex} / {detail?.names?.length || 0}
          </span>
        </div>

        <Swiper
          pagination={{ clickable: true }}
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          spaceBetween={20}
          slidesPerView={1}
          className="mySwiper"
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex + 1)}
        >
          {detail?.names &&
            detail.names.map((item, index) => (
              <SwiperSlide key={item.id || index}>
                <div className="flex flex-col items-center justify-center px-4">
                  <div
                    className="relative w-[95%] max-w-md px-6 py-[150px] text-center jaapmala_bg" >
                    <p className="text-[20px] font-bold text-red-900 mb-2">
                      {item.name.hi}
                    </p>
                  </div>

                  <div className="mt-6 text-center max-w-md">
                    <p className="text-2xl font-semibold theme_text mb-4">अर्थ%</p>
                    <p className="text-lg md:text-lg text-gray-700">
                      {item.meaning.hi}
                    </p>
                    <p className="text-lg text-gray-500 font-eng">
                      {item.meaning.en}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>

        <div className="swiper-button-prev absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-full p-2 shadow z-20">
          <ChevronLeft className="theme_text" />
        </div>
        <div className="swiper-button-next absolute top-1/2 right-2 -translate-y-1/2 bg-white rounded-full p-2 shadow z-20">
          <ChevronRight className="theme_text" />
        </div>
      </div>
      
    </>
  );
}

export default JaapMalaDetail;
