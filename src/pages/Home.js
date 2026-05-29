import React, { useState, useEffect, useRef, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import TodayThoughts from "../components/TodayThoughts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { homeSchema } from "../seo/schemas";

import "swiper/css";
import "swiper/css/pagination";
import { homeCategoryApis, profileApis, wallpaperApis, wallpaperDeepLinkingApi } from "../api";
import { getMobileNoFromLS, setUserIdInLS, setUserName, removeSubscriptionStatusFromLS, setSubscriptionStatusInLS, getTokenFromLS, getSubscriptionStatusFromLS, getIsLoggedIn } from "../commonFunctions";
import homeCache from "../utils/homeCache";
// import { trackEventCommonFunction } from "../utils/eventCommonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import SEO from "../components/SEO";
import { LanguageContext } from "../contexts/LanguageContext";
import translation from "../utils/translation.json";

function Home() {


    const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const baseParams = useGA4BaseParams("Home Screen");
    const { trackEvent } = useGA4Tracker(baseParams);
    // Initialize state from cache if available (instant render on back-navigation)
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [panchangData, setPanchangData] = useState(() => {
        // Rebuild from cached raw data if available
        const cachedRaw = homeCache.get("panchangRawData");
        if (cachedRaw) {
            // language not yet available in lazy init, default to "hi"
            return [
                {
                    side: "left",
                    items: [
                        <span><strong>तिथि</strong> % {cachedRaw.tithi.hi || "-"}</span>,
                        <span><strong>नक्षत्र</strong> % {cachedRaw.nakshatra.hi || "-"}</span>,
                        <span><strong>करण</strong> % {cachedRaw.karana.hi || "-"}</span>,
                    ],
                },
                {
                    side: "right",
                    items: [
                        <span><strong>पक्ष</strong> % {cachedRaw.paksha.hi || "-"}</span>,
                        <span><strong>योग</strong> % {cachedRaw.yoga.hi || "-"}</span>,
                        <span><strong>वार</strong> % {cachedRaw.vaar.hi || "-"}</span>,
                    ],
                },
            ];
        }
        return [];
    });
    const [bannersData, setBannersData] = useState(() => homeCache.get("bannersData") || []);
    const [wallpaperImage, setWallpaperImage] = useState(() => homeCache.get("wallpaperImage") || "");
    const [homeCategories, setHomeCategories] = useState(() => homeCache.get("homeCategories") || []);
    const [categoriesLoading, setCategoriesLoading] = useState(() => !homeCache.has("homeCategories"));
    const [wallpaperDeepLinks, setWallpaperDeepLinks] = useState(() => homeCache.get("wallpaperDeepLinks") || []);
    const hasFetchedBanners = useRef(false);
    const hasTrackedScreenView = useRef(false);

    const fallbackHomeCategories = [
        { _id: "hindi-calendar", imageUrl: "./img/icon_2.png", url: "hindi-calendar", title: "fgUnh dySaMj" },
        { _id: "vrat-katha", imageUrl: "./img/icon_3.png", url: "vrat-katha", title: "ozr dFkk" },
        { _id: "jaap-mala", imageUrl: "./img/icon_4.png", url: "jaap-mala", title: "tki ekyk" },
        { _id: "mantra", imageUrl: "./img/icon_5.png", url: "mantra", title: "ea=" },
        { _id: "chalisa", imageUrl: "./img/icon_1.png", url: "chalisa", title: "pkyhlk" },
        { _id: "aarti", imageUrl: "./img/icon_6.png", url: "aarti", title: "vkjrh" }
    ];

    const categoryRouteMap = {
        arti: "aarti",
        "jaap-mala": "newjaapMaala",
        "japp-mala": "newjaapMaala",
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
        }
    };

    const getCategoryRoute = (category) => {
        const url = String(category?.url || "").replace(/^\/+/, "");
        const route = categoryRouteMap[url] || url;
        const categoryId = category?.categoryId || category?._id;

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

    const getWallpaperDeepLinksFromResponse = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    };


    const redirection = {
        "katha": "/vrat-katha",
        "kahaniya": "/kahaniya-details",
        "wallpaper": "/wallpaper",
        "chalisa": "/chalisa",
        "arti": "/aarti",
        "jaapmala": "/jaapmala",
        "mantra": "/mantra"

    }

    const getWallpaperDeepLinkRoute = (item) => {
        // if (item?.categoryRedirect === "katha" && item?.categoryId) {
        //     return `/vrat-katha/categoryDetails/${item.categoryId}`;
        // }

        // else if(item?.categoryRedirect === 'kahaniya' && item?.categoryId) {
        //     return 
        // }

        // else if(item?.categoryRedirect === '') {

        // }
        


        // if (item?.categoryRedirect === "wallpaper" && item?._id) {
        //     return `/wallpaper/${item._id}`;
        // }

        let route = "";
        console.log("GET SUbscription status from LS", getSubscriptionStatusFromLS());
        if(getSubscriptionStatusFromLS()) {
                if(item?.categoryRedirect && item?.categoryId) {
                 route = `${redirection[item.categoryRedirect]}/${item.categoryId}`;
        }
        else if(item?.categoryRedirect) {
            route = `${redirection[item.categoryRedirect]}`;
        }
        }

        

        return route || "/payment";
    };

    // Helper to format raw panchang data into React elements
    const formatPanchangData = (rawData) => [
        {
            side: "left",
            items: [
                <span><strong>तिथि</strong> % {rawData.tithi.hi || "-"}</span>,
                <span><strong>नक्षत्र</strong> % {rawData.nakshatra.hi || "-"}</span>,
                <span><strong>करण</strong> % {rawData.karana.hi || "-"}</span>,
            ],
        },
        {
            side: "right",
            items: [
                <span><strong>पक्ष</strong> % {rawData.paksha.hi || "-"}</span>,
                <span><strong>योग</strong> % {rawData.yoga.hi || "-"}</span>,
                <span><strong>वार</strong> % {rawData.vaar.hi || "-"}</span>,
            ],
        },
    ];


    useEffect(() => {
        if (!isOpen) return;

        // If cached panchang raw data exists, rebuild formatted data from it
        const cachedPanchangRaw = homeCache.get("panchangRawData");
        if (cachedPanchangRaw) {
            const formatted = formatPanchangData(cachedPanchangRaw);
            setPanchangData(formatted);
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
                    const formatted = formatPanchangData(data.data);
                    setPanchangData(formatted);
                    // Cache the raw API data for 30 minutes
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


    }, [isOpen]);

    useEffect(() => {
        // const isLoggedIn = !!getTokenFromLS();
        // const isSubscribed = getSubscriptionStatusFromLS();

        // const params = {
        //     user_id: isLoggedIn ? (getUserIdFromLS() || "logged_in") : "anonymous",
        //     device_id: getDeviceId(),
        //     platform: getBrowserName(),
        //     session_id: getSessionId(),
        //     user_type: isLoggedIn ? (isSubscribed ? "paid" : "free") : "free",
        //     subscription_plan: isLoggedIn ? getSubscriptionPlanFromLS() : "none",
        //     language: "en",
        //     country: "India",
        //     screen_name: "home_screen",
        //     env: "prod",
        //     phone_number: isLoggedIn ? (getMobileNoFromLS() || "none") : "none",
        //     source: "web",
        // };

        // // Delay slightly so Firebase Analytics async init completes before sending
        // const timer = setTimeout(() => {
        //     trackEventCommonFunction("screen_view", params);
        // }, 500);

        // return () => clearTimeout(timer);

        // const baseParams = useGA4BaseParams("panchang_card_clicked_on_home_screen");
        // const { trackEvent } = useGA4Tracker(baseParams);
        // trackEvent("panchang_card_clicked");
        if (!hasTrackedScreenView.current) {
            trackEvent(GA4Events.screen_view);
            hasTrackedScreenView.current = true;
        }
    }, []);

    const phoneNumber = getMobileNoFromLS();

    useEffect(() => {
        let isMounted = true;

        // On language change, clear language-sensitive cache and reset categories state
        homeCache.delete("homeCategories");
        setHomeCategories([]);
        setCategoriesLoading(true);

        // Check cache first for instant render, but continue fetching other home APIs.
        const cachedBanners = homeCache.get("bannersData");
        const cachedWallpaper = homeCache.get("wallpaperImage");
        const shouldUseCachedBanners = cachedBanners && cachedBanners.length > 0;

        if (shouldUseCachedBanners) {
            setBannersData(cachedBanners);
            setWallpaperImage(cachedWallpaper || "");
            hasFetchedBanners.current = true;
        }

        const shouldFetchBanners = !shouldUseCachedBanners && !hasFetchedBanners.current;

        const homeApiPromises = [
            profileApis.getProfile(),
            shouldFetchBanners ? wallpaperApis.getBanners() : Promise.resolve(null),
            homeCategoryApis.fetchHomeCategories(language),
            wallpaperDeepLinkingApi.getWallpaperDeepLinkingData(language)
        ];

        Promise.allSettled(homeApiPromises).then(([profileResult, bannersResult, homeCategoriesResult, wallpaperDeepLinksResult]) => {
            if (!isMounted) return;

            if (profileResult.status === "fulfilled") {
                const resp = profileResult.value;
                if (resp) {
                    setSubscriptionStatusInLS(resp.hasActivePlan);
                    setUserIdInLS(resp._id);
                    setUserName(resp.name === "New User" ? "" : resp.name || "");
                    console.log("Profile data:", resp);
                }
            } else {
                // removeTokenFromLS();
                removeSubscriptionStatusFromLS();
                console.error("Error fetching profile data:", profileResult.reason);
            }

            if (bannersResult.status === "fulfilled" && bannersResult.value) {
                const banners = bannersResult.value;
                console.log("Banners:", banners);

                const homeBanners = banners?.data?.filter(b => b.pageName === "home") || [];
                const wpImage = banners?.data?.find(b => b.pageName === "homewallapaper" && b.imageUrl)?.imageUrl || "";

                setBannersData(homeBanners);
                setWallpaperImage(wpImage);

                // Cache for 30 minutes
                homeCache.set("bannersData", homeBanners);
                homeCache.set("wallpaperImage", wpImage);
                hasFetchedBanners.current = true;
            } else if (bannersResult.status === "rejected") {
                console.error("Error fetching banners:", bannersResult.reason);
            }

            if (homeCategoriesResult.status === "fulfilled") {
                const categories = getHomeCategoriesFromResponse(homeCategoriesResult.value);
                console.log("Home categories:", homeCategoriesResult.value);

                if (categories.length > 0) {
                    setHomeCategories(categories);
                    homeCache.set("homeCategories", categories);
                }
                setCategoriesLoading(false);
            } else {
                console.error("Error fetching home categories:", homeCategoriesResult.reason);
                setCategoriesLoading(false);
            }

            if (wallpaperDeepLinksResult.status === "fulfilled") {
                const deepLinks = getWallpaperDeepLinksFromResponse(wallpaperDeepLinksResult.value);
                console.log("Wallpaper deep linking data:", wallpaperDeepLinksResult.value);

                if (deepLinks.length > 0) {
                    setWallpaperDeepLinks(deepLinks);
                    homeCache.set("wallpaperDeepLinks", deepLinks);
                }
            } else {
                console.error("Error fetching wallpaper deep linking data:", wallpaperDeepLinksResult.reason);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [phoneNumber, language])

    const requireLogin = (e) => {
        if (!getTokenFromLS()) {
            e?.preventDefault();
            setShowLoginModal(true);
            return true;
        }
        return false;
    };
    const handleWallpaperClicked = (e) => {
        if (requireLogin(e)) return;
        trackEvent(GA4Events.wallpaper_widget_clicked, {
            event_label: "wallpaper_card_clicked_on_home_screen"
        });
    };

    const handleWallpaperDeepLinkClicked = (item, e) => {
        if (!item?.isWithoutLoginFree && requireLogin(e)) return;

        trackEvent(GA4Events.wallpaper_widget_clicked, {
            event_label: "wallpaper_deep_linking_card_clicked_on_home_screen",
            id: item?._id,
            categoryId: item?.categoryId,
            categoryRedirect: item?.categoryRedirect
        });
    };

    const handleHomeCategoryClicked = (category, e) => {
        // If isWithoutLoginFree is explicitly false, always show login modal (even if logged in)
        // If isWithoutLoginFree is true or key is absent, require only a valid token
        const isLoggedIn = getIsLoggedIn();
        // needsLogin is true only when:
        // - user is NOT logged in, AND
        // - category explicitly requires login (isWithoutLoginFree === false) OR has no token
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

    const categoriesToShow = homeCategories.length > 0 ? homeCategories : fallbackHomeCategories;

    // Full-page shimmer skeleton shown while categories (and other home data) are loading
    const PageShimmer = () => (
        <div className="container mx-auto mt-8 flex flex-col px-4 md:px-0 animate-pulse">
            {/* Banner shimmer */}
            <div className="bg-gray-200 rounded-xl h-[20vh] md:h-[60vh] w-full mb-4" />

            {/* Rashifal + Panchang row shimmer */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {[0, 1].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow p-3 md:p-6 flex justify-center">
                        <div className="flex flex-col items-center space-y-3 w-full">
                            <div className="w-9 h-9 bg-gray-200 rounded-md" />
                            <div className="h-3 w-3/4 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Category cards shimmer — 6 cards */}
            <div className="grid grid-cols-3 md:gap-4 gap-2 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-3 md:p-6 flex justify-center">
                        <div className="flex flex-col items-center space-y-3 w-full">
                            <div className="w-9 h-9 bg-gray-200 rounded-md" />
                            <div className="h-3 w-3/4 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Wallpaper banner shimmer */}
            <div className="bg-gray-200 rounded-xl h-32 w-full mb-6" />

            {/* Today's Thought + Puja row shimmer */}
            <div className="flex gap-4 flex-row">
                <div className="basis-[60%] md:basis-[70%] bg-gray-200 rounded-xl h-40" />
                <div className="basis-[40%] md:basis-[30%] bg-gray-200 rounded-xl h-40" />
            </div>
        </div>
    );

    return (
        <>
            <SEO
            title = "Best Hindu Devotional App for Daily Puja, Mantras & Aarti | भक्ति भाव"
            description = "Experience devotion with our Hinduism app offering daily devotional content, bhajans, aarti, and online Hindu services. Connect with divine energy every day."
            canonical = "https://bhaktibhav.app/"
            schema = {homeSchema}
            />
            <Header />

            {/* Show full-page shimmer while loading, swap to real content once ready */}
            {categoriesLoading ? <PageShimmer /> : null}

            <div className={`container mx-auto mt-8 flex flex-col px-4 md:px-0 ${categoriesLoading ? "hidden" : ""}`}>
                <section className="bg-[#FFFAF4] rounded-xl text-sm space-y-1 shadow-md">
                    <div className="relative w-full h-[20vh] md:h-[60vh] overflow-hidden">
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            loop={true}
                            className="w-full h-full rounded-xl"
                        >
                            {
                                bannersData?.slice(-1)?.map((banner, index) => (

                                    <SwiperSlide key={index}>
                                        <div
                                            onClick={() => {
                                                const relativePath = new URL(banner.Urls).pathname;
                                                console.log("relativePath", relativePath);
                                                if (!getTokenFromLS()) {
                                                    setShowLoginModal(true);  // Show login modal
                                                    return;
                                                }

                                                // Step 2: Check if user has active subscription
                                                if (!getSubscriptionStatusFromLS()) {
                                                    trackEvent(GA4Events.main_banner_clicked, {
                                                        event_label: "main_banner_clicked_from_home_screen"
                                                    });
                                                    navigate("/payment");  // Redirect to payment
                                                    return;
                                                }

                                                // Step 3: User is logged in + subscribed, navigate normally
                                                trackEvent(GA4Events.main_banner_clicked, {
                                                    event_label: "main_banner_clicked_from_home_screen"
                                                });
                                                navigate(relativePath);

                                            }}
                                            className="h-[20vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center"
                                            style={{ backgroundImage: `url(${banner.imageUrl})` }}
                                        >
                                            {/* <h2 className="text-white text-lg font-bold">{banner.title}</h2> */}
                                        </div>
                                    </SwiperSlide>
                                )
                                )
                            }
                            {/* <SwiperSlide>
                                <div
                                    className="h-[20vh] md:h-[60vh] bg-[url('/img/banner-3.jpeg')] bg-cover bg-center flex items-center justify-center"
                                ></div>
                            </SwiperSlide>

                            <SwiperSlide>
                                <div
                                    className="h-[20vh] md:h-[60vh] bg-[url('/img/banner-5.jpeg')] bg-cover bg-center flex items-center justify-center"
                                ></div>
                            </SwiperSlide> */}
                        </Swiper>
                    </div>
                </section>

                <div className="mt-4 grid grid-cols-2 gap-3">

                    <Link to="/Rashifal"
                        onClick={() => {

                            trackEvent(GA4Events.rashifal_tab_clicked, {
                                event_label: "rashifal_card_clicked_on_home_screen"
                            })
                        }}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img crossOrigin = 'anonymous' src="./img/icon_1.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className={`${language === "hi" ? "font-hindi" : "font-eng"} md:text-2xl text-sm font-normal leading-[14px]`}>{translation[language]?.aajKaRashifal} <br /></p>
                        </div>
                    </Link>
                    <button onClick={(e) => { setIsOpen(true) }}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img  crossOrigin = 'anonymous' src="./img/icon_5.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className={`${language === "hi" ? "font-hindi" : "font-eng"} md:text-2xl text-sm font-normal leading-[14px]`}>{translation[language]?.panchang} <br /></p>
                        </div>
                    </button>
                </div>


                <div className="grid grid-cols-3 md:gap-4 gap-2 mt-3 text-center font-medium">
                    {categoriesToShow.map((category) => (
                            <Link
                                key={category._id || category.url || category.title}
                                to={getCategoryRoute(category)}
                                state={{
                                    categoryId: category?.categoryId || category?._id,
                                    categoryTitle: category?.title
                                }}
                                onClick={(e) => handleHomeCategoryClicked(category, e)}
                                className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex justify-center"
                            >
                                <div className="mx-auto flex w-full flex-col items-center justify-center space-y-3 md:space-y-0">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.title || ""}
                                        width="36"
                                        crossOrigin = 'anonymous'
                                        height="36"
                                        className="w-9 h-9 object-cover rounded-md"
                                    />
                                    <p className={`${language === "hi" ? "font-hindi" : "font-eng"} md:text-2xl text-sm font-normal leading-[14px] text-center w-full mx-auto`}>{category.title}</p>
                                </div>
                            </Link>
                        ))
                    }
                </div>

                <div className="mt-6">
                    {/* Previous wallpaper module code kept for reference as requested.
                    <Link to="/wallpaper" onClick={handleWallpaperClicked} className="relative theme_bg hd_bg rounded-xl flex items-center justify-center rounded-xl font-semibold overflow-hidden 
          hover:bg-yellow-50 transition">

                        <span className="absolute left-[30px] top-[50%] -translate-y-1/2 
	                  bg-[url('/img/icon_7.png')] bg-no-repeat bg-cover w-[70px] h-[70px]"></span>
                        <span className="absolute right-[30px] top-[45%] -translate-y-1/2 
	                  bg-[url('/img/icon_8.png')] bg-no-repeat bg-cover  w-[46px] h-[46px]"></span>

                        <span className="relative z-10 flex items-center">
                            <span className="text-3xl font-normal leading-[20px]">okWyisij <br /><span className="font-eng text-xs">(Wallpaper)</span></span>
                        </span>
                        <img crossOrigin = 'anonymous' src={wallpaperImage} alt="Wallpaper" width="100%" height="100%" className="max-w-full h-auto" />
                    </Link>
                    */}

                    {wallpaperDeepLinks.length > 0 ? (
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            loop={wallpaperDeepLinks.length > 1}
                            className="w-full rounded-xl"
                        >
                            {wallpaperDeepLinks.map((item) => (
                                <SwiperSlide key={item._id}>
                                    <Link
                                        to={getWallpaperDeepLinkRoute(item)}
                                        onClick={(e) => handleWallpaperDeepLinkClicked(item, e)}
                                        className="relative theme_bg hd_bg rounded-xl flex items-center justify-center font-semibold overflow-hidden hover:bg-yellow-50 transition block"
                                    >
                                        <img
                                            crossOrigin="anonymous"
                                            src={item.image || item.imagethumb}
                                            alt="Wallpaper"
                                            width="100%"
                                            height="100%"
                                            className="max-w-full h-auto"
                                        />
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <Link to="/wallpaper" onClick={handleWallpaperClicked} className="relative theme_bg hd_bg rounded-xl flex items-center justify-center font-semibold overflow-hidden hover:bg-yellow-50 transition">
                            <img crossOrigin="anonymous" src={wallpaperImage} alt="Wallpaper" width="100%" height="100%" className="max-w-full h-auto" />
                        </Link>
                    )}
                </div>

                <div className="mt-6 flex gap-4 flex-row">
                    <TodayThoughts />
                    <div className="md:basis-[40%] basis-[40%] flex flex-col justify-between items-center md:p-4 theme_text">
                        <span className="font-semibold md:text-3xl text-2xl">iwtk djs!</span>
                        <div className="my-4"><img crossOrigin = 'anonymous' src="./img/puja_bgs.png" alt="" width="150" height="120" className="max-w-full h-auto" /></div>
                        <Link to="/puja-kare" onClick={() => {
                            trackEvent(GA4Events.pooja_karein_widget_clicked, {
                                event_label: "pooja_kare_card_clicked_on_home_screen"
                            });
                        }} className="relative bg-[#6d001f] bg-[url('/img/btn_icon_1.png'), 
          url('/img/btn_icon_1.png')] text-white text-center px-4 py-2 rounded-full font-eng md:text-lg text-sm md:w-[70%] w-full
                      hover:scale-105 transition-all duration-300 ease-in-out">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 
                      bg-[url('/img/btn_icon_1.png')] bg-no-repeat bg-contain w-[14px] h-[14px]"></span>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 
                      bg-[url('/img/btn_icon_2.png')] bg-no-repeat bg-contain  w-[14px] h-[14px]"></span>
                            Click here
                        </Link>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/4 lg:w-1/3 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-1 right-3 theme_text hover:text-black"
                        >
                            ✕
                        </button>

                        <div className="p-6 max-h-[80vh] overflow-y-auto" style={{ paddingRight: '16px', paddingLeft: '6px' }}>
                            <div className="grid grid-cols-2 gap-4 px-5 py-3 border border-[#9A283D] bg-[rgba(255,250,244,0.6)] font-hindi theme_text rounded-xl">
                                {panchangData.map((col, index) => (
                                    <div key={index} className="text-xl text-left">
                                        {col.items.map((text, i) => {
                                            console.log({ text });
                                            return (
                                                <p key={i} className="mb-2 leading-relaxed">{text}</p>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Gate Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
                    <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(to bottom, #D4A843 0%, #F5E6C8 40%)" }}>
                        {/* Top image — fills full width, contains bell + title + Hindi text */}
                        <img
                            src="/img/popup.png"
                            crossOrigin = 'anonymous'
                            alt="Unlock Bhakti Bhav Plus"
                            className="w-full h-auto block rounded-t-3xl"
                            style={{ width: "100%", display: "block", marginTop: "-12px", }}
                        />
                        {/* Buttons + trust text on cream background */}
                        <div className="px-5 pt-4 pb-5 bg-[#F5E6C8]">
                            <div className="flex gap-3 mb-3">
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        trackEvent(GA4Events.free_login_cta_clicked, { event_label: "free_login_skipped" });
                                        // If user arrived via /home-v1, redirect to "/" on skip
                                        if (sessionStorage.getItem("loginSource") === "home-v1") {
                                            sessionStorage.removeItem("loginSource");
                                            navigate("/");
                                        }
                                    }}
                                    className="flex-1 bg-white text-[#9A283D] font-eng font-semibold py-3 rounded-2xl shadow"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => { setShowLoginModal(false); trackEvent(GA4Events.free_login_cta_clicked, { event_label: "free_login_clicked" }); navigate("/login"); }}
                                    className="flex-1 bg-[#9A283D] text-white font-eng font-semibold py-3 rounded-2xl shadow"
                                >
                                    Free Login
                                </button>
                            </div>
                            <p className="text-center text-[#9A283D] font-eng text-sm font-medium">
                                Trusted by Lakhs of Devotees
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>

    );
}

export default Home;
