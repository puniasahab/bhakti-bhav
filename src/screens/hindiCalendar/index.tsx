import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { logo, rupeesIcon, bell, hdUserIcon, whatssappIcon } from "../../assets/images";

const months = [
  "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
];
// const monthsEng = [
//   "tuojh", "Qjojh", "ekpZ", "vizSy", "ebZ", "twu", "tqykbZ", "vXkLr", "flracj", "vDVwcj", "uoaEcj", "fnlacj"
// ];
const currentMonth = "सितंबर";
const currentYear = "2025";
const events = [
  {
    date: "10",
    day: "बुधवार",
    event: "पुत्रदा एकादशी",
    eventEng: "Putrada Ekadashi"
  },
  {
    date: "25",
    day: "गुरुवार",
    event: "राम नवमी",
    eventEng: "Ram Navami"
  }
];

const HindiCalendar: React.FC = () => {
  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-kruti text-white">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-6">
            <h1 className="text-lg font-bold">
              <Link to="/" className="rupees_icon">
                <img src={logo} alt="Logo" width="108" height="27" className="max-w-full h-auto" />
              </Link>
            </h1>
            <div className="flex items-center md:space-x-6 space-x-4 text-xl">
              <Link to="#" className="rupees_icon">
                <img src={rupeesIcon} alt="Rupees" width="22" height="20" className="max-w-full h-auto" />
              </Link>
              <Link to="#" className="notification_icon">
                <img src={bell} alt="Notifications" width="24" height="21" className="max-w-full h-auto" />
              </Link>
              <Link to="#" className="icon_24">
                <img src={hdUserIcon} alt="User" width="22" height="21" className="max-w-full h-auto" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
            हिंदी कैलेंडर
            <span className="font-eng text-sm ml-2">(Hindi Calendar)</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 mt-6">
        <div className="container mx-auto">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {months.map((month) => (
              <li key={month}>
                <Link
                  to="/"
                  className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
                >
                  {month}
                </Link>
              </li>
            ))}
          </ul>
          <section className="mt-6 px-4">
            <h3 className="theme_text font-semibold mb-3 current_mont text-3xl">
              {currentMonth} <span className="font-eng text-sm">({currentYear})</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {events.map((event, idx) => (
                <li
                  key={idx}
                  className="bg-[#8B1C2C] text-white rounded-lg flex items-center justify-between px-4 py-3 shadow-md"
                >
                  <div className="flex flex-col items-start text-sm font-medium">
                    <span className="text-lg font-bold font-eng">{event.date}</span>
                    <span className="text-xs">{event.day}</span>
                  </div>
                  <div className="w-px h-10 bg-white/50 mx-3"></div>
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold">{event.event}</span>
                    <span className="text-xs text-gray-200 font-eng">{event.eventEng}</span>
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-eng">›</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
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
            <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
              <img src={whatssappIcon} alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HindiCalendar;
