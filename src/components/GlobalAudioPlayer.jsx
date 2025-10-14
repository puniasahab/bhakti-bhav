import { useAudio } from "../contexts/AudioContext";
import { Play, Pause, X } from "lucide-react";
import { useState, useEffect } from "react";


const GlobalAudioPlayer = () => {
    const { play, pause, stop, isPlaying, currentTrack, audioRef } = useAudio();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    console.log("GlobalAudioPlayer - currentTrack:", currentTrack, "isPlaying:", isPlaying);

    // Update time and duration
    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;

        const updateTime = () => {
            setCurrentTime(audio.currentTime || 0);
        };

        const updateDuration = () => {
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setCurrentTime(0);
            stop();
        };

        // Add event listeners
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        // Initial setup
        updateTime();
        updateDuration();

        // Cleanup
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioRef, stop]);

    if (!currentTrack) return null;

    // Extract chalisa name from localStorage or use a default name
    const getTrackName = (url) => {
        const storedName = localStorage.getItem('currentTrackName');
        return storedName || "चालीसा / Chalisa";
    };

    // Format time helper function
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle seek functionality
    const handleSeek = (e) => {
        if (!audioRef?.current || !duration) return;
        
        const seekTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    return (
        <div className="fixed bottom-10 left-8 right-8 bg-white border-t-2 border-[#9A283D] hd_bg shadow-lg rounded-lg py-3 px-4 z-50">
            {/* Top row - Track name and controls */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center flex-1">
                    <span className="audio_icon mr-2"></span>
                    <div className="text-[#9A283D] font-semibold text-sm truncate">
                        {getTrackName(currentTrack)}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={isPlaying ? pause : () => play(currentTrack)}
                        className="bg-[#9A283D] text-white rounded-full p-2 hover:bg-[#7A1F2D] transition-colors duration-200"
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    
                    <button
                        onClick={stop}
                        className="text-[#9A283D] hover:text-red-600 transition-colors duration-200 p-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Bottom row - Progress bar and time */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-eng min-w-[35px]">
                    {formatTime(currentTime)}
                </span>
                
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
                </div>
                
                <span className="text-xs text-gray-500 font-eng min-w-[35px]">
                    {formatTime(duration)}
                </span>
            </div>
        </div>
    )
}

export default GlobalAudioPlayer;