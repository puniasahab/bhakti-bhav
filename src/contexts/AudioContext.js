import { createContext, useContext, useState, useRef } from "react";

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const play = (url) => {
        console.log("AudioContext play called with URL:", url);
        if(currentTrack !== url) {
            audioRef.current.src = url;
            setCurrentTrack(url);
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
        setCurrentTrack(null); // Clear the current track to hide the player
        setIsPlaying(false);
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