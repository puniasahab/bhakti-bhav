import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { CalendarFold, BookOpenText, Facebook, Instagram } from 'lucide-react';

// Import Swiper styles
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';

const Home: React.FC = () => {
  useEffect(() => {
    // Load external scripts if needed
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div 
      className="bg-cover bg-top bg-no-repeat min-h-screen w-full text-white"
      style={{ 
        backgroundImage: "url('/img/page_bg.jpg')",
        fontFamily: "'KrutiDev', sans-serif"
      }}
    >
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-6">
            <h1 className="text-lg font-bold">
              <Link to="/" className="rupees_icon">
                <img 
                  src="/img/logo.png" 
                  alt="Logo" 
                  width="108" 
                  height="27" 
                  className="max-w-full h-auto" 
                />
              </Link>
            </h1>
            {/* <div className="flex items-center md:space-x-6 space-x-4 text-xl">
              <Link to="#" className="rupees_icon">
                <img 
                  src="/img/rupees_icon.png" 
                  alt="Rupees" 
                  width="22" 
                  height="20" 
                  className="max-w-full h-auto" 
                />
              </Link>
              <Link to="#" className="notification_icon">
                <img 
                  src="/img/bell.png" 
                  alt="Notifications" 
                  width="24" 
                  height="21" 
                  className="max-w-full h-auto" 
                />
              </Link>
              <Link to="#" className="icon_24">
                <img 
                  src="/img/hd_user_icon.png" 
                  alt="User" 
                  width="22" 
                  height="21" 
                  className="max-w-full h-auto" 
                />
              </Link>
            </div> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="container mx-auto">
          {/* Hero Slider */}
          <section className="bg-[#FFFAF4] rounded-xl text-sm space-y-1 shadow-md">
            <div className="relative w-full h-[30vh] md:h-[60vh] overflow-hidden">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop={false}
                className="w-full h-full"
              >
                <SwiperSlide 
                  className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: "url('/img/slide-1.jpg')" }}
                >
                  {/* <h1 className="theme-text text-3xl font-kruti">vk'kk cgqr egku gS</h1> */}
                </SwiperSlide>
                <SwiperSlide 
                  className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: "url('/img/slide-2.jpg')" }}
                >
                  {/* No text for this slide */}
                </SwiperSlide>
                {/* <SwiperSlide 
                  className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: "url('/img/slide-3.jpg')" }}
                >
                  <h1 className="theme-text text-2xl font-kruti">izse ,oa Hkkouk thou ds pkjks dh nkfguh gS</h1>
                </SwiperSlide> */}
              </Swiper>
            </div>
          </section>

          {/* Button Row */}
          <div className="mt-4 flex flex-row space-x-3">
            <Link 
              to="#"
              className="bg-[#610419] flex items-center justify-center w-1/2 rounded-[10px] font-semibold md:text-3xl text-lg text-white"
            >
              <img src="/img/vichar_icon.png" alt="" width="24" height="24" className="mr-3" />
              <p className="md:text-2xl text-sm text-white font-normal">आज का राशिफल</p>
            </Link>
            <img 
              src="/img/calendar.png" 
              alt="Calendar" 
              style={{
                width: 'calc(50%)',
                height: 'auto',
                minHeight: '48px',
                maxWidth: '48vw',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-center font-medium">
            <Link to="#">
              <div className="theme_bg rounded-xl p-4 md:text-2xl text-sm">
                <CalendarFold className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto mb-2" />
                <p>हिंदी कैलेंडर
</p>
              </div>
            </Link>
            <Link to="#">
              <div className="theme_bg rounded-xl p-4 md:text-2xl text-sm">
                <BookOpenText className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto mb-2" />
                 {/* <img src="/img/kumbhKalash.png" alt="" width="24" height="24" className="mr-3" /> */}
                <p>कथा</p>
              </div>
            </Link>
            <Link to="#">
              <div className="theme_bg rounded-xl p-4 md:text-2xl text-sm">
                {/* <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-6 h-6 md:w-8 md:h-8 text-white mx-auto mb-2"
                  viewBox="0 0 36 36" 
                  fill="none"
                >
                  <mask id="mask0_1_210" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" fill="url(#pattern0_1_210)" />
                  </mask>
                  <g mask="url(#mask0_1_210)">
                    <circle cx="18" cy="19" r="17" fill="url(#paint0_linear_1_210)" />
                  </g>
                  <defs>
                    <pattern id="pattern0_1_210" patternContentUnits="objectBoundingBox" width="1" height="1">
                      <use xlinkHref="#image0_1_210" transform="scale(0.00195312)" />
                    </pattern>
                    <linearGradient id="paint0_linear_1_210" x1="18" y1="2" x2="18" y2="36" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F5A418" />
                      <stop offset="1" stopColor="#F12B11" />
                    </linearGradient>
                  </defs>
                </svg> */}
                <div style={{display: 'flex', justifyContent: 'center'}}>
                 <img src="/img/jaap_mala.svg" alt="" className="mr-3 w-6 h-6 md:w-8 md:h-8 mb-2" />
             </div>
                <p>जाप माला</p>
              </div>
            </Link>
          </div>

          {/* Wallpaper Section */}
          <div className="mt-6 bg-[#610419] text-white rounded-xl p-4">
            <Link 
              to=""
              className="relative flex items-center justify-center rounded-xl font-semibold overflow-hidden px-12 py-6"
            >
              <span className="relative z-10 flex items-center">
                {/* <Images className="w-6 h-6 md:w-8 md:h-8 mr-3" /> */}
                <img src="/img/wall_paper.png" alt="Wallpaper" width="24" height="24" className="mr-3" />
                <span className="text-2xl text-white font-normal">वॉलपेपर</span>
              </span>
            </Link>
          </div>

          {/* Quote and Puja Section */}
          <div className="mt-6 flex gap-4">
            <div className="basis-[70%] bg-orange-100 text-orange-900 rounded-xl p-4 text-center text-sm shadow-md">
              <h2 className="mb-2 font-bold text-3xl">आज का सुविचार</h2>
              <div>
                <img 
                  src="/img/vichhar_bg.png" 
                  alt="" 
                  width="240" 
                  height="40" 
                  className="max-w-full h-auto mx-auto" 
                />
              </div>
              <p className="text-2xl">उपदेश देना सरल है, पर उपाय बताना कठिन|</p>
              <p className="mt-1 text-lg">~ रवीन्द्रनाथ टैगोर</p>

              {/* <div className="flex justify-center space-x-4 mt-4 text-xl">
                <Link to="#">
                  <img 
                    src="/img/hd_share_icon.png" 
                    alt="Share" 
                    width="24" 
                    height="24"
                    className="max-w-full h-auto mx-auto" 
                  />
                </Link>
                <Link to="#">
                  <img 
                    src="/img/hd_whatsapp_icon.png" 
                    alt="WhatsApp" 
                    width="24" 
                    height="24"
                    className="max-w-full h-auto mx-auto" 
                  />
                </Link>
                <Link to="#">
                  <img 
                    src="/img/hd_adobe_icon.png" 
                    alt="Adobe" 
                    width="24" 
                    height="24"
                    className="max-w-full h-auto mx-auto" 
                  />
                </Link>
              </div> */}
            </div>

            <div className="basis-[30%] flex flex-col justify-between items-center md:p-4 theme_text">
              <span className="font-semibold md:text-3xl text-2xl">पूजा करें!</span>
              <div>
                <img 
                  src="/img/puja_bg.png" 
                  alt="Puja" 
                  width="120" 
                  height="116" 
                  className="max-w-full h-auto" 
                />
              </div>
              {/* <button className="bg-[#6d001f] text-white px-6 py-2 rounded-[10px] font-eng md:text-lg text-sm">
                Click here
              </button> */}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
          <div className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
            <Link to="/termsAndConditions" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              Terms & Conditions
            </Link>
            <Link to="/privacyPolicy" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              Privacy Policy
            </Link>
            <Link to="/aboutUs" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              About us
            </Link>
          </div>

          {/* <div className="flex space-x-3">
            <Link 
              to="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]"
            >
              <Facebook className="w-5 h-5" />
            </Link>
            <Link 
              to="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]"
            >
              <Instagram className="w-5 h-5" />
            </Link>
            <Link 
              to="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]"
            >
              <img 
                src="/img/whatssapp_icon.png" 
                alt="WhatsApp" 
                width="20" 
                height="20" 
                className="max-w-full h-auto" 
              />
            </Link>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default Home;
