import React, { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";
import { LanguageContext } from "../contexts/LanguageContext";
import { Download, Eye, Heart, Pencil, MoreVertical, LogOut } from "lucide-react";
import { getTokenFromLS, removeMobileNoFromLS, removeSubscriptionStatusFromLS, removeTokenFromLS } from "../commonFunctions";

function Header({
    showWallpaperHeader = false,
    hindiFontSize = false,
    fontSizeOption = false,
    godName,
    downloads,
    views,
    likes,
    pageName,
    showProfileHeader = false,
    profileText,
    hideEditIcon = false,
    showEnglishText = false,
    showVerticalLogout = false
}) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const homeRoutes = ["/", "/home", "/Rashifal", "/payment", "/hindi-calendar", "/vrat-katha", "/chalisa", "/aarti", '/jaap-mala', "/mantra", "/wallpaper", "/termsAndConditions", "/aboutUs", "/privacyPolicy"];

    const isHomeRoute = homeRoutes.includes(pathname);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getProfileOrLoginRoute = () => {
        if (getTokenFromLS()) {
            return "/profile";
        } else {
            return "/login";
        }
    }

    const handleLogout = () => {
        removeTokenFromLS();
        removeSubscriptionStatusFromLS();
        removeMobileNoFromLS();

        setShowDropdown(false);
        navigate("/");
    };


    return (
        <header className="px-4 pt-3">
            <div className="container mx-auto hd_bg rounded-xl">
                <div className="flex justify-between items-center px-4 py-6">

                    {showProfileHeader && (
                        <>
                            {/* Back Button and Profile Text */}
                            <div className="flex items-center gap-3">
                                <button onClick={() => { navigate("/"); }}>
                                    <img src={backBtn} alt="Back" width="24" height="24" />
                                </button>
                                <span className={`${showEnglishText ? "font-eng" : "font-hindi"} text-xl theme_text`}>{profileText}</span>
                            </div>

                            {/* Three Dots Menu */}
                            <div className="flex items-center gap-3">
                                {/* Edit Icon - Only show if not hidden */}
                                {!hideEditIcon && (
                                    <button className="bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors" onClick={() => { navigate("/edit-profile"); }}>
                                        <Pencil size={20} className="text-[#9A283D]" style={{ background: "transparent !important" }} />
                                    </button>
                                )}

                                {/* Three Dots Menu */}
                                {showVerticalLogout && <div className="relative" ref={dropdownRef}>
                                    <button
                                        className="bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <MoreVertical size={20} className="text-[#9A283D]" />
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-[#9A283D] font-eng"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>}
                            </div>
                        </>
                    )}

                    {!isHomeRoute && !showProfileHeader && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => {

                                if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else {
                                    navigate("/");
                                }
                            }}>
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
                                <a href={getTokenFromLS() ? "/payment" : "/login"}>
                                    <img src={rupeesIcon} alt="₹" width="22" height="22" />
                                </a>
                                <a href="#">
                                    <img src={bellIcon} alt="Bell" width="22" height="22" />
                                </a>
                                <a href={getProfileOrLoginRoute()}>
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
