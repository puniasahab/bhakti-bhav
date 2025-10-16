import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import PageTitleCard from "../components/PageTitleCard";

import { useLocation } from "react-router-dom";

function VratKathaDetail() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const { play, pause, stop, isPlaying, currentTrack } = useAudio();
    const location = useLocation();

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

    const redirectToAartiPage = (artiId) => {
        if (!artiId) {
            // alert("No Arti ID available for this Katha.");
            return "/aarti";
        }

        return `/aarti/${artiId}`;
    };

    const handlePlay = (url) => {
        if (!url) return;

        // Check if this katha is currently playing
        if (currentTrack === url && isPlaying) {
            pause();
        } else {
            // Store katha name for the global player
            localStorage.setItem('currentTrackName', detail.name?.hi || detail.name?.en || 'कथा');
            play(url);
        }
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
    if (!detail) return <p className="text-center py-10 theme_text">❌ No data found!</p>;

    const jsonFile = {
        "share": {
            "hi": "'ks;j djsa",
            "en": "Share"
        },
        "listen": {
            "hi": "dFkk lqusa",
            "en": "Listen"
        },
        "pause": {
            "hi": "can djsa",
            "en": "Pause"
        },
        "aarti": {
            "hi": "vkjrh",
            "en": "Aarti"
        },
        "timings": {
            "start": {
                "hi": "प्रारंभ",
                "en": "Start"
            },
            "end": {
                "hi": "समाप्त",
                "en": "End"
            }
        },
        "player": {
            "hi": "कथा प्लेयर",
            "en": "Katha Player"
        }
    }

    const shareText = `🌸 ${detail.name?.en || "Katha"} 🌸\n\n${detail.text?.en || ""}\n\nListen here: ${window.location.href}`;
    
    const generateShareTemplate = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match mobile aspect ratio
        canvas.width = 400;
        canvas.height = 700;
        
        // Create background matching home_bg.png - light cream/white gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#FFF8F0'); // Light cream at top
        bgGradient.addColorStop(0.3, '#FFFEF7'); // White-cream
        bgGradient.addColorStop(0.7, '#FFF5E6'); // Light cream
        bgGradient.addColorStop(1, '#F5F5F5'); // Very light grey at bottom
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load and draw the bell image
        try {
            const bellImage = new Image();
            bellImage.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                bellImage.onload = resolve;
                bellImage.onerror = reject;
                bellImage.src = './img/bell_ring.png';
            });
            
            const bellAreaWidth = canvas.width * 0.19;
            const bellAreaHeight = 240 * (canvas.height / 700);
            
            ctx.drawImage(
                bellImage, 
                18, 
                12, 
                bellAreaWidth, 
                bellAreaHeight
            );
            
        } catch (error) {
            console.warn('Bell image failed to load');
        }
        
        // Logo area
        ctx.fillStyle = '#9A283D';
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'center';
        const logoY = 120 * (canvas.height / 700);
        ctx.fillText('भक्ति भाव', canvas.width / 2, logoY);
        
        // Main deity image (if available)
        if (detail.imageUrl) {
            try {
                const deityImage = new Image();
                deityImage.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    deityImage.onload = resolve;
                    deityImage.onerror = reject;
                    deityImage.src = detail.imageUrl;
                });
                
                // Draw deity image in center
                const imgSize = 120;
                const imgX = (canvas.width - imgSize) / 2;
                const imgY = 180;
                
                // Create circular clip for deity image
                ctx.save();
                ctx.beginPath();
                ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(deityImage, imgX, imgY, imgSize, imgSize);
                ctx.restore();
                
            } catch (error) {
                console.warn('Deity image failed to load');
            }
        }
        
        // Katha title
        ctx.fillStyle = '#9A283D';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        const titleY = 330;
        
        // Word wrap for katha name
        const kathaName = detail.name?.hi || detail.name?.en || "व्रत कथा";
        const words = kathaName.split(' ');
        let line = '';
        let y = titleY;
        const maxWidth = canvas.width - 60;
        const lineHeight = 30;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), canvas.width / 2, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), canvas.width / 2, y);
        
        // Subtitle - Putarda Ekadashi style
        ctx.fillStyle = '#2C3E50';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(Putarda Ekadashi)', canvas.width / 2, y + 35);
        
        // Timing information
        ctx.fillStyle = '#9A283D';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        
        const timingY = y + 70;
        const startTime = new Date(detail.time?.start).toLocaleTimeString('hi-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const endTime = new Date(detail.time?.end).toLocaleTimeString('hi-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Timing boxes
        ctx.fillStyle = 'rgba(255,250,244,0.8)';
        ctx.fillRect(50, timingY - 15, 120, 25);
        ctx.fillRect(230, timingY - 15, 120, 25);
        
        ctx.strokeStyle = '#9A283D';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, timingY - 15, 120, 25);
        ctx.strokeRect(230, timingY - 15, 120, 25);
        
        ctx.fillStyle = '#9A283D';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`प्रारंभ: ${startTime}`, 110, timingY);
        ctx.fillText(`समाप्त: ${endTime}`, 290, timingY);
        
        // "Click here to read" text
        ctx.fillStyle = '#6A1B9A';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click here to read', canvas.width / 2, timingY + 50);
        
        // Page URL
        const pageUrl = window.location.href;
        ctx.fillStyle = '#2C3E50';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        // Truncate URL if too long
        let displayUrl = pageUrl;
        if (pageUrl.length > 50) {
            displayUrl = pageUrl.substring(0, 47) + '...';
        }
        ctx.fillText(displayUrl, canvas.width / 2, timingY + 75);
        
        // Bottom branding section
        const brandingY = canvas.height - 80;
        
        // Yellow background box for logo
        ctx.fillStyle = '#FFD65A';
        const logoBoxWidth = 98;
        const logoBoxHeight = 58.5;
        const logoBoxX = (canvas.width / 2) - 120;
        const logoBoxY = brandingY;
        
        // Rounded rectangle
        const borderRadius = 6;
        ctx.beginPath();
        ctx.moveTo(logoBoxX + borderRadius, logoBoxY);
        ctx.lineTo(logoBoxX + logoBoxWidth - borderRadius, logoBoxY);
        ctx.quadraticCurveTo(logoBoxX + logoBoxWidth, logoBoxY, logoBoxX + logoBoxWidth, logoBoxY + borderRadius);
        ctx.lineTo(logoBoxX + logoBoxWidth, logoBoxY + logoBoxHeight - borderRadius);
        ctx.quadraticCurveTo(logoBoxX + logoBoxWidth, logoBoxY + logoBoxHeight, logoBoxX + logoBoxWidth - borderRadius, logoBoxY + logoBoxHeight);
        ctx.lineTo(logoBoxX + borderRadius, logoBoxY + logoBoxHeight);
        ctx.quadraticCurveTo(logoBoxX, logoBoxY + logoBoxHeight, logoBoxX, logoBoxY + logoBoxHeight - borderRadius);
        ctx.lineTo(logoBoxX, logoBoxY + borderRadius);
        ctx.quadraticCurveTo(logoBoxX, logoBoxY, logoBoxX + borderRadius, logoBoxY);
        ctx.closePath();
        ctx.fill();
        
        // Logo text inside yellow box
        ctx.fillStyle = '#6d0019';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('भक्ति', logoBoxX + (logoBoxWidth / 2), logoBoxY + 22);
        ctx.fillText('भाव', logoBoxX + (logoBoxWidth / 2), logoBoxY + 40);
        
        // Branding text
        ctx.fillStyle = 'rgba(109, 0, 25, 0.9)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Shared from', logoBoxX + logoBoxWidth + 10, brandingY + 15);
        
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Bhakti Bhav App', logoBoxX + logoBoxWidth + 10, brandingY + 32);
        
        // App store buttons (simplified text representation)
        ctx.fillStyle = '#000000';
        ctx.fillRect(logoBoxX + logoBoxWidth + 10, brandingY + 40, 60, 15);
        ctx.fillRect(logoBoxX + logoBoxWidth + 80, brandingY + 40, 60, 15);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play Store', logoBoxX + logoBoxWidth + 40, brandingY + 50);
        ctx.fillText('App Store', logoBoxX + logoBoxWidth + 110, brandingY + 50);
        
        // Decorative border
        ctx.strokeStyle = '#E8D5B7';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        return canvas;
    };
    
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                const canvas = await generateShareTemplate();
                
                // Convert canvas to blob
                canvas.toBlob(async (blob) => {
                    if (navigator.canShare && navigator.canShare({ files: [] })) {
                        const file = new File([blob], 'bhakti-bhav-vrat-katha.png', { type: 'image/png' });
                        
                        const shareData = {
                            title: detail.name?.hi || "व्रत कथा",
                            text: shareText,
                            files: [file]
                        };
                        
                        if (navigator.canShare(shareData)) {
                            await navigator.share(shareData);
                        } else {
                            // Fallback to text share
                            await navigator.share({
                                title: detail.name?.hi || "व्रत कथा",
                                text: shareText,
                                url: window.location.href
                            });
                        }
                    } else {
                        // Fallback to text share
                        await navigator.share({
                            title: detail.name?.hi || "व्रत कथा",
                            text: shareText,
                            url: window.location.href
                        });
                    }
                }, 'image/png');
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };


    // useEffect(() => {
    //     if (audioRef.current) {
    //         audioRef.current.pause();
    //         audioRef.current.currentTime = 0;
    //     }
    // }, [location])

    return (
        <>
            <Header pageName={{ hi: "ozr dFkk", en: "Vrat Katha" }} hindiFontSize="true" />
            <PageTitleCard
                titleHi={detail.name.hi}
                titleEn={detail.name.en}
                customEngFontSize={"13px"}
                customFontSize={"18px"}

            />

            <div className="container mx-auto px-4 pb-24 theme_text">
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
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.start.hi} %` : `${jsonFile.timings.start.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.start).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-center items-center">
                            <p className={`font-semibold text-black text-sm ${language === "hi" ? "font-hindi" : "font-eng"}`}>{language === "hi" ? `${jsonFile.timings.end.hi} %` : `${jsonFile.timings.end.en} :`}</p>
                            <p className="text-sm text-black font-eng ml-2">{new Date(detail.time?.end).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <div className="mt-4">

                        <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`} onClick={handleNativeShare}>
                            <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
                        </button>
                    </div>


                    <div className="mt-4">
                        <button
                            onClick={() => handlePlay(detail.audioUrl)}
                            disabled={!detail.audioUrl}
                            className={`px-6 py-2 flex items-center justify-center rounded-full 
                             transition ${language === "hi" ? "font-hindi" : "font-eng"} ${!detail.audioUrl
                                    ? "bg-[#9A283D]/50 text-white cursor-not-allowed"
                                    : (isPlaying && currentTrack === detail.audioUrl)
                                        ? "bg-red-600 text-white"
                                        : "bg_theme text-white"
                                }`}
                        >
                            {(isPlaying && currentTrack === detail.audioUrl) ? (
                                <>
                                    <span className="audio_pause_icon mr-2"></span> {language === "hi" ? jsonFile.pause.hi : jsonFile.pause.en}
                                </>
                            ) : (
                                <>
                                    <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.listen.hi : jsonFile.listen.en}
                                </>
                            )}
                        </button>

                    </div>
                </div>
                <div className="text-center my-8 text-xl">
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[#9A283D] ${fontSize}`}>
                        {detail.mantra?.hi?.replace(/"/g, '')}
                    </p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[#9A283D] ${fontSize}`}>
                        {detail.mantra?.hi?.replace(/"/g, '')}
                    </p>
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
                        ? <div className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize} break-words  w-full`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.hi.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%") }} />
                        : <div className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize} break-words w-full`} dangerouslySetInnerHTML={{ __html: detail.pujaMahatva?.en }} />
                    }
                </div>

                <div className="mt-4 w-full text-center">
                    <a href={redirectToAartiPage(detail.artiId)}
                        className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow inline-flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}
                    >
                        <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.aarti.hi : jsonFile.aarti.en}
                    </a>
                </div>
            </div>

        </>
    );
}

export default VratKathaDetail;
