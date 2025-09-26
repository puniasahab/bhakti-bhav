import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";

import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

function Header() {

    const { pathname } = useLocation();
    const iconRoutes = ["/", "/home", "/Rashifal"];
    const fontRoutes = ["/mantra", "/aarti/", "/vrat-katha"];
    const isFontRoute = fontRoutes.some((route) => pathname.startsWith(route));

    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);

    return (
        <header className="px-4">
            <div className="container mx-auto hd_bg rounded-xl">
                <div className="flex justify-between items-center px-4 py-6">
                    {/* {iconRoutes.includes(pathname) && (
                        <a href="/" className="backBtn"><img src={backBtn} alt="back" width="24" height="27" className="w-[24px] height-[24px]"/></a>

                    )} */}
                    <h1 className="text-lg font-bold">
                        <a href="/" className="rupees_icon">
                            <img src={logo} alt="Logo" width="108" height="27" className="w-[108px] height-[27px]"/>
                        </a>
                    </h1>

                    {iconRoutes.includes(pathname) && (
                        <div className="flex items-center md:space-x-6 space-x-4 text-xl ms-auto">
                            {/* <button
                                onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
                                className={`theme_text text-[18px] ${language === "hi" ? "font-eng pb-1" : "font-hindi pt-1"
                                    }`}
                            >
                                {language === "hi" ? "Eng" : "हिं"}
                            </button> */}
                            <a href="#"><img src={rupeesIcon} alt="" width="22" height="22" className="w-[20px] min-h-[20px]" /></a>
                            <a href="#"><img src={bellIcon} alt="" width="22" height="22" className="w-[20px] min-h-[20px]" /></a>
                            <a href="/login"><img src={userIcon} alt="" width="22" height="20" className="w-[20px] min-h-[20px]" /></a>
                        </div>
                    )}

                    {isFontRoute && (
                        <div className="flex space-x-2 theme_text text-lg font-eng">
                            <button
                                onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
                                 className={`theme_text py-0 ${language === "hi" ? "font-eng text-lg" : "font-hindi"
                                    }`}
                            >
                                {language === "hi" ? "Eng" : "हिं"}
                            </button>
                            <button onClick={() => setFontSize("text-lg")} className="px-2 py-1">A-</button>
                            <button onClick={() => setFontSize("text-base")} className="px-2 py-1">A</button>
                            <button onClick={() => setFontSize("text-xl")} className="px-2 py-1">A+</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
