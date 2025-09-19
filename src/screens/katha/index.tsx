import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { logo, rupeesIcon, bell, hdUserIcon, whatssappIcon } from "../../assets/images";

const Katha: React.FC = () => {
  const kathaCards = [
    {
      title: "मंत्र संग्रह",
      image: "/img/ganpati-1.png",
      alt: "श्री गणपति",
      link: "/ikadashi"
    },
    {
      title: "एकादशी व्रत कथा",
      image: "/img/shreeVishnu.png",
      alt: "विष्णु भगवान",
      link: "/ikadashi"
    },
    {
      title: "नवरात्रि व्रत कथा",
      image: "/img/shivShankar.png",
      alt: "शिव शंकर",
      link: "/ikadashi"
    },
    {
      title: "श्री हनुमान",
      image: "/img/shreeHanuman.png",
      alt: "श्री हनुमान",
      link: "/ikadashi"
    },
    {
      title: "श्री गणपति",
      image: "/img/ganpati-1.png",
      alt: "श्री गणपति",
      link: "/ikadashi"
    },
    {
      title: "विष्णु भगवान",
      image: "/img/shreeVishnu.png",
      alt: "विष्णु भगवान",
      link: "/ikadashi"
    }
  ];

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
            व्रत कथा
            <span className="font-eng text-sm ml-2">(Vrat Katha)</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4">
        <div className="container mx-auto">
          <div className="mt-4">
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {kathaCards.map((card, index) => (
                <li key={index}>
                  <Link
                    to={card.link}
                    className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
                  >
                    <div className="w-full h-36 flex items-center justify-center">
                      <img
                        src={card.image}
                        alt={card.alt}
                        className="h-full w-auto object-cover rounded-md"
                      />
                    </div>
                    <div className="p-2">
                      <h2 className="md:text-3xl text-lg font-normal">{card.title}</h2>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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

export default Katha;
