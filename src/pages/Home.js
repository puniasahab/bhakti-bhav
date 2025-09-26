import React, { useState, useContext, useEffect, } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import TodayThoughts from "../components/TodayThoughts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { LanguageContext } from "../contexts/LanguageContext";

import "swiper/css";
import "swiper/css/pagination";

function Home() {

    const [isOpen, setIsOpen] = useState(false);
    const { language, fontSize } = useContext(LanguageContext);
    const [panchangData, setPanchangData] = useState([]);
    // const panchangData = [
    //     {
    //         side: "left",
    //         items: ["frfFk % prqnZ'kh", "u{k= % e?kk", 'dj.k % fo"V'],
    //     },
    //     {
    //         side: "right",
    //         items: ['i{k % d`".k', ";ksx % lk?;", "okj % 'kfuokj"],
    //     },
    // ];




    useEffect(() => {
        if (!isOpen) return;

        const fetchPanchang = async () => {
            try {
                const res = await fetch("https://api.bhaktibhav.app/frontend/daily-panchang");
                const data = await res.json();

                if (data?.status === "success" && data.data) {

                    const formatted = [
                        {
                            side: "left",
                            items: [
                                `तिथि % ${data.data.tithi || "-"}`,
                                `नक्षत्र % ${data.data.nakshatra || "-"}`,
                                `करण % ${data.data.karan || "-"}`,
                            ],
                        },
                        {
                            side: "right",
                            items: [
                                `पक्ष % ${data.data.paksha || "-"}`,
                                `योग % ${data.data.yoga || "-"}`,
                                `वार % ${data.data.var || "-"}`,
                            ],
                        },
                    ];
                    setPanchangData(formatted);
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
                            <SwiperSlide>
                                <div
                                    className="h-[20vh] md:h-[60vh] bg-[url('/img/banner-3.jpg')] bg-cover bg-center flex items-center justify-center"
                                ></div>
                            </SwiperSlide>

                            <SwiperSlide>
                                <div
                                    className="h-[20vh] md:h-[60vh] bg-[url('/img/banner-1.jpg')] bg-cover bg-center flex items-center justify-center"
                                ></div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </section>

                <div className="mt-4 grid grid-cols-2 gap-3">

                    <Link to="/Rashifal"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_1.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">vkt dk jkf'kQy <br /><span className="font-eng text-xs">(Aaj Ka Rashifal)</span></p>
                        </div>
                    </Link>
                    <button onClick={() => setIsOpen(true)}
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_5.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">iapkx <br /><span className="font-eng text-xs">(Panchang)</span></p>
                        </div>
                    </button>
                </div>


                <div className="grid grid-cols-3 md:gap-4 gap-2 mt-3 text-center font-medium">

                    <Link to="/hindi-calendar"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_2.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">fgUnh dySaMj <br /><span className="font-eng text-xs">(Hindi Calender)</span></p>
                        </div>
                    </Link>
                    <Link to="/vrat-katha"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_3.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> dFkk <br /><span className="font-eng text-xs">(Katha)</span></p>

                        </div>

                    </Link>
                    <Link to="/jaap-mala"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_4.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> tki ekyk <br /><span className="font-eng text-xs">(Jaap Mala)</span></p>
                        </div>
                    </Link>
                </div>
                <div className="grid grid-cols-3 md:gap-4 gap-2 mt-3 text-center font-medium">

                    <Link to="/mantra"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_5.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]">ea=<br /><span className="font-eng text-xs">(Mantra)</span></p>
                        </div>
                    </Link>
                    <Link to="/chalisa"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_1.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> pkyhlk  <br /><span className="font-eng text-xs">(Chalisa)</span></p>

                        </div>

                    </Link>
                    <Link to="/aarti"
                        className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
                        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
                            <img src="./img/icon_6.png" alt="" width="36" height="36" className="md:mr-3" />
                            <p className="md:text-2xl text-lg font-normal leading-[20px]"> vkjrh <br /><span className="font-eng text-xs">(Aarti)</span></p>
                        </div>
                    </Link>
                </div>

                <div className="mt-6">
                    <Link to="/wallpaper" className="relative theme_bg hd_bg rounded-xl flex items-center justify-center rounded-xl font-semibold overflow-hidden px-12 py-6 
          hover:bg-yellow-50 transition">

                        <span className="absolute left-[30px] top-[50%] -translate-y-1/2 
                  bg-[url('/img/icon_7.png')] bg-no-repeat bg-cover w-[70px] h-[70px]"></span>
                        <span className="absolute right-[30px] top-[45%] -translate-y-1/2 
                  bg-[url('/img/icon_8.png')] bg-no-repeat bg-cover  w-[46px] h-[46px]"></span>

                        <span className="relative z-10 flex items-center">
                            <span className="text-3xl font-normal leading-[20px]">okWyisij <br /><span className="font-eng text-xs">(Wallpaper)</span></span>
                        </span>
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

                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 p-3 border border-[#9A283D] bg-[rgba(255,250,244,0.6)] font-hindi theme_text rounded-xl">
                                {panchangData.map((col, index) => (
                                    <div key={index} className="text-left pr-2 text-xl">
                                        {col.items.map((text, i) => (
                                            <p key={i}>{text}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>

    );
}

export default Home;
