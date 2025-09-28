import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import PageTitleCard from "../components/PageTitleCard";

function VratKathaDetail() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const audioRef = useRef(null);
    const [currentAudio, setCurrentAudio] = useState(null);

    useEffect(() => {
        if (!id) return;
        console.log("Fetching katha with id:", id);

        fetch(`https://api.bhaktibhav.app/frontend/katha/${id}`)
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.status === "success" && resJson.data) {
                    let parsed = { ...resJson.data };
                    console.log("Fetched katha:", parsed);
                    try {
                        parsed.paksh = JSON.parse(resJson.data.paksh);
                        parsed.time = JSON.parse(resJson.data.time);
                        parsed.mantra = JSON.parse(resJson.data.mantra);
                    } catch (e) {
                        console.warn("Error parsing JSON fields:", e);
                    }
                    setDetail(parsed);
                } else {
                    setDetail(null);
                    alert("No data found!");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching katha:", err);
                setDetail(null);
                setLoading(false);
            });
    }, [id]);

    const handlePlay = (url) => {
        if (!url) return;
        if (currentAudio === url) {
            audioRef.current.pause();
            setCurrentAudio(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(url);
            audioRef.current.play();
            setCurrentAudio(url);

            audioRef.current.onended = () => {
                setCurrentAudio(null);
            };
        }
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
    if (!detail) return <p className="text-center py-10 theme_text">❌ No data found!</p>;

    return (
        <>
            <Header pageName={{ hi: "dFkk", en: "Katha" }} hindiFontSize="true" />
            <PageTitleCard
                titleHi={detail.name.hi}
                titleEn={detail.name.en}
                textSize="text-lg"
            />

            <div className="container mx-auto px-4 pb-6 theme_text">
                {detail.imageUrl && (
                    <div className="flex justify-center mt-4">
                        <img
                            src={`${detail.imageUrl}`}
                            alt={detail.name?.en}
                            className="w-60 h-60 object-cover rounded-xl shadow-lg border-4 border-white bg-[#690016]"
                        />
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <div className="bg-[rgba(255,250,244,0.6)] shadow rounded-lg px-6 py-3 md:flex-row gap-4 text-center border border-[#9A283D]">
                        <div className="flex justify-center items-center">
                            <p className="font-semibold text-black text-sm">प्रारंभ %</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.start).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-center items-center">
                            <p className="font-semibold text-black text-sm">समाप्त %</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.end).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <div className="mt-4">

                        <button className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center font-hindi">
                            <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> 'ks;j djsa
                        </button>
                    </div>


                    <div className="mt-4">
                        <button
                            onClick={() => handlePlay(detail.audioUrl?.hi)}
                            disabled={!detail.audioUrl?.hi}
                            className={`p-2 flex items-center justify-center rounded-full 
                             transition font-hindi ${!detail.audioUrl?.hi
                                    ? "bg-[#9A283D]/50 text-white cursor-not-allowed"
                                    : currentAudio === detail.audioUrl?.hi
                                        ? "bg_theme text-white"
                                        : "bg_theme text-white"
                                }`}
                        >
                            {currentAudio === detail.audioUrl?.hi ? (
                                <>
                                    <span className="audio_pause_icon mr-2"></span> dFkk lqusa
                                </>
                            ) : (
                                <>
                                    <span className="audio_icon mr-2"></span> dFkk lqusa
                                </>
                            )}
                        </button>

                        <audio ref={audioRef} className="hidden">
                            <source src={detail.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>

                <div className="text-center my-4 text-2xl">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[#9A283D] ${fontSize}`}>{detail.mantra?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[#9A283D] ${fontSize}`}>{detail.mantra?.en}</p>
                </div>

                <div className="mb-4">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.en}</p>

                </div>

                <div className="mb-4">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.en}</p>
                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-3 ${fontSize} `}>
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl">iwtk fof/k </span>
                        ) : (
                            <span className="font-eng"> Puja Vidhi </span>

                        )}
                    </h2>

                    {language === "hi"
                        ? detail.pujaVidhi?.hi?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line.replace(/,/g, '•')}
                            </p>
                        ))
                        : detail.pujaVidhi?.en?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line}
                            </p>
                        ))}

                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-3 ${fontSize} `}>
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl">iwtk lkexzh</span>
                        ) : (
                            <span className="font-eng">Puja Samagri</span>
                        )}

                    </h2>
                    <ul className={`list-inside text-[rgba(0,0,0,0.7)] ${fontSize} `}>
                        {language === "hi"
                            ? Array.isArray(detail.pujaSamagri?.hi)
                                ? detail.pujaSamagri.hi.map((item, i) => (
                                    <li key={`hi-${i}`} className="font-hindi">
                                        {item.replace(/,/g, "]")}
                                    </li>
                                ))
                                : detail.pujaSamagri?.hi
                                    ?.split(/\n|,/)
                                    .map((item, i) => (
                                        <li key={`hi-${i}`} className="font-hindi">
                                            {item.trim().replace(/,/g, "]")}
                                        </li>
                                    ))
                            : Array.isArray(detail.pujaSamagri?.en)
                                ? detail.pujaSamagri.en.map((item, i) => (
                                    <li key={`en-${i}`} className="font-eng">
                                        {item.replace(/,/g, ",")}
                                    </li>
                                ))
                                : detail.pujaSamagri?.en
                                    ?.split(/\n|,/)
                                    .map((item, i) => (
                                        <li key={`en-${i}`} className="font-eng">
                                            {item.trim().replace(/,/g, ",")}
                                        </li>
                                    ))}

                    </ul>


                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-3 ${fontSize} `} >
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl"> dFkk egRo </span>
                        ) : (
                            <span className="font-eng">katha Mahatva</span>
                        )}

                    </h2>
                    {language === "hi"
                        ? <div className = {`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.hi }} />
                        : <div className = {`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.en }} />
                    }
                </div>

                <div className="mt-4 w-full text-center">
                    <a href="/aarti"
                        className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow inline-flex items-center"
                    >
                        <span className="audio_icon mr-2"></span> vkjrh
                    </a>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default VratKathaDetail;
