import React, { useState, useEffect, useRef, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, ChevronUp, Gift, Globe2, IndianRupee, Instagram, Sparkles, WalletCards } from "lucide-react";
import { homeSchema } from "../seo/schemas";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";

import "swiper/css";
import "swiper/css/pagination";
import { homeCategoryApis, homeMainApis, profileApis, wallpaperApis } from "../api";
import { getMobileNoFromLS, setUserIdInLS, setUserName, removeSubscriptionStatusFromLS, setSubscriptionStatusInLS, getTokenFromLS, getSubscriptionStatusFromLS, getIsLoggedIn } from "../commonFunctions";
import homeCache from "../utils/homeCache";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import SEO from "../components/SEO";
import { LanguageContext } from "../contexts/LanguageContext";
import malaGif from "../assets/img/mala.gif";
import hindiCalendarHomeImage from '../assets/img/hindi_calendar_home.png';
import vratKathaHomeImage from "../assets/img/vrat_katha_home.png";

const ASSET_BASE_URL = "https://api.bhaktibhav.app";

const normalizeImageUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `${ASSET_BASE_URL}${url}`;
    return url;
};

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getSocialReelsFromResponse = (response) => {
    const possiblePayloads = [
        response,
        response?.data,
        response?.data?.data
    ];

    for (const payload of possiblePayloads) {
        if (Array.isArray(payload?.socialReels)) {
            return payload.socialReels
                .filter((reel) => reel?.thumbnailUrl || reel?.videoUrl || reel?.redirectUrl)
                .sort((a, b) => (a.position || 0) - (b.position || 0));
        }
    }

    return [];
};

const getHomeBannersFromBannersResponse = (response) => {
    const banners = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
            ? response
            : [];

    return banners.filter((banner) => banner?.pageName === "home" && (banner.imageUrl || banner.imagethumb));
};

const getHomeDeepLinksFromResponse = (response) => {
    const payload = response?.data || response || {};
    const deepLinks = payload.deeplink || payload.deepLink || payload.deepLinks || [];

    if (!Array.isArray(deepLinks)) return [];

    return deepLinks
        .filter((item) => item?.image || item?.imagethumb || item?.imageUrl)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
};

function Home() {
    const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const baseParams = useGA4BaseParams("Home Screen");
    const { trackEvent } = useGA4Tracker(baseParams);
    const { deviceType, redirectToStore } = useAppStoreRedirect();

    const [isOpen, setIsOpen] = useState(false);
    const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);
    const [isQuickAccessExpanded, setIsQuickAccessExpanded] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [panchangData, setPanchangData] = useState(() => {
        const cachedRaw = homeCache.get("panchangRawData");
        if (!cachedRaw) return [];
        return [
            {
                side: "left",
                items: [
                    <span><strong>तिथि</strong> % {cachedRaw.tithi?.hi || "-"}</span>,
                    <span><strong>नक्षत्र</strong> % {cachedRaw.nakshatra?.hi || "-"}</span>,
                    <span><strong>करण</strong> % {cachedRaw.karana?.hi || "-"}</span>,
                ],
            },
            {
                side: "right",
                items: [
                    <span><strong>पक्ष</strong> % {cachedRaw.paksha?.hi || "-"}</span>,
                    <span><strong>योग</strong> % {cachedRaw.yoga?.hi || "-"}</span>,
                    <span><strong>वार</strong> % {cachedRaw.vaar?.hi || "-"}</span>,
                ],
            },
        ];
    });
    const [homeScreenData, setHomeScreenData] = useState(() => homeCache.get(`homeScreenData:${language}`) || null);
    const [socialReelsData, setSocialReelsData] = useState(() => homeCache.get(`homeSocialReels:${language}`) || []);
    const [bannersData, setBannersData] = useState(() => homeCache.get("bannersData") || []);
    const [homeDeepLinks, setHomeDeepLinks] = useState(() => homeCache.get(`homeDeepLinks:${language}`) || []);
    const [homeCategories, setHomeCategories] = useState(() => homeCache.get("homeCategories") || []);
    const [categoriesLoading, setCategoriesLoading] = useState(() => !homeCache.get(`homeScreenData:${language}`) && !homeCache.has("homeCategories"));
    const hasTrackedScreenView = useRef(false);

    const fallbackHomeCategories = [
        { _id: "hindi-calendar", imageUrl: "./img/icon_2.png", url: "hindi-calendar", title: "हिन्दी कैलेंडर" },
        { _id: "vrat-katha", imageUrl: "./img/icon_3.png", url: "vrat-katha", title: "व्रत कथा" },
        { _id: "jaap-mala", imageUrl: "./img/icon_4.png", url: "jaap-mala", title: "नाम जाप" },
        { _id: "mantra", imageUrl: "./img/icon_5.png", url: "mantra", title: "मंत्र" },
        { _id: "chalisa", imageUrl: "./img/icon_1.png", url: "chalisa", title: "चालीसा" },
        { _id: "aarti", imageUrl: "./img/icon_6.png", url: "aarti", title: "आरती" }
    ];

    const categoryRouteMap = {
        arti: "aarti",
        "jaap-mala": "newjaapMaala",
        "japp-mala": "newjaapMaala",
        "puja-karein": "puja-kare",
        "aaj-ka-rashifal": "rashifal",
        "guru-ji": "guru-ji",
        guruji: "guru-ji",
        teaching: "guru-ji",
        "teaching-content": "guru-ji",
        108: "jaap-mala"
    };

    const categoryEventMap = {
        "hindi-calendar": {
            eventName: GA4Events.hindi_calendar_widget_clicked,
            event_label: "hindi_calendar_card_clicked_on_home_screen"
        },
        "vrat-katha": {
            eventName: GA4Events.vrat_katha_widget_clicked,
            event_label: "vrat_katha_card_clicked_on_home_screen"
        },
        "jaap-mala": {
            eventName: GA4Events.jaap_mala_widget_clicked,
            event_label: "jaap_mala_card_clicked_on_home_screen"
        },
        newjaapMaala: {
            eventName: GA4Events.jaap_mala_widget_clicked,
            event_label: "jaap_mala_card_clicked_on_home_screen"
        },
        mantra: {
            eventName: GA4Events.mantra_widget_clicked,
            event_label: "mantra_card_clicked_on_home_screen"
        },
        chalisa: {
            eventName: GA4Events.chalisa_widget_clicked,
            event_label: "chalisa_card_clicked_on_home_screen"
        },
        aarti: {
            eventName: GA4Events.aarti_widget_clicked,
            event_label: "aarti_card_clicked_on_home_screen"
        },
        wallpaper: {
            eventName: GA4Events.wallpaper_widget_clicked,
            event_label: "wallpaper_card_clicked_on_home_screen"
        },
        "puja-kare": {
            eventName: GA4Events.pooja_karein_widget_clicked,
            event_label: "pooja_kare_card_clicked_on_home_screen"
        },
        rashifal: {
            eventName: GA4Events.rashifal_tab_clicked,
            event_label: "rashifal_card_clicked_on_home_screen"
        }
    };

    const redirectPageRouteMap = {
        "panchang-calendar": "/hindi-calendar",
        "hindi-calendar": "/hindi-calendar",
        hindi_calendar: "/hindi-calendar",
        vrat: "/vrat-katha",
        "vrat-katha": "/vrat-katha",
        katha: "/vrat-katha",
        wallpaper: "/wallpaper",
        chalisa: "/chalisa",
        arti: "/aarti",
        aarti: "/aarti",
        jaapmala: "/jaap-mala",
        "jaap-mala": "/newjaapMaala",
        mantra: "/mantra",
        "puja-karein": "/puja-kare",
        "aaj-ka-rashifal": "/rashifal",
        "guru-ji": "/guru-ji",
        guruji: "/guru-ji",
        teaching: "/guru-ji",
        "teaching-content": "/guru-ji",
        kahaniya: "/kahaniya-details"
    };

    const getCategoryRoute = (category) => {
        const url = String(category?.url || "").replace(/^\/+/, "");
        const route = categoryRouteMap[url] || url;
        const categoryId = category?.categoryId || category?._id;

        if (!route || route === "aaj-ka-suvichar") {
            return "/";
        }

        if (route === "kahaniya" && categoryId) {
            return `/kahaniya/${categoryId}`;
        }

        if (route === "newjaapMaala" && categoryId) {
            return `/newjaapMaala/${categoryId}`;
        }

        return `/${route}`;
    };

    const getHomeCategoriesFromResponse = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.categories)) return response.categories;
        return [];
    };

    const getHomeScreenPayload = (response) => response?.data || response || null;

    const formatPanchangData = (rawData) => [
        {
            side: "left",
            items: [
                <span><strong>तिथि</strong> % {rawData.tithi?.hi || "-"}</span>,
                <span><strong>नक्षत्र</strong> % {rawData.nakshatra?.hi || "-"}</span>,
                <span><strong>करण</strong> % {rawData.karana?.hi || "-"}</span>,
            ],
        },
        {
            side: "right",
            items: [
                <span><strong>पक्ष</strong> % {rawData.paksha?.hi || "-"}</span>,
                <span><strong>योग</strong> % {rawData.yoga?.hi || "-"}</span>,
                <span><strong>वार</strong> % {rawData.vaar?.hi || "-"}</span>,
            ],
        },
    ];

    useEffect(() => {
        if (!isOpen) return;

        const cachedPanchangRaw = homeCache.get("panchangRawData");
        if (cachedPanchangRaw) {
            setPanchangData(formatPanchangData(cachedPanchangRaw));
            return;
        }

        const fetchPanchang = async () => {
            trackEvent(GA4Events.panchang_card_clicked, {
                event_label: "panchang_card_clicked_on_home_screen"
            });
            try {
                const res = await fetch("https://api.bhaktibhav.app/frontend/daily-panchang");
                const data = await res.json();

                if (data?.success && data.data) {
                    setPanchangData(formatPanchangData(data.data));
                    homeCache.set("panchangRawData", data.data);
                } else {
                    setPanchangData([]);
                }
            } catch (err) {
                console.error("Error fetching Panchang:", err);
                setPanchangData([]);
            }
        };

        fetchPanchang();
    }, [isOpen, trackEvent]);

    useEffect(() => {
        if (!hasTrackedScreenView.current) {
            trackEvent(GA4Events.screen_view);
            hasTrackedScreenView.current = true;
        }
    }, [trackEvent]);

    const phoneNumber = getMobileNoFromLS();

    useEffect(() => {
        let isMounted = true;
        const cacheKey = `homeScreenData:${language}`;
        const deepLinksCacheKey = `homeDeepLinks:${language}`;
        const cachedHomeScreenData = homeCache.get(cacheKey);
        const cachedDeepLinks = homeCache.get(deepLinksCacheKey);

        setCategoriesLoading(!cachedHomeScreenData && !homeCache.has("homeCategories"));

        if (cachedHomeScreenData) {
            setHomeScreenData(cachedHomeScreenData);
            setSocialReelsData(getSocialReelsFromResponse(cachedHomeScreenData));
            setHomeCategories(cachedHomeScreenData.categories || []);
        }

        if (cachedDeepLinks) {
            setHomeDeepLinks(cachedDeepLinks);
        }

        const homeApiPromises = [
            profileApis.getProfile(),
            homeMainApis.getHomeScreenData(language, "android"),
            homeMainApis.getHomeData(language),
            homeCategoryApis.fetchHomeCategories(language),
            wallpaperApis.getBanners()
        ];

        Promise.allSettled(homeApiPromises).then(([profileResult, homeScreenResult, legacyHomeResult, homeCategoriesResult, bannersResult]) => {
            if (!isMounted) return;

            if (profileResult.status === "fulfilled") {
                const resp = profileResult.value;
                if (resp) {
                    setSubscriptionStatusInLS(resp.hasActivePlan);
                    setUserIdInLS(resp._id);
                    setUserName(resp.name === "New User" ? "" : resp.name || "");
                }
            } else {
                removeSubscriptionStatusFromLS();
                console.error("Error fetching profile data:", profileResult.reason);
            }

            if (homeScreenResult.status === "fulfilled") {
                const payload = getHomeScreenPayload(homeScreenResult.value);
                if (payload) {
                    const socialReels = getSocialReelsFromResponse(homeScreenResult.value);

                    setHomeScreenData(payload);
                    homeCache.set(cacheKey, payload);
                    setSocialReelsData(socialReels);
                    homeCache.set(`homeSocialReels:${language}`, socialReels);

                    if (payload.categories?.length) {
                        setHomeCategories(payload.categories);
                        homeCache.set("homeCategories", payload.categories);
                    }
                }
            } else {
                console.error("Error fetching home screen data:", homeScreenResult.reason);
            }

            if (legacyHomeResult.status === "fulfilled" && legacyHomeResult.value) {
                const deepLinks = getHomeDeepLinksFromResponse(legacyHomeResult.value);
                setHomeDeepLinks(deepLinks);
                homeCache.set(deepLinksCacheKey, deepLinks);
            } else if (legacyHomeResult.status === "rejected") {
                console.error("Error fetching legacy home data:", legacyHomeResult.reason);
            }

            if (!homeScreenResult.value && homeCategoriesResult.status === "fulfilled") {
                const categories = getHomeCategoriesFromResponse(homeCategoriesResult.value);
                if (categories.length > 0) {
                    setHomeCategories(categories);
                    homeCache.set("homeCategories", categories);
                }
            } else if (homeCategoriesResult.status === "rejected") {
                console.error("Error fetching home categories:", homeCategoriesResult.reason);
            }

            if (bannersResult.status === "fulfilled" && bannersResult.value) {
                const homeBanners = getHomeBannersFromBannersResponse(bannersResult.value);
                setBannersData(homeBanners);
                homeCache.set("bannersData", homeBanners);
            } else if (bannersResult.status === "rejected") {
                console.error("Error fetching banners:", bannersResult.reason);
            }

            setCategoriesLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [phoneNumber, language]);

    const getRedirectRoute = (item) => {
        if (!item) return "/";

        if (item.redirectUrl) {
            try {
                const url = new URL(item.redirectUrl);
                return url.origin === window.location.origin ? url.pathname : item.redirectUrl;
            } catch (error) {
                return item.redirectUrl.startsWith("/") ? item.redirectUrl : `/${item.redirectUrl}`;
            }
        }

        const page = item.redirectPage || item.categoryRedirect || item.source;
        const baseRoute = redirectPageRouteMap[page] || "/";
        const id = item.redirectId || item.categoryId || item.kathaId || item.vratId || item._id;

        if ((page === "katha" || page === "kahaniya") && id) {
            return `${baseRoute}/${id}`;
        }

        return baseRoute;
    };

    const handleAccessControlledClick = (item, e, eventName, eventPayload = {}) => {
        const route = getRedirectRoute(item);
        const isExternal = /^https?:\/\//i.test(route);

        if (item?.accessType === "paid") {
            if (!getTokenFromLS()) {
                e?.preventDefault();
                setShowLoginModal(true);
                return;
            }

            if (!getSubscriptionStatusFromLS()) {
                e?.preventDefault();
                navigate("/payment");
                return;
            }
        }

        if (eventName) {
            trackEvent(eventName, eventPayload);
        }

        if (isExternal) {
            e?.preventDefault();
            window.open(route, "_blank", "noopener,noreferrer");
        }
    };

    const handleBannerClicked = (banner, e) => {
        if (!banner?.Urls) {
            return;
        }

        let route = "";
        try {
            route = new URL(banner.Urls).pathname;
        } catch (error) {
            route = banner.Urls.startsWith("/") ? banner.Urls : `/${banner.Urls}`;
        }

        if (!getTokenFromLS()) {
            e?.preventDefault();
            setShowLoginModal(true);
            return;
        }

        if (!getSubscriptionStatusFromLS()) {
            e?.preventDefault();
            trackEvent(GA4Events.main_banner_clicked, {
                event_label: "main_banner_clicked_from_home_screen"
            });
            navigate("/payment");
            return;
        }

        e?.preventDefault();
        trackEvent(GA4Events.main_banner_clicked, {
            event_label: "main_banner_clicked_from_home_screen"
        });
        navigate(route);
    };

    const handleBannerRedirectionClick = (banner, e) => {
        e.stopPropagation();
        if (deviceType === "ios" || deviceType === "android") {
            redirectToStore();
        } else if (banner?.Urls) {
            handleBannerClicked(banner, e);
        }
    };

    const handleHomeCategoryClicked = (category, e) => {
        const isLoggedIn = getIsLoggedIn();
        const needsLogin = !isLoggedIn && (
            category?.isWithoutLoginFree === false || !getTokenFromLS()
        );

        if (needsLogin) {
            e?.preventDefault();
            setShowLoginModal(true);
            return;
        }

        const route = getCategoryRoute(category).replace(/^\//, "").split("/")[0];
        const eventConfig = categoryEventMap[route];

        if (eventConfig?.eventName) {
            trackEvent(eventConfig.eventName, {
                event_label: eventConfig.event_label,
                id: category?._id,
                title: category?.title
            });
        }
    };

    const renderCategoryTitle = (title, category) => {
        if (getCategoryRoute(category) === "/guru-ji") return "गुरु जी";

        if (language !== "hinglish") {
            return stripHtmlTags(title);
        }

        const normalizedTitle = String(title || "").replace(/<\/?p[^>]*>/gi, "").trim();
        const [hindiText = "", englishText = ""] = normalizedTitle.split(/<\/?br\s*\/?>/i);
        const cleanHindi = stripHtmlTags(hindiText);
        const cleanEnglish = stripHtmlTags(englishText);

        if (!cleanEnglish) {
            return <span className="font-eng">{stripHtmlTags(title)}</span>;
        }

        return (
            <>
                <span className="font-devanagari block">{cleanHindi}</span>
                {/* <span className="font-eng block text-[11px] leading-tight">{cleanEnglish}</span> */}
            </>
        );
    };

    const categoriesToShow = homeScreenData?.categories?.length ? homeScreenData.categories : (homeCategories.length > 0 ? homeCategories : fallbackHomeCategories);
    const visibleQuickAccessCategories = isQuickAccessExpanded ? categoriesToShow : categoriesToShow.slice(0, 4);
    const homeMenuActions = [
        {
            key: "upgrade",
            label: "अभी अपग्रेड करें",
            Icon: IndianRupee,
            onClick: () => {
                if (getTokenFromLS()) {
                    navigate("/payment");
                } else {
                    navigate("/login");
                }
            }
        },
        {
            key: "language",
            label: "भाषा",
            Icon: Globe2,
            onClick: () => window.dispatchEvent(new Event("bhakti-bhav:open-language-modal"))
        },
        {
            key: "wallet",
            label: "मेरा वॉलेट",
            Icon: WalletCards,
            onClick: () => {
                if (getTokenFromLS()) {
                    navigate("/transactions");
                } else {
                    navigate("/login");
                }
            }
        },
        {
            key: "refer",
            label: "रेफर",
            Icon: Gift,
            onClick: () => window.open("https://bhakti-bhav-referral.onelink.me/VOv8/vc1rvamj", "_blank", "noopener,noreferrer")
        }
    ];
    const quickLinks = homeScreenData?.quickLinks?.length ? homeScreenData.quickLinks : [
        { key: "hindi_calendar", title: "हिंदी कैलेंडर", redirectPage: "panchang-calendar", imageUrl: "./img/icon_2.png" },
        { key: "vrat_katha", title: "व्रत कथा", redirectPage: "vrat", imageUrl: "./img/icon_3.png" }
    ];
    const guidance = homeScreenData?.todaysGuidance;
    const todaysVrat = guidance?.todaysVrat;
    const jaapStreak = homeScreenData?.jaapStreak;
    const upcomingFestival = homeScreenData?.upcomingFestivals?.[0];
    const premium = homeScreenData?.premium;
    const socialReels = socialReelsData.length ? socialReelsData : getSocialReelsFromResponse(homeScreenData);
    const topBanners = bannersData;

    console.log("This is top banner data: ", topBanners);

    const PageShimmer = () => (
        <div className="container mx-auto flex max-w-md flex-col gap-4 px-4 pt-4 md:max-w-5xl animate-pulse">
            <div className="h-6 w-36 rounded bg-gray-200" />
            <div className="h-44 rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-12 rounded-xl bg-gray-200" />
                <div className="h-12 rounded-xl bg-gray-200" />
            </div>
            <div className="h-20 rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-xl bg-gray-200" />
                ))}
            </div>
        </div>
    );

    const renderGuidanceCard = () => {
        const cardData = todaysVrat || guidance?.cta || {};
        const panchang = guidance?.panchang || {};
        const guidanceTitle = guidance?.title || "आज का मार्गदर्शन";
        const guidanceDate = cardData.date || panchang.date || guidance?.thought?.date;
        const panchangDescription = panchang.nakshatra && panchang.paksha
            ? `आज ${panchang.nakshatra} नक्षत्र और ${panchang.paksha} पक्ष है।`
            : "";
        const guidanceDescription = cardData.description || panchangDescription || guidance?.thought?.thought;
        const route = getRedirectRoute({
            redirectPage: cardData.redirectPage || guidance?.cta?.redirectPage,
            redirectId: cardData.redirectId || guidance?.cta?.redirectId,
            redirectUrl: cardData.redirectUrl || guidance?.cta?.redirectUrl,
            accessType: cardData.accessType || guidance?.cta?.accessType
        });
        const imageUrl = normalizeImageUrl(cardData.additionalImageUrl || cardData.imageUrl || "/img/banner-1.jpg");

        return (
            <Link
                to={route}
                onClick={(e) => handleAccessControlledClick(cardData, e, GA4Events.main_banner_clicked, {
                    event_label: "main_guidance_card_clicked_from_home_screen"
                })}
                className="relative block min-h-[228px] overflow-hidden rounded-[22px] bg-[#FFF1DD] shadow-[0_10px_28px_rgba(154,40,61,0.08)] sm:min-h-[220px] md:h-[320px] md:min-h-0 md:rounded-[28px]"
            >
                <img
                    src={imageUrl}
                    crossOrigin="anonymous"
                    alt={stripHtmlTags(cardData.title || guidanceTitle)}
                    className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFF2DF] via-[#FFF2DF]/95 via-[64%] to-transparent md:via-[58%]" />
                <div className="relative z-10 flex min-h-[228px] max-w-[68%] flex-col justify-center px-4 py-4 text-[#9A283D] sm:min-h-[220px] sm:max-w-[66%] md:h-full md:min-h-0 md:px-8 md:py-5">
                    <span className="font-devanagari inline-flex w-fit rounded-xl bg-[#FFE1AC] px-3 py-1.5 text-[13px] font-bold leading-none md:px-4 md:py-2 md:text-base">{guidanceTitle}</span>
                    <h2 className="font-devanagari mt-3 text-[27px] font-bold leading-none md:mt-4 md:text-5xl">{cardData.title || "आज का व्रत"}</h2>
                    {guidanceDate && <p className="font-eng mt-3 text-sm text-[#5E5E5E] md:mt-4 md:text-lg">{guidanceDate}</p>}
                    {guidanceDescription && (
                        <p className="font-devanagari mt-2.5 text-[15px] leading-snug text-[#4E4E4E] md:mt-3 md:text-lg md:leading-tight">
                            {guidanceDescription}
                        </p>
                    )}
                    <span className="font-devanagari mt-4 inline-flex w-fit items-center gap-1 rounded-xl bg-[#9A283D] px-5 py-2.5 text-[15px] font-semibold leading-none text-white shadow-[0_8px_16px_rgba(154,40,61,0.22)] md:mt-5 md:px-6 md:py-3 md:text-lg">
                        {cardData.ctaLabel || guidance?.cta?.label || "आज का व्रत"}
                        <ArrowRight size={16} />
                    </span>
                </div>
            </Link>
        );
    };

    const renderTopBanner = (banner) => {
        const imageUrl = normalizeImageUrl(banner.imageUrl || banner.imagethumb);

        return (
            <Link
                to={banner?.Urls || "#"}
                onClick={(e) => handleBannerClicked(banner, e)}
                className="relative block h-[172px] overflow-hidden rounded-2xl bg-[#FFF4E2] shadow-[0_10px_28px_rgba(154,40,61,0.12)] md:h-[320px]"
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        crossOrigin="anonymous"
                        alt={stripHtmlTags(banner.name || "Bhakti Bhav")}
                        className="h-full w-full object-cover"
                    />
                )}
                {banner?.Urls && (
                    <button
                        type="button"
                        onClick={(e) => handleBannerRedirectionClick(banner, e)}
                        className="font-eng absolute bottom-4 right-4 rounded-full bg-[#9A283D] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#7a1f30] md:text-sm"
                    >
                        Click Here
                    </button>
                )}
            </Link>
        );
    };

    const renderHomeDeepLinkCard = (item) => {
        const imageUrl = normalizeImageUrl(item.imagethumb || item.image || item.imageUrl);
        const accessItem = {
            ...item,
            accessType: item.accessType || (item.isPaid && item.isWithoutLoginFree === false ? "paid" : "free")
        };

        return (
            <Link
                key={item._id || imageUrl}
                to={getRedirectRoute(item)}
                onClick={(e) => handleAccessControlledClick(accessItem, e, GA4Events.wallpaper_widget_clicked, {
                    event_label: "home_deeplink_card_clicked_above_quick_access",
                    id: item?._id,
                    categoryId: item?.categoryId,
                    categoryRedirect: item?.categoryRedirect
                })}
                className="relative block h-[92px] overflow-hidden rounded-2xl bg-[#FFF1D8] shadow-[0_10px_22px_rgba(154,40,61,0.08)] md:h-[150px]"
            >
                <img
                    src={imageUrl}
                    crossOrigin="anonymous"
                    alt={stripHtmlTags(item.title || item.name || "Bhakti Bhav")}
                    className="h-full w-full object-cover"
                />
            </Link>
        );
    };

    const closeHomeMenu = () => setIsHomeMenuOpen(false);

    const handleHomeMenuActionClick = (action) => {
        closeHomeMenu();
        action.onClick();
    };

    const handleHomeMenuCategoryClick = (category, e) => {
        handleHomeCategoryClicked(category, e);
        if (!e.defaultPrevented) {
            closeHomeMenu();
        }
    };

    const renderHomeMenuTitle = (title) => {
        const normalizedTitle = String(title || "").replace(/<\/?p[^>]*>/gi, "").trim();
        const [primaryTitle = ""] = normalizedTitle.split(/<\/?br\s*\/?>/i);

        return stripHtmlTags(primaryTitle || title);
    };

    const homeImages = [hindiCalendarHomeImage, vratKathaHomeImage];
    return (
        <>
            <SEO
                title="Best Hindu Devotional App for Daily Puja, Mantras & Aarti | भक्ति भाव"
                description="Experience devotion with our Hinduism app offering daily devotional content, bhajans, aarti, and online Hindu services. Connect with divine energy every day."
                canonical="https://bhaktibhav.app/"
                schema={homeSchema}
            />
            <Header onHomeMenuClick={() => setIsHomeMenuOpen(true)} />

            {categoriesLoading ? <PageShimmer /> : null}

            <main className={`container mx-auto flex max-w-md flex-col px-4 pb-28 pt-2 md:max-w-5xl ${categoriesLoading ? "hidden" : ""}`}>
                <section className="mb-4">
                    <p className="font-devanagari inline-flex rounded-md bg-[#FFE8B4] px-3 py-1 text-base font-semibold text-[#9A283D]">
                        {homeScreenData?.greeting || "नमस्ते भक्त!"}
                    </p>
                    <p className="font-devanagari mt-2 text-sm text-[#7B6A62]">ईश्वर आपके दिन को मंगलमय करें 🙏</p>
                </section>

                <section className="mb-4">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        loop={(guidance ? 1 : 0) + topBanners.length > 1}
                        className="home-main-swiper w-full rounded-2xl"
                    >
                        {guidance && <SwiperSlide>{renderGuidanceCard()}</SwiperSlide>}
                        {/* this code is commented because it is showing banner carousel */}
                        {/* {topBanners.map((banner) => (
                            <SwiperSlide key={banner._id || banner.imageUrl}>{renderTopBanner(banner)}</SwiperSlide>
                        ))} */}
                    </Swiper>
                </section>

                <section className="mb-4 grid grid-cols-2 gap-2">
                    {quickLinks.slice(0, 2).map((item, index) => {
                        const isCalendar = item.key === "hindi_calendar" || item.redirectPage === "panchang-calendar";
                        const Icon = isCalendar ? CalendarDays : BookOpen;

                        return (
                            <Link
                                key={item.key || item.title}
                                to={getRedirectRoute(item)}
                                onClick={(e) => handleAccessControlledClick(item, e, isCalendar ? GA4Events.hindi_calendar_widget_clicked : GA4Events.vrat_katha_widget_clicked, {
                                    event_label: `${item.key || item.redirectPage}_shortcut_clicked_on_home_screen`
                                })}
                                className="font-devanagari flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-[#9A283D] bg-white px-3 text-base font-semibold text-[#9A283D] shadow-sm transition hover:bg-[#FFF7ED]"
                            >
                                {normalizeImageUrl(item.imageUrl) ? (
                                    // here removed normalizeImageUrl(item?.imageUrl) from bottom image src because 
                                    // have to show static image inside this place. 
                                    <img
                                    
                                        // src={normalizeImageUrl(item?.imageUrl)}
                                        src={homeImages[index]}
                                        crossOrigin="anonymous"
                                        alt={stripHtmlTags(item.title)}
                                        className="h-7 w-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <Icon size={22} />
                                )}
                                <span className="truncate">{stripHtmlTags(item.title)}</span>
                            </Link>
                        );
                    })}
                </section>

                <section className="mb-4">
                    <Link
                        to={jaapStreak?.categoryId ? `/newjaapMaala/${jaapStreak.categoryId}` : "/newjaapMaala"}
                        onClick={() => trackEvent(GA4Events.jaap_mala_widget_clicked, {
                            event_label: "jaap_streak_card_clicked_on_home_screen",
                            categoryId: jaapStreak?.categoryId
                        })}
                        className="flex min-h-[108px] items-center justify-between overflow-hidden rounded-[22px] border border-[#F5E5D7] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(154,40,61,0.08)]"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                                <img src={malaGif} alt="" className="h-20 w-20 object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-devanagari whitespace-nowrap text-[18px] font-bold leading-tight text-[#9A283D]">{jaapStreak?.ctaLabel || "अपना जाप जारी रखें"}</h2>
                            </div>
                        </div>
                        <span className="font-eng ml-3 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#9A283D] px-3 py-2 text-xs font-semibold text-white">
                            Click Here <ArrowRight size={14} />
                        </span>
                    </Link>
                </section>

                {upcomingFestival && !homeDeepLinks.length && (
                    <section className="mb-5">
                        <Link
                            to={upcomingFestival.kathaId ? `/vrat-katha/${upcomingFestival.kathaId}` : "/hindi-calendar"}
                            onClick={(e) => handleAccessControlledClick({
                                redirectPage: "katha",
                                redirectId: upcomingFestival.kathaId,
                                accessType: upcomingFestival.accessType
                            }, e, GA4Events.vrat_katha_widget_clicked, {
                                event_label: "upcoming_festival_banner_clicked_on_home_screen",
                                festival: upcomingFestival.name
                            })}
                            className="relative block h-[92px] overflow-hidden rounded-2xl bg-[#FFF1D8] shadow-[0_10px_22px_rgba(154,40,61,0.08)] md:h-[150px]"
                        >
                            <img
                                src={normalizeImageUrl(upcomingFestival.imageUrl) || "/img/banner-2.jpg"}
                                crossOrigin="anonymous"
                                alt={stripHtmlTags(upcomingFestival.name)}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fff4dc]/80 to-[#fff4dc]" />
                            <div className="font-devanagari relative z-10 ml-auto flex h-full w-[58%] flex-col justify-center pr-5 text-right text-[#9A283D] md:pr-8">
                                <h2 className="text-3xl font-bold leading-tight md:text-5xl">{upcomingFestival.nameHi || upcomingFestival.name}</h2>
                                <p className="text-sm text-[#7A554E] md:text-lg">{upcomingFestival.daysLeftLabel || upcomingFestival.date}</p>
                            </div>
                        </Link>
                    </section>
                )}

                {homeDeepLinks.length > 0 && (
                    <section className="mb-5">
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3500, disableOnInteraction: false }}
                            loop={homeDeepLinks.length > 1}
                            className="home-deeplink-swiper w-full rounded-2xl"
                        >
                            {homeDeepLinks.map((item) => (
                                <SwiperSlide key={item._id || item.imagethumb || item.image || item.imageUrl}>
                                    {renderHomeDeepLinkCard(item)}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </section>
                )}

                <section className="mb-5" aria-label="Quick Access">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-eng text-xl font-bold text-[#9A283D]">Quick Access</h2>
                        {categoriesToShow.length > 4 && (
                            <button
                                type="button"
                                className="font-eng inline-flex min-h-8 items-center gap-1 text-xs text-[#8F7B73]"
                                aria-expanded={isQuickAccessExpanded}
                                aria-controls="home-quick-access-cards"
                                onClick={() => setIsQuickAccessExpanded((expanded) => !expanded)}
                            >
                                {isQuickAccessExpanded ? "See less" : "See more"}
                                {isQuickAccessExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                            </button>
                        )}
                    </div>
                    <div id="home-quick-access-cards" className="grid grid-cols-4 gap-x-4 gap-y-5 text-center md:grid-cols-6">
                        {visibleQuickAccessCategories.map((category) => (
                            <Link
                                key={category._id || category.url || category.title}
                                to={getCategoryRoute(category)}
                                state={{
                                    categoryId: category?.categoryId || category?._id,
                                    categoryTitle: category?.title
                                }}
                                onClick={(e) => handleHomeCategoryClicked(category, e)}
                                className="group flex min-w-0 flex-col items-center"
                            >
                                <span className="flex h-[70px] w-[70px] items-center justify-center rounded-xl border border-[#F0E4DC] bg-white shadow-[0_6px_16px_rgba(154,40,61,0.06)] transition group-hover:border-[#9A283D] group-hover:bg-[#FFF8F0] md:h-20 md:w-20">
                                    <img
                                        src={normalizeImageUrl(category.imageUrl)}
                                        alt={getCategoryRoute(category) === "/guru-ji" ? "गुरु जी" : stripHtmlTags(category.title)}
                                        crossOrigin="anonymous"
                                        className="h-10 w-10 object-contain"
                                    />
                                </span>
                                <p className="font-devanagari mt-2 w-full truncate text-sm leading-tight text-[#2F2724] md:text-base">
                                    {renderCategoryTitle(category.title, category)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {premium && (
                    <section className="mb-7">
                        <Link
                            to="/payment"
                            onClick={() => trackEvent(GA4Events.rupees_icon_clicked, {
                                event_label: "premium_card_clicked_on_home_screen"
                            })}
                            className="flex items-center justify-between rounded-2xl bg-[#F9E4EA] px-6 py-5 shadow-[0_10px_26px_rgba(154,40,61,0.08)]"
                        >
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FBEFF2] text-3xl font-bold text-[#9A283D]">₹</span>
                                <div>
                                    <h2 className="font-devanagari text-xl font-bold text-[#9A283D]">{premium.title || "भक्ति भाव प्रीमियम"}</h2>
                                    <p className="font-devanagari mt-1 text-xs text-[#8A7770]">एक दिव्य अनुभव प्राप्त करें</p>
                                </div>
                            </div>
                            <span className="font-eng inline-flex items-center gap-1 rounded-full bg-[#9A283D] px-4 py-2 text-xs font-bold text-white">
                                JOIN <ArrowRight size={14} />
                            </span>
                        </Link>
                    </section>
                )}

                {socialReels.length > 0 && (
                    <section className="mb-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="h-px flex-1 bg-[#9A283D]" />
                            <h2 className="font-eng text-sm font-bold tracking-[0.32em] text-[#9A283D]">SOCIALS</h2>
                            <span className="h-px flex-1 bg-[#9A283D]" />
                        </div>
                        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6">
                            {socialReels.map((reel) => {
                                const thumbnailUrl = normalizeImageUrl(reel.thumbnailUrl);
                                const videoUrl = normalizeImageUrl(reel.videoUrl);

                                return (
                                    <a
                                        key={reel._id || reel.redirectUrl || reel.videoUrl}
                                        href={reel.redirectUrl || homeScreenData?.socialLinks?.instagramUrl || "https://www.instagram.com/bhaktibhavapp"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackEvent(GA4Events.instagram_icon_clicked, {
                                            platform: "instagram",
                                            event_label: "social_reel_clicked_on_home_screen",
                                            id: reel._id
                                        })}
                                        className="relative aspect-[9/16] shrink-0 basis-[43%] max-w-[188px] overflow-hidden rounded-[28px] bg-[#2F2724] shadow-[0_14px_32px_rgba(0,0,0,0.2)] md:basis-[32%] md:max-w-[380px]"
                                    >
                                        {videoUrl ? (
                                            <video
                                                src={videoUrl}
                                                poster={thumbnailUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                preload="auto"
                                                className="h-full w-full bg-[#1B1514] object-contain"
                                            />
                                        ) : (
                                            <img
                                                src={thumbnailUrl}
                                                crossOrigin="anonymous"
                                                alt={stripHtmlTags(reel.title)}
                                                className="h-full w-full bg-[#1B1514] object-contain"
                                            />
                                        )}
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                                        <span className="font-eng absolute left-3 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-[11px] font-bold text-white md:left-5 md:top-5 md:text-lg">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9A283D] md:h-7 md:w-7">
                                                <Instagram size={13} className="md:h-4 md:w-4" />
                                            </span>
                                            Insta Reel
                                        </span>
                                        <div className="absolute inset-x-0 bottom-0 p-3 text-white md:p-6">
                                            <p className="font-devanagari line-clamp-2 text-base font-bold leading-tight drop-shadow md:text-3xl">{reel.title || reel.label || "भक्ति भाव"}</p>
                                            <span className="font-eng mt-3 flex items-center justify-between text-xs font-bold md:mt-6 md:text-2xl">
                                                View on Instagram
                                                <ArrowRight size={18} className="md:h-8 md:w-8" />
                                            </span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                )}

                {!socialReels.length && (
                    <section className="mb-5 rounded-2xl border border-[#F0E4DC] bg-white px-5 py-4 text-[#9A283D]">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} />
                            <p className="font-devanagari text-base font-semibold">नए सोशल वीडियो जल्द उपलब्ध होंगे</p>
                        </div>
                    </section>
                )}
            </main>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-11/12 rounded-xl bg-white shadow-lg md:w-2/4 lg:w-1/3">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-3 top-1 theme_text hover:text-black"
                        >
                            x
                        </button>

                        <div className="max-h-[80vh] overflow-y-auto p-6" style={{ paddingRight: "16px", paddingLeft: "6px" }}>
                            <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#9A283D] bg-[rgba(255,250,244,0.6)] px-5 py-3 font-hindi theme_text">
                                {panchangData.map((col, index) => (
                                    <div key={index} className="text-left text-xl">
                                        {col.items.map((text, itemIndex) => (
                                            <p key={itemIndex} className="mb-2 leading-relaxed">{text}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
                    <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl" style={{ background: "linear-gradient(to bottom, #D4A843 0%, #F5E6C8 40%)" }}>
                        <img
                            src="/img/popup.png"
                            crossOrigin="anonymous"
                            alt="Unlock Bhakti Bhav Plus"
                            className="block h-auto w-full rounded-t-3xl"
                            style={{ width: "100%", display: "block", marginTop: "-12px" }}
                        />
                        <div className="bg-[#F5E6C8] px-5 pb-5 pt-4">
                            <div className="mb-3 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        trackEvent(GA4Events.free_login_cta_clicked, { event_label: "skip_button_clicked" });
                                    }}
                                    className="font-eng flex-1 rounded-2xl bg-white py-3 font-semibold text-[#9A283D] shadow"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        trackEvent(GA4Events.free_login_cta_clicked, { event_label: "free_login_clicked" });
                                        navigate("/login");
                                    }}
                                    className="font-eng flex-1 rounded-2xl bg-[#9A283D] py-3 font-semibold text-white shadow"
                                >
                                    Free Login
                                </button>
                            </div>
                            <p className="font-eng text-center text-sm font-medium text-[#9A283D]">
                                Trusted by Lakhs of Devotees
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isHomeMenuOpen && (
                <div className="fixed inset-0 z-[55] flex bg-black/55" onClick={closeHomeMenu}>
                    <aside
                        className="h-full w-[84%] max-w-[430px] overflow-y-auto rounded-r-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Home menu"
                    >
                        <div className="px-9 pb-8 pt-24">
                            <h2 className="font-devanagari mb-16 text-center text-[34px] font-bold leading-none text-[#9A283D]">
                                भक्ति भाव
                            </h2>

                            <div className="space-y-11">
                                {homeMenuActions.map(({ key, label, Icon, onClick }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleHomeMenuActionClick({ onClick })}
                                        className="font-devanagari flex w-full items-center gap-7 text-left text-[20px] font-normal leading-none text-[#3F3F3F]"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#9A283D]">
                                            {key === "upgrade" ? (
                                                <span className="font-eng text-[32px] font-medium leading-none">₹</span>
                                            ) : (
                                                <Icon size={28} strokeWidth={1.8} />
                                            )}
                                        </span>
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-[#282828] px-9 py-8">
                            <div className="space-y-8">
                                {categoriesToShow.map((category) => (
                                    <Link
                                        key={category._id || category.url || category.title}
                                        to={getCategoryRoute(category)}
                                        state={{
                                            categoryId: category?.categoryId || category?._id,
                                            categoryTitle: category?.title
                                        }}
                                        onClick={(e) => handleHomeMenuCategoryClick(category, e)}
                                        className="font-devanagari flex min-h-[38px] items-center gap-7 text-[20px] font-normal leading-tight text-[#3F3F3F]"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                                            {normalizeImageUrl(category.imageUrl) ? (
                                                <img
                                                    src={normalizeImageUrl(category.imageUrl)}
                                                    crossOrigin="anonymous"
                                                    alt={stripHtmlTags(category.title)}
                                                    className="h-7 w-7 object-contain"
                                                />
                                            ) : (
                                                <BookOpen size={26} className="text-[#9A283D]" />
                                            )}
                                        </span>
                                        <span className="min-w-0">{renderHomeMenuTitle(category.title)}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            <Footer variant="homeNav" />
        </>
    );
}

export default Home;
