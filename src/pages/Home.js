import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import TodayThoughts from "../components/TodayThoughts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom"; 

import "swiper/css";
import "swiper/css/pagination";
import { profileApis, wallpaperApis } from "../api";
import { removeTokenFromLS, getMobileNoFromLS, removeSubscriptionStatusFromLS, setSubscriptionStatusInLS, getTokenFromLS } from "../commonFunctions";
import homeCache from "../utils/homeCache";

function Home() {


    const navigate = useNavigate();

    // Initialize state from cache if available (instant render on back-navigation)
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [panchangData, setPanchangData] = useState(() => {
        // Rebuild from cached raw data if available
        const cachedRaw = homeCache.get("panchangRawData");
        if (cachedRaw) {
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
    const hasFetchedBanners = useRef(false);

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

    const phoneNumber = getMobileNoFromLS();

    useEffect(() => {
        
        const fetchProfileData = async () => {
            try {
                const resp = await profileApis.getProfile();
                if (resp) {

                    setSubscriptionStatusInLS(resp.hasActivePlan)
                    // Handle successful response
                    console.log("Profile data:", resp);
                }
            } catch (error) {
                removeTokenFromLS();
                removeSubscriptionStatusFromLS();
                console.error("Error fetching profile data:", error);
            }
        }
        fetchProfileData();

        // Skip banner fetch if we already have cached data
        if (hasFetchedBanners.current && bannersData.length > 0) return;

        // Check cache first for instant render
        const cachedBanners = homeCache.get("bannersData");
        const cachedWallpaper = homeCache.get("wallpaperImage");

        if (cachedBanners && cachedBanners.length > 0) {
            setBannersData(cachedBanners);
            setWallpaperImage(cachedWallpaper || "");
            hasFetchedBanners.current = true;
            return;
        }

        const fetchBanners = async () => {
            try {
                const banners = await wallpaperApis.getBanners();
                console.log("Banners:", banners);

                const homeBanners = banners?.data.filter(b => b.pageName === "home") || [];
                const wpImage = banners?.data.find(b => b.pageName === "homewallapaper" && b.imageUrl)?.imageUrl || "";

                setBannersData(homeBanners);
                setWallpaperImage(wpImage);

                // Cache for 30 minutes
                homeCache.set("bannersData", homeBanners);
                homeCache.set("wallpaperImage", wpImage);
                hasFetchedBanners.current = true;
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };

        fetchBanners();
    }, [phoneNumber])

    const requireLogin = (e) => {
        if (!getTokenFromLS()) {
            e?.preventDefault();
            setShowLoginModal(true);
            return true;
        }
        return false;
    };

    return (
        <>
            <Header />
            <div className="container mx-auto mt-4 flex flex-col px-4 md:px-0">
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
                                                navigate(relativePath);
                                            }}
                                            className="h-[20vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center"
                                            style={{ backgroundImage: `url(${banner.imageUrl})` }}
                                        >
                                            {/* <h2 className="text-white text-lg font-bold">{banner.title}</h2> */}
                                        </div>
                                    </SwiperSlide>
                                ))
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

                    <Link to="/Rashifal" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_1.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">vkt dk jkf'kQy <br /><span className="font-eng text-xs">(Aaj Ka Rashifal)</span></p>
                        </div>
                    </Link>
                    <button onClick={(e) => { if (!requireLogin(e)) setIsOpen(true); }}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_5.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">iapkx <br /><span className="font-eng text-xs">(Panchang)</span></p>
                        </div>
                    </button>
                </div>


                <div className="grid grid-cols-3 md:gap-4 gap-2 mt-3 text-center font-medium">

                    <Link to="/hindi-calendar" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_2.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">fgUnh dySaMj <br /><span className="font-eng text-xs">(Hindi Calender)</span></p>
                        </div>
                    </Link>
                    <Link to="/vrat-katha" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_3.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">ozr dFkk <br /><span className="font-eng text-xs">(Vrat Katha)</span></p>

                        </div>

                    </Link>
                    <Link to="/jaap-mala" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_4.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> tki ekyk <br /><span className="font-eng text-xs">(Jaap Mala)</span></p>
                        </div>
                    </Link>
                </div>
                <div className="grid grid-cols-3 md:gap-4 gap-2 mt-3 text-center font-medium">

                    <Link to="/mantra" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_5.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">ea=<br /><span className="font-eng text-xs">(Mantra)</span></p>
                        </div>
                    </Link>
                    <Link to="/chalisa" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_1.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> pkyhlk  <br /><span className="font-eng text-xs">(Chalisa)</span></p>

                        </div>

                    </Link>
                    <Link to="/aarti" onClick={requireLogin}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_6.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> vkjrh <br /><span className="font-eng text-xs">(Aarti)</span></p>
                        </div>
                    </Link>
                </div>

                <div className="mt-6">
                    <Link to="/wallpaper" className="relative theme_bg hd_bg rounded-xl flex items-center justify-center rounded-xl font-semibold overflow-hidden 
          hover:bg-yellow-50 transition">

                        {/* <span className="absolute left-[30px] top-[50%] -translate-y-1/2 
                  bg-[url('/img/icon_7.png')] bg-no-repeat bg-cover w-[70px] h-[70px]"></span>
                        <span className="absolute right-[30px] top-[45%] -translate-y-1/2 
                  bg-[url('/img/icon_8.png')] bg-no-repeat bg-cover  w-[46px] h-[46px]"></span>

                        <span className="relative z-10 flex items-center">
                            <span className="text-3xl font-normal leading-[20px]">okWyisij <br /><span className="font-eng text-xs">(Wallpaper)</span></span>
                        </span> */}
                        <img src={wallpaperImage} alt="Wallpaper" width="100%" height="100%" className="max-w-full h-auto" />
                    </Link>
                </div>

                <div className="mt-6 flex gap-4 flex-row">
                    <TodayThoughts />
                    <div className="md:basis-[40%] basis-[40%] flex flex-col justify-between items-center md:p-4 theme_text">
                        <span className="font-semibold md:text-3xl text-2xl">iwtk djs!</span>
                        <div className="my-4"><img src="./img/puja_bgs.png" alt="" width="150" height="120" className="max-w-full h-auto" /></div>
                        <Link to="/puja-kare" className="relative bg-[#6d001f] bg-[url('/img/btn_icon_1.png'), 
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
                    <div className=" relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-[#F5E6C8]">
                        {/* Top image — fills full width, contains bell + title + Hindi text */}
                        <img
                            src="/img/popup.png"
                            alt="Unlock Bhakti Bhav Plus"
                            className="w-full h-full object-cover"
                            style={{ width: "100%", display: "block" }}
                        />
                        {/* Buttons + trust text on cream background */}
                        <div className="px-5 pt-4 pb-5 bg-[#F5E6C8]">
                            <div className="flex gap-3 mb-3">
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 bg-white text-[#9A283D] font-eng font-semibold py-3 rounded-2xl shadow"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => { setShowLoginModal(false); navigate("/login"); }}
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
