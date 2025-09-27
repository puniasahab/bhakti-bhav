import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";
import { LanguageContext } from "../contexts/LanguageContext";
import { Download, Eye, Heart } from "lucide-react";

function Header({
    showWallpaperHeader = false,
    hindiFontSize = false,
    fontSizeOption = false,
    godName,
    downloads,
    views,
    likes,
    pageName
}) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
 
    const homeRoutes = ["/", "/home", "/Rashifal", "/payment", "/hindi-calendar", "/vrat-katha", "/chalisa", "/aarti", '/jaap-mala', "/mantra", "/wallpaper"];

    const isHomeRoute = homeRoutes.includes(pathname);

    return (
        <header className="px-4">
            <div className="container mx-auto hd_bg rounded-xl">
                <div className="flex justify-between items-center px-4 py-6">
 
                    {!isHomeRoute && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate(-1)}>
                                <img src={backBtn} alt="Back" width="24" height="24" />
                            </button>
 
                            {pageName && (
                                <div className="flex flex-row theme_text items-center">
                                    <span className="font-hindi text-xl">{pageName.hi}</span>
                                    <span className="font-eng text-sm ml-2">({pageName.en})</span>
                                </div>
                            )}
                        </div>
                    )}
 
 
                    {showWallpaperHeader && (
                        <div className="flex items-center gap-4 text-sm font-eng theme_text ml-auto">
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

                    {hindiFontSize && (
                         <div className="flex space-x-2 theme_text text-lg font-eng ml-auto">
                            <button
                                onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
                                className="px-2 border-[#9A283D] border rounded-lg"
                            >
                                {language === "hi" ? "En" : "हिं"}
                            </button>
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
                    {fontSizeOption && (
                         <div className="flex space-x-2 theme_text text-lg font-eng ml-auto">
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
 
                    {isHomeRoute && (
                        <>
                            <h1 className="text-lg font-bold">
                                <a href="/">
                                    <img src={logo} alt="Logo" width="108" height="27" />
                                </a>
                            </h1>

                            <div className="flex items-center md:space-x-6 space-x-4 text-xl ms-auto">
                                <a href="#">
                                    <img src={rupeesIcon} alt="₹" width="22" height="22" />
                                </a>
                                <a href="#">
                                    <img src={bellIcon} alt="Bell" width="22" height="22" />
                                </a>
                                <a href="/login">
                                    <img src={userIcon} alt="User" width="22" height="20" />
                                </a>
                            </div>
                        </>
                    )}
 
                </div>
            </div>
        </header>
    );
}

export default Header;
