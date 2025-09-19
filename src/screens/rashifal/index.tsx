import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

interface RashifalData {
  [key: string]: string;
}

const Rashifal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState({
    title: "",
    hindi: "",
    content: "",
    imgSrc: ""
  });

  const rashifalData: RashifalData = {
    Aquarius: "आज का दिन आपके लिए शुभ है। नए कार्यों में सफलता मिलेगी।",
    Pisces: "परिवार में खुशियों का माहौल रहेगा। स्वास्थ्य का ध्यान रखें।",
    Taurus: "धन लाभ के योग बन रहे हैं। मित्रों से सहयोग मिलेगा।",
    Gemini: "नए अवसर मिल सकते हैं। कार्यक्षेत्र में तरक्की होगी।",
    Aries: "आत्मविश्वास बढ़ेगा। संतान की ओर से सुखद समाचार मिलेगा।",
    Cancer: "पारिवारिक तनाव हो सकता है। धैर्य बनाए रखें।",
    Leo: "भाग्य का साथ मिलेगा। यात्रा के योग बन रहे हैं।",
    Virgo: "कार्यक्षेत्र में प्रगति होगी। स्वास्थ्य का ध्यान रखें।",
  };

  const rashiCards = [
    { title: "Aquarius", hindi: "कुंभ", image: "/img/Aquarius.png" },
    { title: "Pisces", hindi: "मीन", image: "/img/Pisces.png" },
    { title: "Taurus", hindi: "वृष", image: "/img/Taurus.png" },
    { title: "Gemini", hindi: "मिथुन", image: "/img/Gemini.png" },
    { title: "Aries", hindi: "मेष", image: "/img/Aries.png" },
    { title: "Cancer", hindi: "कर्क", image: "/img/Cancer.png" },
    { title: "Leo", hindi: "सिंह", image: "/img/Leo.png" },
    { title: "Virgo", hindi: "कन्या", image: "/img/Virgo.png" },
    { title: "Libra", hindi: "तुला", image: "/img/Leo.png" }
  ];

  const handleRashiClick = (rashi: typeof rashiCards[0]) => {
    console.log('Clicked rashi:', rashi); // Debug log
    setSelectedRashi({
      title: rashi.title,
      hindi: rashi.hindi,
      content: rashifalData[rashi.title] || "आज का राशिफ़ल उपलब्ध नहीं है।",
      imgSrc: rashi.image
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-kruti text-white">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-6">
            <h1 className="text-lg font-bold">
              <Link to="/" className="rupees_icon">
                <img src="/img/logo.png" alt="Logo" width="108" height="27" className="max-w-full h-auto" />
              </Link>
            </h1>
            <div className="flex items-center md:space-x-6 space-x-4 text-xl">
              <Link to="#" className="rupees_icon">
                <img src="/img/rupees_icon.png" alt="Rupees" width="22" height="20" className="max-w-full h-auto" />
              </Link>
              <Link to="#" className="notification_icon">
                <img src="/img/bell.png" alt="Notifications" width="24" height="21" className="max-w-full h-auto" />
              </Link>
              <Link to="#" className="icon_24">
                <img src="/img/hd_user_icon.png" alt="User" width="22" height="21" className="max-w-full h-auto" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
            आज का राशिफल
            <span className="font-eng text-sm ml-2">(Aaj Ka Rashifal)</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4">
        <div className="container mx-auto">
          <div className="mt-4">
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:py-6 py-3 text-center">
              {rashiCards.map((rashi, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleRashiClick(rashi)}
                    className="block w-full bg-[#610419] shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl hover:rounded-[10px] hover:scale-105 transition-all duration-300 ease-in-out"
                  >
                    <div className="w-full h-24 flex items-center justify-center">
                      <img
                        src={rashi.image}
                        alt={rashi.title}
                        className="h-full w-auto object-cover rounded-md"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-white font-eng">{rashi.title}</h2>
                      <p className="text-2xl rashi">{rashi.hindi}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-[80%] md:w-full mx-auto"
            onClick={closeModal}
          >
            <div
              className="bg-white text-gray-900 rounded-xl shadow-lg max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-4 text-center flex flex-col items-center">
                  <div className="mx-auto theme_bg bg-[#9A283D] rounded-md mb-4 p-4">
                    {selectedRashi.imgSrc ? (
                      <img
                        src={selectedRashi.imgSrc}
                        alt={selectedRashi.title}
                        className="mx-auto h-24 w-24 object-contain rounded-md"
                        onError={(e) => {
                          console.error('Image failed to load:', selectedRashi.imgSrc);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="mx-auto h-24 w-24 bg-gray-300 rounded-md flex items-center justify-center">
                        <span className="text-gray-600">No Image</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#610419] mb-0 font-eng">
                    {selectedRashi.title}
                  </h2>
                  <h2 className="text-2xl font-bold text-[#610419] mb-0 font-kruti">
                    {selectedRashi.hindi}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-center">
                  {selectedRashi.content}
                </p>
                <div className="mx-auto text-center mt-6">
                  <button
                    onClick={closeModal}
                    className="text-white text-md font-eng bg-[#9A283D] rounded-full mx-auto px-6 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default Rashifal;
