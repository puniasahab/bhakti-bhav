import React, { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rupeesIcon from "../assets/img/rupees_icon.png";
// import bellIcon from "../assets/img/bell.png";
import userIcon from "../assets/img/hd_user_icon.png";
import logo from "../assets/img/logo.png";
import backBtn from "../assets/img/back_icon.svg";
import { Check, ChevronLeft, Download, Eye, Globe2, Heart, LogOut, MoreVertical, Pencil, ReceiptText } from "lucide-react";
import { LanguageContext } from "../contexts/LanguageContext";
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
    const {
        language,
        setLanguage,
        languages,
        languageLoading,
        languageError,
        fetchLanguages,
        setFontSize
    } = useContext(LanguageContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState(language);
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

    const openLanguageModal = () => {
        setPendingLanguage(language);
        setShowLanguageModal(true);
        if (!languages.length && !languageLoading) {
            fetchLanguages();
        }
    };

    const handleLanguageSelect = (code) => {
        setPendingLanguage(code);
        setLanguage(code);
    };

    const closeLanguageModal = () => {
        setPendingLanguage(language);
        setShowLanguageModal(false);
    };

    const handleLanguageContinue = () => {
        setLanguage(pendingLanguage);
        setShowLanguageModal(false);
    };

    const getLanguageImageUrl = (imageUrl) => {
        if (!imageUrl) return "";
        return imageUrl.startsWith("http://") ? imageUrl.replace("http://", "https://") : imageUrl;
    };

    const renderLanguageButton = (className = "") => (
        <button
            type="button"
            onClick={openLanguageModal}
            className={`bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
            title="Select language"
            aria-label="Select language"
        >
            <Globe2 size={20} className="text-[#9A283D]" />
        </button>
    );


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
                                {renderLanguageButton()}

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
                            {renderLanguageButton("max-[374px]:p-1.5")}
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
                            {renderLanguageButton()}
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

                    {!isHomeRoute && !showProfileHeader && !hindiFontSize && !fontSizeOption && (
                        <div className="ml-auto">
                            {renderLanguageButton()}
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
                                {renderLanguageButton("shadow-none border-0 p-0")}
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
        {showLanguageModal && (
            <div className="fixed inset-0 z-[60] flex justify-end bg-black bg-opacity-40" onClick={closeLanguageModal}>
                <div
                    className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                    onClick={(event) => event.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="language-modal-title"
                >
                    <div className="relative flex items-center justify-center px-6 pt-8 pb-7">
                        <button
                            type="button"
                            onClick={closeLanguageModal}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 hover:bg-gray-100 transition-colors"
                            aria-label="Close language modal"
                        >
                            <ChevronLeft size={32} strokeWidth={2.8} className="text-black" />
                        </button>
                        <h2 id="language-modal-title" className="font-eng text-2xl font-bold tracking-normal text-black">
                            Select Language
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-6">
                        {languageLoading && (
                            <p className="font-eng text-base text-gray-500">Loading languages...</p>
                        )}

                        {!languageLoading && languageError && (
                            <div className="font-eng text-sm text-red-600">
                                <p>{languageError}</p>
                                <button
                                    type="button"
                                    onClick={fetchLanguages}
                                    className="mt-3 rounded-xl border border-[#AA273F] px-4 py-2 text-[#AA273F]"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!languageLoading && !languageError && (
                            <div className="space-y-5">
                                {languages.map((item) => {
                                    const isSelected = item.code === pendingLanguage;
                                    const languageImageUrl = getLanguageImageUrl(item.imageUrl);

                                    return (
                                        <button
                                            key={item._id || item.code}
                                            type="button"
                                            onClick={() => handleLanguageSelect(item.code)}
                                            className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                isSelected
                                                    ? "border-[#AA273F] bg-[#EBD5DA] shadow-[0_8px_24px_rgba(170,39,63,0.22)]"
                                                    : "border-[#E9C9B8] bg-white hover:border-[#AA273F]/70"
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {languageImageUrl ? (
                                                    <img src={languageImageUrl} crossOrigin = "anonoymous" alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="w-8 h-8 rounded-full bg-[#FF9F2E] text-white flex items-center justify-center font-eng text-lg font-bold">
                                                        !
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-eng text-2xl font-bold truncate ${isSelected ? "text-[#AA273F]" : "text-[#222222]"}`}>
                                                    {item.name}
                                                </p>
                                            </div>
                                            <span className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                isSelected ? "border-[#AA273F] bg-[#AA273F]" : "border-[#B9B9B9] bg-white"
                                            }`}>
                                                {isSelected && <Check size={24} strokeWidth={2.8} className="text-white" />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="px-5 pb-6 pt-3 bg-white">
                        <button
                            type="button"
                            onClick={handleLanguageContinue}
                            disabled={languageLoading || Boolean(languageError) || !languages.length}
                            className="w-full rounded-2xl bg-[#AA273F] py-5 font-eng text-2xl font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)] disabled:opacity-60"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default Header;
