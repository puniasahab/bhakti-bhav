import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import PageTitleCard from "../components/PageTitleCard";

function VratKathaCategoryDetails({ detail }) {
    const { id } = useParams();
    // const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const audioRef = useRef(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // useEffect(() => {
    //     if (!id) return;
    //     console.log("Fetching katha with id:", id);

    //     fetch(`https://api.bhaktibhav.app/frontend/katha/${id}`)
    //         .then((res) => res.json())
    //         .then((resJson) => {
    //             if (resJson.status === "success" && resJson.data) {
    //                 let parsed = { ...resJson.data };
    //                 console.log("Fetched katha:", parsed);
    //                 try {
    //                     parsed.paksh = JSON.parse(resJson.data.paksh);
    //                     parsed.time = JSON.parse(resJson.data.time);
    //                     parsed.mantra = JSON.parse(resJson.data.mantra);
    //                 } catch (e) {
    //                     console.warn("Error parsing JSON fields:", e);
    //                 }
    //                 setDetail(parsed);
    //             } else {
    //                 setDetail(null);
    //                 alert("No data found!");
    //             }
    //             setLoading(false);
    //         })
    //         .catch((err) => {
    //             console.error("Error fetching katha:", err);
    //             setDetail(null);
    //             setLoading(false);
    //         });
    // }, [id]);

    const redirectToAartiPage = (artiId) => {
        if (!artiId) {
            // alert("No Arti ID available for this Katha.");
            return "/aarti";
        }

        return `/aarti/${artiId}`;
    };

    const handlePlay = (url) => {
        if (!url) return;
        
        // If audio player is already showing for this audio
        if (currentAudio === url && showAudioPlayer) {
            // Hide the audio player and stop audio
            if (audioRef.current) {
                audioRef.current.pause();
                // Clear event listeners before setting to null
                audioRef.current.onloadedmetadata = null;
                audioRef.current.ontimeupdate = null;
                audioRef.current.onended = null;
                audioRef.current.onpause = null;
                audioRef.current.onplay = null;
                audioRef.current = null;
            }
            setShowAudioPlayer(false);
            setCurrentAudio(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        } else {
            // Show audio player and start playing
            if (audioRef.current) {
                audioRef.current.pause();
                // Clear existing event listeners
                audioRef.current.onloadedmetadata = null;
                audioRef.current.ontimeupdate = null;
                audioRef.current.onended = null;
                audioRef.current.onpause = null;
                audioRef.current.onplay = null;
            }
            
            audioRef.current = new Audio(url);
            setCurrentAudio(url);
            setShowAudioPlayer(true);
            setIsPlaying(true);
            audioRef.current.play();

            // Audio event listeners
            audioRef.current.onloadedmetadata = () => {
                if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                }
            };

            audioRef.current.ontimeupdate = () => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current?.currentTime);
                }
            };

            audioRef.current.onended = () => {
                // Auto-hide when audio completes
                setCurrentAudio(null);
                setShowAudioPlayer(false);
                setIsPlaying(false);
                setCurrentTime(0);
                setDuration(0);
            };

            audioRef.current.onpause = () => {
                setIsPlaying(false);
            };

            audioRef.current.onplay = () => {
                setIsPlaying(true);
            };
        }
    };

    const handlePlayerPlayPause = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleCloseAudioPlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            // Clear event listeners before setting to null
            audioRef.current.onloadedmetadata = null;
            audioRef.current.ontimeupdate = null;
            audioRef.current.onended = null;
            audioRef.current.onpause = null;
            audioRef.current.onplay = null;
            audioRef.current = null;
        }
        setCurrentAudio(null);
        setShowAudioPlayer(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    };

    const handleSeek = (e) => {
        if (audioRef.current && duration > 0) {
            const seekTime = (e.target.value / 100) * duration;
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
    if (!detail) return <p className="text-center py-10 theme_text">❌ No data found!</p>;

    return (
        <>
            <Header 
                showProfileHeader={true}
                profileText="भक्ति भाव"
                hideEditIcon={true}
            />
            <PageTitleCard
                titleHi={detail.name.hi}
                titleEn={detail.name.en}
                customEngFontSize={"13px"}
                customFontSize={"18px"}
                
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
                            onClick={() => handlePlay(detail.audioUrl)}
                            disabled={!detail.audioUrl}
                            className={`px-6 py-2 flex items-center justify-center rounded-full 
                             transition font-hindi ${!detail.audioUrl
                                    ? "bg-[#9A283D]/50 text-white cursor-not-allowed"
                                    : showAudioPlayer
                                        ? "bg-red-600 text-white"
                                        : "bg_theme text-white"
                                }`}
                        >
                            {showAudioPlayer ? (
                                <>
                                    <span className="audio_pause_icon mr-2"></span> can djsa
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

                {/* Audio Player Preview */}
                {showAudioPlayer && (
                    <div className="flex justify-center mt-6">
                        <div className="bg-white border-2 border-[#9A283D] rounded-xl p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-hindi text-[#9A283D] font-semibold text-sm">dFkk प्लेयर</h3>
                                <button 
                                    onClick={handleCloseAudioPlayer}
                                    className="text-[#9A283D] hover:text-red-600 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handlePlayerPlayPause}
                                    className="bg-[#9A283D] text-white rounded-full p-3 hover:bg-[#7A1F2D] transition-colors duration-200 flex-shrink-0"
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={duration ? (currentTime / duration) * 100 : 0}
                                        onChange={handleSeek}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #9A283D 0%, #9A283D ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-eng">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center my-8 text-xl">
                    <p className={`${language === "hi"  ? " font-hindi" : "hidden"} text-[#9A283D] ${fontSize}`}>{detail.mantra?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[#9A283D] ${fontSize}`}>{detail.mantra?.hi}</p>
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
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `}>
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl">iwtk fof/k </span>
                        ) : (
                            <span className="font-eng"> Puja Vidhi </span>

                        )}
                    </h2>

                    {language === "hi"
                        ? detail.pujaVidhi?.hi?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line.replace(/,/g, '•').replace(/\(/g, "¼").replace(/\)/g, "½")}
                            </p>
                        ))
                        : detail.pujaVidhi?.en?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line}
                            </p>
                        ))}

                </div>

                <div className="mb-4">
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `}>
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
                                        {item.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%")}
                                    </li>
                                ))
                                : detail.pujaSamagri?.hi
                                    ?.split(/\n|,/)
                                    .map((item, i) => (
                                        <li key={`hi-${i}`} className="font-hindi">
                                            {item.trim().replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%")}
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
                    <h2 className={`text-xl font-semibold mb-4 ${fontSize} `} >
                        {language === "hi" ? (
                            <span className="font-hindi text-2xl"> dFkk </span>
                        ) : (
                            <span className="font-eng">Katha</span>
                        )}

                    </h2>
                    {language === "hi"
                        ? <div className = {`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.hi.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%") }} />
                        : <div className = {`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.en }} />
                    }
                </div>

                <div className="mt-4 w-full text-center">
                    <a href={redirectToAartiPage(detail.artiId)}
                        className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow inline-flex items-center"
                    >
                        <span className="audio_icon mr-2"></span> vkjrh
                    </a>
                </div>
            </div>
            
        </>
    );
}

export default VratKathaCategoryDetails;
