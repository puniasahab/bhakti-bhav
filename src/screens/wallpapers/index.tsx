import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../../components/firebase";
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setWallpapers } from "./wallpaperSlice";

const Wallpapers: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { wallpapers } = useAppSelector(state => state.wallpapers);

    const handleBack = () => {
        navigate('/');
    };

    useEffect(() => {
        const fetchWallpapers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "wallpapers"));
                const wallpapers = querySnapshot.docs.map(doc => doc.data());
                dispatch(setWallpapers(wallpapers));
            }
            catch (error) {
                console.error("Error fetching wallpapers:", error);
            }
        }

        fetchWallpapers();
    }, [dispatch]);

    return (
        <div 
            className="bg-cover bg-top bg-no-repeat min-h-screen w-full text-white"
            style={{ 
                backgroundImage: "url('/img/page_bg.jpg')",
                fontFamily: "'KrutiDev', sans-serif"
            }}
        >
            {/* Header with Back Button */}
            <header className="p-4">
                <div className="container mx-auto hd_bg rounded-xl">
                    <div className="flex justify-between items-center px-4 py-6">
                        <div className="flex items-center">
                            <button 
                                onClick={handleBack}
                                className="mr-4 p-2 rounded-full bg-[#610419] text-white hover:bg-[#7a0028] transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg font-bold theme_text" style={{fontSize: '20px'}}>वॉलपेपर</h1>
                        </div>
                        <img 
                            src="/img/logo.png" 
                            alt="Logo" 
                            className="max-w-full h-auto" 
                            style={{width: '100px', height: '22px'}} 
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4">
                <div className="container mx-auto">
                    <div className="bg-[#FFFAF4] rounded-xl p-6 md:p-8 shadow-md">
                        <div className="text-[#610419] font-eng">
                            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Wallpapers Collection</h1>
                            
                            {wallpapers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-lg text-gray-600">Loading wallpapers...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                    {wallpapers.map((wallpaper: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                        >
                                            <div className="relative group">
                                                <img 
                                                    src={wallpaper.imageUrl} 
                                                    alt={`Wallpaper ${index + 1}`}
                                                    className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                                                
                                                {/* Download button overlay */}
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <a 
                                                        href={wallpaper.imageUrl}
                                                        download={`wallpaper-${index + 1}.jpg`}
                                                        className="bg-[#610419] text-white p-2 rounded-full hover:bg-[#7a0028] transition-colors"
                                                        title="Download Wallpaper"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            <div className="p-3">
                                                <p className="text-sm text-gray-600 text-center font-medium">
                                                    {wallpaper.title || `Wallpaper ${index + 1}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Back to Home Button */}
                            <div className="mt-8 text-center">
                                <button 
                                    onClick={handleBack}
                                    className="bg-[#610419] text-white px-8 py-3 rounded-[10px] font-eng text-lg hover:bg-[#7a0028] transition-colors flex items-center mx-auto"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-6 py-4">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
                    <div className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
                        <Link to="/termsAndConditions" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
                            Terms & Conditions
                        </Link>
                        <Link to="/privacyPolicy" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
                            Privacy Policy
                        </Link>
                        <Link to="/aboutUs" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
                            About us
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Wallpapers;