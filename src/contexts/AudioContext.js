import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const AudioContext = createContext(null);

const stripHtml = (val) => {
  if (!val) return "";
  return String(val)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());

  const [currentTrack, setCurrentTrack] = useState(() => {
    return localStorage.getItem("currentAudioTrack") || null;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  // Metadata: { title, englishTitle, imageUrl, subtitle, category }
  const [trackMetadata, setTrackMetadata] = useState(() => {
    return {
      title: localStorage.getItem("currentTrackName") || "भक्ति भाव",
      englishTitle: localStorage.getItem("currentTrackEnglishName") || "",
      imageUrl: localStorage.getItem("currentTrackImage") || "",
      subtitle: localStorage.getItem("currentTrackSubtitle") || "Bhakti Bhav Audio",
      category: localStorage.getItem("currentTrackCategory") || "",
    };
  });

  // Loop Mode: 0 (Off), 11, 21, 108, -1 (Infinite)
  const [loopMode, setLoopMode] = useState(0);
  const [remainingLoops, setRemainingLoops] = useState(0);

  // Playback Speed: 0.75, 1.0, 1.25, 1.5, 2.0
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Expanded Full-Screen Player Modal Sheet state
  const [isExpanded, setIsExpanded] = useState(false);

  // Keep audioRef configured with CORS and preload
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
    }
  }, []);

  // Restore track from localStorage on initial mount
  useEffect(() => {
    const savedTrack = localStorage.getItem("currentAudioTrack");
    const savedPosition = localStorage.getItem("currentAudioPosition");

    if (savedTrack && audioRef.current) {
      audioRef.current.src = savedTrack;
      setCurrentTrack(savedTrack);

      if (savedPosition) {
        const parsedPos = parseFloat(savedPosition);
        if (!isNaN(parsedPos) && parsedPos > 0) {
          audioRef.current.currentTime = parsedPos;
          setCurrentTime(parsedPos);
        }
      }
    }
  }, []);

  // Periodically save audio position
  useEffect(() => {
    if (!currentTrack) return;

    const savePosition = () => {
      if (currentTrack && audioRef.current && !isNaN(audioRef.current.currentTime)) {
        localStorage.setItem("currentAudioPosition", audioRef.current.currentTime.toString());
      }
    };

    const interval = setInterval(savePosition, 2000);
    return () => clearInterval(interval);
  }, [currentTrack]);

  // Handle Loop and Audio Cycle Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration || 0);
      }
      setIsBuffering(false);
      audio.playbackRate = playbackSpeed;
    };

    const handleDurationChange = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration || 0);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      // Loop logic
      if (loopMode === -1) {
        // Infinite loop: seamlessly restart
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (remainingLoops > 1) {
        // Decrement remaining count and repeat
        setRemainingLoops((prev) => prev - 1);
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Final playback finished: reset loop and stop
        setLoopMode(0);
        setRemainingLoops(0);
        setIsPlaying(false);
        audio.currentTime = 0;
      }
    };

    const handleError = (e) => {
      console.warn("Audio error occurred:", e);
      setIsBuffering(false);
      setIsPlaying(false);
      setError("ऑडियो लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [loopMode, remainingLoops, playbackSpeed]);

  // Synchronize Media Session API
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    try {
      const cleanTitle = stripHtml(trackMetadata.title || "भक्ति भाव");
      const cleanArtist = stripHtml(trackMetadata.englishTitle || "Bhakti Bhav");
      const cleanAlbum = stripHtml(trackMetadata.subtitle || "Bhakti Bhav Devotional");

      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: cleanTitle,
        artist: cleanArtist,
        album: cleanAlbum,
        artwork: trackMetadata.imageUrl
          ? [
              {
                src: trackMetadata.imageUrl,
                sizes: "512x512",
                type: "image/jpeg",
              },
            ]
          : [
              {
                src: "/img/logo_splash.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play().catch(() => {});
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });

      navigator.mediaSession.setActionHandler("seekbackward", () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
      });

      navigator.mediaSession.setActionHandler("seekforward", () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            duration || Infinity,
            audioRef.current.currentTime + 10
          );
        }
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    } catch (err) {
      console.warn("MediaSession API registration error:", err);
    }
  }, [currentTrack, trackMetadata, duration]);

  // Enhanced Play Function supporting (url, metadata)
  const play = useCallback((url, metadata = null) => {
    setError(null);
    if (!url) return;

    const audio = audioRef.current;
    if (!audio) return;

    const isNewTrack = audio.src !== url;

    if (isNewTrack) {
      audio.src = url;
      setCurrentTrack(url);
      localStorage.setItem("currentAudioTrack", url);
    }

    if (metadata) {
      const cleanMeta = {
        title: stripHtml(metadata.title || metadata.name || ""),
        englishTitle: stripHtml(metadata.englishTitle || metadata.nameEn || metadata.english || ""),
        imageUrl: metadata.imageUrl || metadata.imagethumb || metadata.image || "",
        subtitle: metadata.subtitle || "Bhakti Bhav Audio",
        category: metadata.category || "",
      };

      setTrackMetadata(cleanMeta);

      if (cleanMeta.title) localStorage.setItem("currentTrackName", cleanMeta.title);
      if (cleanMeta.englishTitle) localStorage.setItem("currentTrackEnglishName", cleanMeta.englishTitle);
      if (cleanMeta.imageUrl) localStorage.setItem("currentTrackImage", cleanMeta.imageUrl);
      if (cleanMeta.subtitle) localStorage.setItem("currentTrackSubtitle", cleanMeta.subtitle);
      if (cleanMeta.category) localStorage.setItem("currentTrackCategory", cleanMeta.category);
    } else {
      // Auto-refresh metadata from localStorage if not explicitly supplied
      const storedTitle = localStorage.getItem("currentTrackName");
      const storedEng = localStorage.getItem("currentTrackEnglishName");
      const storedImg = localStorage.getItem("currentTrackImage");
      const storedSub = localStorage.getItem("currentTrackSubtitle");
      const storedCat = localStorage.getItem("currentTrackCategory");

      if (storedTitle || storedImg) {
        setTrackMetadata({
          title: stripHtml(storedTitle || "भक्ति भाव"),
          englishTitle: stripHtml(storedEng || ""),
          imageUrl: storedImg || "",
          subtitle: storedSub || "Bhakti Bhav Audio",
          category: storedCat || "",
        });
      }
    }

    audio.playbackRate = playbackSpeed;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn("Playback prevented or failed:", err);
          setIsPlaying(false);
        });
    }
  }, [playbackSpeed]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsBuffering(false);
    setIsExpanded(false);
    setLoopMode(0);
    setRemainingLoops(0);
    setCurrentTime(0);

    localStorage.removeItem("currentAudioTrack");
    localStorage.removeItem("currentAudioPosition");
    localStorage.removeItem("currentTrackName");
    localStorage.removeItem("currentTrackEnglishName");
    localStorage.removeItem("currentTrackImage");
    localStorage.removeItem("currentTrackSubtitle");
    localStorage.removeItem("currentTrackCategory");
  }, []);

  const seek = useCallback((timeInSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(timeInSeconds, duration || Infinity));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const seekBy = useCallback((deltaSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, duration || Infinity));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // Set Loop count: 0 (Off), 11, 21, 108, -1 (Infinite)
  const setLoop = useCallback((count) => {
    setLoopMode(count);
    setRemainingLoops(count);
    if (audioRef.current) {
      audioRef.current.loop = count === -1;
    }
  }, []);

  // Quick toggle between Infinite Loop (-1) and Normal (0)
  const toggleQuickLoop = useCallback(() => {
    if (loopMode !== 0) {
      setLoop(0);
    } else {
      setLoop(-1);
    }
  }, [loopMode, setLoop]);

  // Set playback speed (0.75, 1.0, 1.25, 1.5, 2.0)
  const setSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  // Replay from beginning
  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        trackMetadata,
        setTrackMetadata,
        loopMode,
        remainingLoops,
        playbackSpeed,
        isExpanded,
        setIsExpanded,
        error,
        setError,
        play,
        pause,
        stop,
        seek,
        seekBy,
        setLoop,
        toggleQuickLoop,
        setSpeed,
        replay,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  return useContext(AudioContext);
};