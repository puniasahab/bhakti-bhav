import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";
import { LanguageContext } from "../contexts/LanguageContext";
import { Download, Eye, Heart } from "lucide-react";

function Header({ showWallpaperHeader = false, godName, downloads, views, likes }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const iconRoutes = ["/", "/home", "/Rashifal"];
    const fontRoutes = ["/aarti/", "/vrat-katha"];
    const langOptionToggle = ["/mantra"];
    const isFontRoute = fontRoutes.some((route) => pathname.startsWith(route));

    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext); 

    return (
        <header className="px-4">
            <div className="container mx-auto hd_bg rounded-xl">
                <div className="flex justify-between items-center px-4 py-6">
                    <h1 className="text-lg font-bold">
                        <a href="/" className="rupees_icon">
                            <img
                                src={logo}
                                alt="Logo"
                                width="108"
                                height="27"
                                className="w-[108px] height-[27px]"
                            />
                        </a>
                    </h1>

                    {langOptionToggle && !showWallpaperHeader && !iconRoutes && (
                        <div className="flex space-x-2 theme_text text-lg font-eng">
                            <button
                                onClick={() => setFontSize("text-base")}
                                className="px-2 border-[#9A283D] border rounded-lg"
                            >
                                A
                            </button>
                            <button
                                onClick={() => setFontSize("text-xl")}
                                className="px-2 border-[#9A283D] border rounded-lg"
                            >
                                A+
                            </button>
                        </div>
                    )}

                    {iconRoutes.includes(pathname) && !showWallpaperHeader && (
                        <div className="flex items-center md:space-x-6 space-x-4 text-xl ms-auto">
                            <a href="#">
                                <img src={rupeesIcon} alt="" width="22" height="22" className="w-[20px] min-h-[20px]" />
                            </a>
                            <a href="#">
                                <img src={bellIcon} alt="" width="22" height="22" className="w-[20px] min-h-[20px]" />
                            </a>
                            <a href="/login">
                                <img src={userIcon} alt="" width="22" height="20" className="w-[20px] min-h-[20px]" />
                            </a>
                        </div>
                    )}

                    {isFontRoute && !showWallpaperHeader &&  (
                        <div className="flex space-x-2 theme_text text-lg font-eng">
                            <button
                                onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
                                className={`theme_text py-0 border-[#9A283D] border rounded-lg ${language === "hi" ? "font-eng text-lg" : "font-hindi"
                                    }`}
                            >
                                {language === "hi" ? "Eng" : "हिं"}
                            </button>
                        </div>
                    )}
                    {showWallpaperHeader && (
                        <div className="flex items-center gap-4 text-sm font-eng theme_text">
                            <div className="flex items-center gap-1 text-lg">
                                <Download size={16} /> {downloads}
                            </div>
                            <div className="flex items-center gap-1 text-lg">
                                <Eye size={16} /> {views}
                            </div>
                            <div className="flex items-center gap-1 text-lg">
                                <Heart size={16} /> {likes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
