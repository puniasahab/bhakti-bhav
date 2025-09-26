import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { LanguageContext } from "../contexts/LanguageContext";

function JaapMalaDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize, setLanguage, setFontSize } = useContext(LanguageContext);
  const [currentIndex, setCurrentIndex] = useState(1);

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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!detail) return <p className="text-center mt-10">No data found!</p>;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 relative">
        <div className="flex justify-center items-center mb-3">
          <p
            className={`mb-0 text-xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md ${fontSize}`}
          >
            {language === "hi" ? detail.title.hi : detail.title.en}
            <span className="font-eng text-sm ml-2">
              ({language === "hi" ? detail.title.en : detail.title.hi})
            </span>
          </p>
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
        >
          {detail?.names &&
            detail.names.map((item, index) => (
              <SwiperSlide key={item.id || index}>
                <div className="flex flex-col items-center justify-center px-4">
                  <div
                    className="relative w-[95%] max-w-md px-6 py-[150px] text-center jaapmala_bg" >
                    <p className="text-3xl font-bold text-red-900 mb-2">
                      {item.name.hi}
                    </p>
                  </div>

                  <div className="mt-6 text-center max-w-md">
                    <p className="text-2xl font-semibold theme_text">अर्थ%</p>
                    <p className="text-lg md:text-lg text-gray-700">
                      {item.meaning.hi}
                    </p>
                    <p className="text-lg text-gray-500 mt-1 font-eng">
                      {item.meaning.en}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
        <div className="swiper-button-prev !text-white !w-10 !h-10 !bg-[#9A283D] !rounded-full shadow flex items-center justify-center 
absolute top-1/2 left-2 -translate-y-1/2 z-10"></div>

<div className="swiper-button-next !text-white !w-10 !h-10 !bg-[#9A283D] !rounded-full shadow flex items-center justify-center 
absolute top-1/2 right-2 -translate-y-1/2 z-10"></div>
      </div>
      <Footer />
    </>
  );
}

export default JaapMalaDetail;
