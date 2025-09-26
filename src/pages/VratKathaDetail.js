import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";

function VratKathaDetail() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
    const audioRef = useRef(null);

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

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
    if (!detail) return <p className="text-center py-10 theme_text">❌ No data found!</p>;

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 pb-6 theme_text">

                <div className="flex justify-center items-center mb-3">
                    <h1 className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
                        <span className={`${language === "hi" ? "font-hindi" : "hidden"}`}>{detail.name?.hi}</span>
                        <span className={`${language === "en" ? "font-eng text-lg" : "hidden"}`}>({detail.name?.en})</span>
                    </h1>
                </div>

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
                    <div className="bg-white shadow rounded-lg px-6 py-3  md:flex-row gap-4 text-center">
                        <div className="flex justify-center">
                            <p className="font-semibold text-gray-600">प्रारंभ %</p>
                            <p className="text-sm text-gray-800 font-eng">{new Date(detail.time?.start).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-center">
                            <p className="font-semibold text-gray-600">समाप्त %</p>
                            <p className="text-sm text-gray-800 font-eng">{new Date(detail.time?.end).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <button className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow font-hindi">
                        'ks;j djsa
                    </button>

                    <div className="mt-4">
                        {detail.audioUrl && (
                            <button
                                onClick={handlePlay}
                                className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow"
                            >
                                <span className="audio_icon"></span> vkjrh lqusa
                            </button>
                        )}

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
                    {/* <h2 className="text-xl font-semibold"> <span className="font-hindi">प्रारम्भ </span> <span className="font-eng">/ Start </span>  </h2> */}
                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.prarambh?.en}</p>

                </div>

                <div className="mb-4">
                    {/* <h2 className="text-xl font-semibold"> <span className="font-hindi">समाप्ति </span> <span className="font-eng">/ End </span></h2> */}

                    <p className={`${language === "hi" ? " font-hindi" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.hi}</p>
                    <p className={`${language === "en" ? " font-eng" : "hidden"} text-[rgba(0,0,0,0.7)] ${fontSize}`}>{detail.samapt?.en}</p>

                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-3">
                        {language === "hi" ? (
                            <span className=" ">पूजा विधि </span>
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
                    <h2 className="text-xl font-semibold mb-3">
                        {language === "hi" ? (
                            <span className="">पूजा सामग्री </span>
                        ) : (
                            <span className="font-eng">Puja Samagri</span>
                        )}

                    </h2>
                    <ul className="list-inside text-[rgba(0,0,0,0.7)]">
                        {language === "hi"
                            ? Array.isArray(detail.pujaSamagri?.hi)
                                ? detail.pujaSamagri.hi.map((item, i) => (
                                    <li key={`hi-${i}`} className="font-hindi">{item}</li>
                                ))
                                : detail.pujaSamagri?.hi?.split("\n").map((item, i) => (
                                    <li key={`hi-${i}`} className="font-hindi">{item}</li>
                                ))
                            : Array.isArray(detail.pujaSamagri?.en)
                                ? detail.pujaSamagri.en.map((item, i) => (
                                    <li key={`en-${i}`} className="font-eng">{item}</li>
                                ))
                                : detail.pujaSamagri?.en?.split("\n").map((item, i) => (
                                    <li key={`en-${i}`} className="font-eng">{item}</li>
                                ))}
                    </ul>


                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-3">
                        {language === "hi" ? (
                            <span className=""> पूजा महत्व </span>
                        ) : (
                            <span className="font-eng">Puja Importance</span>
                        )}

                    </h2>
                    {language === "hi"
                        ? detail.pujaMahatva?.hi?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-hindi text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line.replace(/,/g, '•')}
                            </p>
                        ))
                        : detail.pujaMahatva?.en?.split("\n").map((line, idx) => (
                            <p key={idx} className={`font-eng text-[rgba(0,0,0,0.7)] ${fontSize}`}>
                                {line}
                            </p>
                        ))}
                </div>

                <div className="mt-4 w-full text-center">
                    {detail.audioUrl && (
                        <button
                            onClick={handlePlay}
                            className="bg-[#9A283D] text-white px-6 py-2 rounded-full shadow"
                        >
                            <span className="audio_icon"></span> vkjrh lqusa
                        </button>
                    )}

                    <audio ref={audioRef} className="hidden">
                        <source src={detail.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default VratKathaDetail;
