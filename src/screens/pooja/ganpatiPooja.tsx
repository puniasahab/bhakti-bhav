import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, ChevronLeft } from "lucide-react";

const GanpatiPooja: React.FC = () => {
  const poojaItems = [
    { image: "/img/deep.png", alt: "Diya" },
    { image: "/img/mandala.png", alt: "Mandala" },
    { image: "/img/sank.png", alt: "Conch" },
    { image: "/img/calendar.png", alt: "Calendar" },
    { image: "/img/sank.png", alt: "Diya" },
    { image: "/img/mandala.png", alt: "Mandala" },
    { image: "/img/sank.png", alt: "Conch" },
    { image: "/img/calendar.png", alt: "Calendar" }
  ];

  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-kruti text-white">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-2xl font-bold theme_text">
              <Link to="/" className="theme_text flex items-center justify-between">
                <ChevronLeft className="rupees_icon" size={24} color="#610419" />
                <span className="ml-3">श्री गणपति</span>
              </Link>
            </h1>
            <div className="flex items-center md:space-x-6 space-x-4 text-xl">
              <Link to="#">
                <img src="/img/music.png" alt="Music" width="42" height="42" className="max-w-full h-auto" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
            पूजा करे
            <span className="font-eng text-sm ml-2">(Pooja Kare)</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 relative">
        <div className="container mx-auto">
          <div className="mt-4">
            <p>
              <img 
                src="/img/shreeGanpatee.png" 
                alt="श्री गणपति" 
                width="350" 
                height="420"
                className="max-w-full h-auto mx-auto" 
              />
            </p>
            <div className="grid grid-cols-4 gap-6 p-3 mt-6 md:mt-3">
              {poojaItems.map((item, index) => (
                <Link
                  key={index}
                  to="#"
                  className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-yellow-200 to-orange-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out mx-auto"
                >
                  <img src={item.image} alt={item.alt} className="w-12 h-12" />
                </Link>
              ))}
            </div>
          </div>
        </div> 
      </main>

      {/* Footer */}
      <footer className="mt-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
          <div className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
            <Link to="/termsAndConditions" className="theme-text text-lg hover:underline">Terms & Conditions</Link>
            <Link to="/privacyPolicy" className="theme-text text-lg hover:underline">Privacy Policy</Link>
            <Link to="/aboutUs" className="theme-text text-lg hover:underline">About us</Link>
          </div>
          <div className="flex space-x-3">
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
              <img src="/img/whatssapp_icon.png" alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GanpatiPooja;
