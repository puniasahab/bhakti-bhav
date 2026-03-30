import React, { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
// import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";
import { ReceiptText } from "lucide-react";
import { LanguageContext } from "../contexts/LanguageContext";
import { Download, Eye, Heart, Pencil, MoreVertical, LogOut } from "lucide-react";
import { getTokenFromLS, removeMobileNoFromLS, removeSubscriptionStatusFromLS, removeTokenFromLS, formatNumber, removeUserName, removeUserIdFromLS } from "../commonFunctions";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import useGA4BaseParams from "../hooks/useGA4BaseParams";


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

    const baseParams = useGA4BaseParams("Header Component");
    const { trackEvent } = useGA4Tracker(baseParams);

    const homeRoutes = ["/", "/home", "/Rashifal", "/payment", "/hindi-calendar", "/vrat-katha", "/chalisa", "/aarti", '/jaap-mala', "/mantra", "/wallpaper", "/termsAndConditions", "/aboutUs", "/privacyPolicy", "/parsad", "/winners"];

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
            console.log("Already login going to profile page!!");
            return "/profile";
        } else {
            return "/login";
        }
    }

    const handleProfileNavigation = () => {
        const route = getProfileOrLoginRoute();
        navigate(route);
    }

    const handlePaymentNavigation = () => {
        if (getTokenFromLS()) {
            navigate("/payment");
        } else {
            navigate("/login");
        }
    }

    const handleTransactionNavigation = () => {
        if (getTokenFromLS()) {
            navigate("/transactions");
        } else {
            navigate("/login");
        }
    }

    const handleLogout = () => {
        trackEvent(GA4Events.logout_clicked, { event_label: "logout_clicked_from_header_on_edit_profile_screen" });
        removeTokenFromLS();    
        removeUserName();
        removeUserIdFromLS();
        removeSubscriptionStatusFromLS();
        removeMobileNoFromLS();

        setShowDropdown(false);
        navigate("/");
    };


    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 bg-white shadow-sm" style={{height: '80px'}}>
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
                        <div className="flex items-center" style={{ gap: window.innerWidth < 368 ? "2px" : "8px" }}>
                            <button onClick={() => {

                                if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else {
                                    navigate("/");
                                }
                            }}>
                                <img src={backBtn} alt="Back" width={window.innerWidth < 375 ? "22" : "24"} height={window.innerWidth < 375 ? "22" : "24"} />
                            </button>

                            {pageName && (
                                <div className="flex flex-row theme_text items-center">
                                    <span className="font-hindi text-xl">{pageName.hi}</span>
                                    <span className="font-eng text-sm ml-0.5">({pageName.en})</span>
                                </div>
                            )}
                        </div>
                    )}


                    {showWallpaperHeader && (
                        <div className="flex items-center gap-1 text-sm font-eng theme_text ml-auto">
                            <div className="flex items-center gap-0.5 text-sm">
                                <Download size={16} /> {formatNumber(downloads)}
                            </div>
                            <div className="flex items-center gap-0.5 text-sm">
                                <Eye size={16} /> {formatNumber(views)}
                            </div>
                            <div className="flex items-center gap-0.5 text-sm">
                                <Heart size={16} /> {formatNumber(likes)}
                            </div>
                        </div>
                    )}

                    {hindiFontSize && (
                        <div className="flex space-x-2 theme_text text-lg font-eng ml-auto max-[374px]:space-x-1 max-[374px]:text-sm">
                            <button
                                onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
                                className="px-2 border-[#9A283D] border rounded-lg max-[374px]:px-1 max-[374px]:py-1 max-[374px]:text-xs"
                            >
                                {language === "hi" ? "En" : "हिं"}
                            </button>
                            <button
                                onClick={() => setFontSize("text-base")}
                                className="px-2 border-[#9A283D] border rounded-lg max-[374px]:px-1 max-[374px]:py-1 max-[374px]:text-xs"
                            >
                                A
                            </button>
                            <button
                                onClick={() => setFontSize("text-xl")}
                                className="px-2 border-[#9A283D] border rounded-lg max-[374px]:px-1 max-[374px]:py-1 max-[374px]:text-xs"
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
                                <button onClick={() => { trackEvent(GA4Events.rupees_icon_clicked, {event_label: "rupees_icon_clicked_from_home_screen"}); handlePaymentNavigation(); }}>
                                    <img src={rupeesIcon} alt="₹" width="22" height="22" />
                                </button>
                                <button onClick={() => { trackEvent(GA4Events.transaction_option_clicked, {event_label: "transaction_icon_clicked_from_home_screen"}); handleTransactionNavigation(); }}>
                                    <ReceiptText size={22} className="text-[#9A283D]" />
                                </button>
                                <button onClick={handleProfileNavigation}>
                                    <img src={userIcon} alt="User" width="22" height="20" />
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </header>
        {/* Spacer div to prevent content overlap */}
        <div className="h-20 w-full"></div>
        </>
    );
}

export default Header;
