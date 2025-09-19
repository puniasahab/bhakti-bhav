import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, ChevronLeft } from "lucide-react";

const Ikadashi: React.FC = () => {
  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-kruti text-white">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-3">
            <h1 className="text-2xl font-bold theme_text">
              <Link to="/" className="theme_text flex items-center justify-between">
                <ChevronLeft className="rupees_icon" size={24} color="#610419" />
                <span className="ml-2">पुत्रदा एकादशी</span>
              </Link>
            </h1>
            <div className="flex items-center md:space-x-6 space-x-4 text-xl">
              <div className="flex items-center space-x-2 md:space-x-6 text-xl">
                <Link
                  to="#"
                  className="flex items-center justify-center md:w-12 md:h-12 w-8 h-8 border border-[#6b1a1a] rounded-md text-[#6b1a1a] font-semibold"
                >
                  हिं
                </Link>
                <Link
                  to="#"
                  className="flex items-center justify-center md:w-12 md:h-12 w-8 h-8 border border-[#6b1a1a] rounded-md text-[#6b1a1a] font-semibold font-eng"
                >
                  A-
                </Link>
                <Link
                  to="#"
                  className="flex items-center justify-center md:w-12 md:h-12 w-8 h-8 border border-[#6b1a1a] rounded-md text-[#6b1a1a] font-semibold font-eng"
                >
                  A
                </Link>
                <Link
                  to="#"
                  className="flex items-center justify-center md:w-12 md:h-12 w-8 h-8 border border-[#6b1a1a] rounded-md text-[#6b1a1a] font-semibold font-eng"
                >
                  A+
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
            पुत्रदा एकादशी
            <span className="font-eng text-sm ml-2">(Pootrada ekadashi)</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4">
        <div className="container mx-auto">
          <div className="mt-4">
            <div className="flex items-center justify-center text-2xl theme_text">
              <div className="w-1/2 text-center">
                तिथि% <span className="font-bold font-eng text-sm">10-09-2025</span>
              </div>
              <div className="w-1/2 text-center">
                पक्ष% <span className="font-bold">शुक्ल पक्ष</span>
              </div>
            </div>
            <div className="flex items-center justify-center mt-2 md:flex-row flex-col gap-4">
              <p>
                <img src="/img/vishnu.png" alt="विष्णु भगवान" width="350" height="420" className="max-w-full h-auto mx-auto" />
              </p>
              <div>
                <div className="flex justify-center items-center">
                  <div className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-xl mx-auto px-4 theme_text border-tl-[#EF5300] shadow-md">
                    <p>
                      प्रारंभ % <span className="font-bold font-eng text-sm">19:45<span className="font-eng text-sm">pm</span> 09-01-2025</span>
                    </p>
                    <p>
                      समाप्त % <span className="font-bold font-eng text-sm">20:45<span className="font-eng text-sm">pm</span> 10-01-2025</span>
                    </p>
                  </div>
                </div>
                <div className="mx-auto w-auto flex items-center justify-center mt-4">
                  <Link
                    to="#"
                    className="w-auto flex bg-[#9A283D] text-white text-xl rounded-xl px-4 py-2"
                  >
                    <span className="mr-2">
                      <img src="/img/share_icon.png" alt="Share" width="24" height="24" />
                    </span>
                    शेयर करे
                  </Link>
                </div>
              </div>
            </div>
            
            <h3 className="my-6 font-bold text-3xl theme_text text-center">
              ^^<span className="text-md">ॐ</span> नमो भगवते वासुदेवाय।**
            </h3>
            
            <div className="mb-4">
              <h2 className="text-3xl theme_text font-bold mb-3">पूजा विधि</h2>
              <p className="text-2xl text-justify text-[rgba(0,0,0,0.7)]">
                पुत्रदा एकादशी का व्रत करने के लिए] व्रती को साफ पानी से स्नान करना चाहिए। फिर] भगवान विष्णु की
                मूर्ति को सजाकर धूप] दीप] अक्षत] गंध] और नैवेद्य सहित पूजन करना चाहिए। उसके बाद] पुत्रदा एकादशी
                की कथा सुनकर आराधना करें और अंत में प्रसाद बांटें।
              </p>
            </div>
            
            <div className="mb-4">
              <h2 className="text-3xl theme_text font-bold mb-3">पूजा सामग्री</h2>
              <p className="text-2xl text-justify text-[rgba(0,0,0,0.7)]">
                &श्री विष्णु जी का चित्र अथवा मूर्ति
                <br />
                &पुष्प
                <br />
                &नारियल
                <br />
                &सुपारी
                <br />
                &फल
                <br />
                &लौंग
                <br />
                &धूप
                <br />
                &दीप
              </p>
            </div>
            
            <div className="mb-4">
              <h2 className="text-3xl theme_text font-bold">पूजा महत्व</h2>
              <p className="text-2xl text-justify text-[rgba(0,0,0,0.7)]">
                पुत्रदा एकादशी का व्रत करने के लिए] व्रती को साफ पानी से स्नान करना चाहिए। फिर] भगवान विष्णु की
                मूर्ति को सजाकर धूप] दीप] अक्षत] गंध] और नैवेद्य सहित पूजन करना चाहिए। उसके बाद] पुत्रदा एकादशी
                की कथा सुनकर आराधना करें और अंत में प्रसाद बांटें।
              </p>
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

export default Ikadashi;
