import { createContext, useContext, useState, useRef, useEffect } from "react";

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(() => {
        return localStorage.getItem('currentAudioTrack') || null;
    });
    const [isPlaying, setIsPlaying] = useState(false);

    // Restore audio state on component mount
    useEffect(() => {
        const savedTrack = localStorage.getItem('currentAudioTrack');
        const savedPosition = localStorage.getItem('currentAudioPosition');
        
        if (savedTrack) {
            audioRef.current.src = savedTrack;
            setCurrentTrack(savedTrack);
            
            if (savedPosition) {
                audioRef.current.currentTime = parseFloat(savedPosition);
            }
        }
    }, []);

    // Save audio position periodically
    useEffect(() => {
        if (!currentTrack) return;

        const savePosition = () => {
            if (currentTrack && audioRef.current) {
                localStorage.setItem('currentAudioPosition', audioRef.current.currentTime.toString());
            }
        };

        const interval = setInterval(savePosition, 2000); // Save every 2 seconds
        
        return () => clearInterval(interval);
    }, [currentTrack]);

    const play = (url) => {
        console.log("AudioContext play called with URL:", url);
        if(currentTrack !== url) {
            audioRef.current.src = url;
            setCurrentTrack(url);
            localStorage.setItem('currentAudioTrack', url);
            console.log("Set new track:", url);
        }

        audioRef.current.play();
        setIsPlaying(true);
        console.log("Audio playing, isPlaying set to true");
    }

    const pause = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    }

    const stop = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentTrack(null);
        setIsPlaying(false);
        
        // Clear localStorage
        localStorage.removeItem('currentAudioTrack');
        localStorage.removeItem('currentAudioPosition');
        localStorage.removeItem('currentTrackName');
    }

    return (
        <AudioContext.Provider value={{ play, pause, stop, isPlaying, currentTrack, audioRef }}>
            {children}
        </AudioContext.Provider>
    );
}

export const useAudio = () => {
    return useContext(AudioContext);
}