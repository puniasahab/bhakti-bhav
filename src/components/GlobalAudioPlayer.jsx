import React, { useState, useEffect } from "react";
import { useAudio } from "../contexts/AudioContext";
import {
  Play,
  Pause,
  X,
  Repeat,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Check,
  Music,
  Gauge,
} from "lucide-react";

// Inline font style to strictly override any parent KrutiDev font inheritance
const engFontStyle = { fontFamily: "'PoppinsRegular', -apple-system, BlinkMacSystemFont, sans-serif" };

// Counter-clockwise Rewind 10s Icon matching mobile devotional UI
const Rewind10Icon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <text
      x="12"
      y="15.2"
      fontSize="7.5"
      fontWeight="bold"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontFamily="sans-serif"
    >
      10
    </text>
  </svg>
);

// Clockwise Forward 10s Icon matching mobile devotional UI
const Forward10Icon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.6L21 8" />
    <path d="M21 3v5h-5" />
    <text
      x="12"
      y="15.2"
      fontSize="7.5"
      fontWeight="bold"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontFamily="sans-serif"
    >
      10
    </text>
  </svg>
);

// English UI labels for devotional player controls matching mobile app specifications
const playerLabels = {
  nowPlaying: "NOW PLAYING • BHAKTI BHAV",
  devotionalBadge: "🕉️ Bhakti Bhav Devotional",
  audioSubtitle: "Bhakti Bhav Audio",
  loop: "Loop",
  loopBadgeInfinite: "🔁 Infinite Loop",
  loopBadgeCount: (n) => `🔁 Loop: ${n} left`,
  loopMiniInfinite: "🔁 Infinite",
  loopMiniCount: (n) => `🔁 ${n} left`,
  speed: "Speed",
  replay: "Replay",
  jaapModalTitle: "Mantra Jaap & Loop Count",
  jaapModalSubtitle: "Choose repetition count according to your practice:",
  loopOptions: [
    { label: "Off (Play Once)", count: 0, subtitle: "Plays 1 time and stops" },
    { label: "11 Times Loop", count: 11, subtitle: "Traditional 11 jaap count" },
    { label: "21 Times Loop", count: 21, subtitle: "Devotional recital cycle" },
    { label: "108 Times Loop", count: 108, subtitle: "Maha Jaap 108 mala count" },
    { label: "Infinite Loop (∞)", count: -1, subtitle: "Repeats indefinitely until stopped" },
  ],
};

const GlobalAudioPlayer = () => {
  const t = playerLabels;

  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    trackMetadata,
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
  } = useAudio();

  const [showLoopModal, setShowLoopModal] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Close modals when track is stopped
  useEffect(() => {
    if (!currentTrack) {
      setShowLoopModal(false);
    }
  }, [currentTrack]);

  // Dismiss error toast after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!currentTrack) return null;

  // Format MM:SS helper matching 00:09, 01:34 in user screenshots
  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec < 0) return "00:00";
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Safe percentage calculation
  const currentPos = isScrubbing ? scrubValue : currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentPos / duration) * 100)) : 0;

  // Fallback artwork image
  const artworkUrl =
    trackMetadata?.imageUrl ||
    "/img/default_katha.png";

  const primaryTitle =
    trackMetadata?.title ||
    localStorage.getItem("currentTrackName") ||
    "भक्ति भाव";

  const englishTitle =
    trackMetadata?.englishTitle ||
    localStorage.getItem("currentTrackEnglishName") ||
    "";

  // Subtitle / loop status badge text with localization
  const isLoopActive = loopMode !== 0;
  const loopStatusText =
    loopMode === -1
      ? t.loopMiniInfinite
      : remainingLoops > 0
      ? t.loopMiniCount(remainingLoops)
      : "";

  const loopBadgeFullText =
    loopMode === -1
      ? t.loopBadgeInfinite
      : remainingLoops > 0
      ? t.loopBadgeCount(remainingLoops)
      : t.devotionalBadge;

  // Loop button label in devotional row
  const loopButtonLabel =
    loopMode === -1
      ? `${t.loop} (∞)`
      : loopMode > 0
      ? `${t.loop} (${loopMode}x)`
      : t.loop;

  // Seekbar handlers
  const handleSeekStart = (e) => {
    setIsScrubbing(true);
    setScrubValue(parseFloat(e.target.value));
  };

  const handleSeekChange = (e) => {
    setScrubValue(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e) => {
    const targetVal = parseFloat(e.target.value);
    seek(targetVal);
    setIsScrubbing(false);
  };

  // Speed options
  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  const handleCycleSpeed = () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setSpeed(speedOptions[nextIndex]);
  };

  return (
    <>
      {/* ── Error Toast Notification ── */}
      {error && (
        <div
          className="fixed top-4 inset-x-4 max-w-md mx-auto z-[70] bg-[#800020] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between text-sm animate-fadeIn font-eng"
          style={engFontStyle}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-white/80 hover:text-white p-1 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PERSISTENT MINI PLAYER (Fixed Floating Bottom Bar)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-4 sm:w-[440px] max-w-lg mx-auto z-50 transition-transform duration-300 ease-out select-none font-eng"
        style={{ ...engFontStyle, filter: "drop-shadow(0 10px 25px rgba(122,28,46,0.18))" }}
      >
        <div className="bg-gradient-to-r from-[#FFFDF8] via-[#FFF9EE] to-[#FFF0D9] border border-[#F0BE8E] rounded-[24px] px-3.5 pt-3 pb-2.5 shadow-lg flex flex-col backdrop-blur-sm">
          {/* Top Row: Thumbnail + Title + Controls */}
          <div className="flex items-center justify-between gap-2.5">
            {/* Square Thumbnail with Rounded Corners & Music Badge */}
            <div
              onClick={() => setIsExpanded(true)}
              className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-[#F0BE8E]/80 bg-[#FFF7EE] shadow-sm cursor-pointer group"
              title="Click to expand player"
            >
              <img
                src={artworkUrl}
                alt={primaryTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/img/default_katha.png";
                }}
              />
              {/* Music Note Badge on Bottom-Right Corner */}
              <div
                className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#800020] text-white flex items-center justify-center text-[9px] shadow ${
                  isPlaying ? "animate-pulse" : ""
                }`}
              >
                <Music size={9} strokeWidth={2.8} />
              </div>
            </div>

            {/* Track Title & Subtitle (Click to expand) */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex-1 min-w-0 mx-1 cursor-pointer select-none text-left"
              title="Click to expand player"
            >
              <p className="text-[15px] font-bold text-[#7A1C2E] truncate leading-tight font-devanagari tracking-tight">
                {primaryTitle}
              </p>
              <div
                className="flex items-center gap-1 mt-0.5 text-xs font-eng"
                style={engFontStyle}
              >
                {isLoopActive ? (
                  <span
                    className="font-semibold text-[#800020] flex items-center gap-1 font-eng"
                    style={engFontStyle}
                  >
                    {loopStatusText}
                  </span>
                ) : (
                  <span
                    className="text-[#8A4C56] font-medium flex items-center gap-1 font-eng"
                    style={engFontStyle}
                  >
                    <span style={engFontStyle}>{trackMetadata?.subtitle || t.audioSubtitle}</span>
                    <ChevronUp size={12} strokeWidth={2.4} className="text-[#8A4C56]/80" />
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Quick Loop Toggle + Play/Pause + Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Loop Toggle */}
              <button
                type="button"
                onClick={toggleQuickLoop}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 ${
                  isLoopActive
                    ? "bg-[#7A1C2E] text-white shadow-sm"
                    : "bg-white/80 hover:bg-white text-[#7A1C2E] border border-[#F0BE8E]/70"
                }`}
                title={isLoopActive ? "Loop active (Click to turn off)" : "Turn Infinite Loop ON"}
                aria-label="Toggle loop"
              >
                <Repeat size={16} strokeWidth={2.4} />
              </button>

              {/* Play / Pause Circular Maroon Button */}
              <button
                type="button"
                onClick={isPlaying ? pause : () => play(currentTrack)}
                className="w-11 h-11 rounded-full bg-[#7A1C2E] hover:bg-[#661625] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(122,28,46,0.35)] active:scale-95 transition"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={19} fill="currentColor" />
                ) : (
                  <Play size={19} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={stop}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#7A1C2E] border border-[#F0BE8E]/60 flex items-center justify-center transition active:scale-95"
                title="Close player"
                aria-label="Close audio player"
              >
                <X size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Bottom Inset Progress Bar with Start & End Live Timers */}
          <div
            className="mt-2 pt-1 flex items-center gap-2.5 text-[11px] font-semibold text-[#8A4C56] font-eng select-none"
            style={engFontStyle}
          >
            <span className="min-w-[32px]" style={engFontStyle}>{formatTime(currentTime)}</span>

            {/* Clickable Live Progress Slider */}
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={duration > 0 ? (isScrubbing ? scrubValue : currentTime) : 0}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="w-full h-1.5 bg-[#EAD4C3] rounded-full appearance-none cursor-pointer outline-none transition-all"
                style={{
                  background: `linear-gradient(to right, #7A1C2E 0%, #7A1C2E ${progressPercent}%, #EAD4C3 ${progressPercent}%, #EAD4C3 100%)`,
                }}
              />
            </div>

            <span className="min-w-[32px] text-right" style={engFontStyle}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDED FULL-SCREEN PLAYER MODAL / SHEET
          ───────────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-eng"
          style={engFontStyle}
          onClick={() => {
            setIsExpanded(false);
            setShowLoopModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[92vh] rounded-t-[36px] sm:rounded-[36px] bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FFF0D9] border-t-2 sm:border-2 border-[#F0BE8E] shadow-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto select-none font-eng"
            style={engFontStyle}
          >
            {/* Top Drag Handle */}
            <div
              onClick={() => setIsExpanded(false)}
              className="w-12 h-1.5 bg-[#D6A692]/60 rounded-full mx-auto mb-3 cursor-pointer hover:bg-[#D6A692] transition"
              title="Close"
            />

            {/* Header Bar: Close Down Arrow + Title + Loop Shortcut */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#7A1C2E] hover:bg-[#FCE6D8]/60 transition active:scale-95"
                aria-label="Collapse player"
              >
                <ChevronDown size={28} strokeWidth={2.4} />
              </button>

              <h3
                className="font-bold tracking-wider text-xs sm:text-sm text-[#7A1C2E] uppercase font-eng select-none"
                style={engFontStyle}
              >
                {t.nowPlaying}
              </h3>

              <button
                type="button"
                onClick={() => setShowLoopModal(true)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 ${
                  isLoopActive
                    ? "bg-[#7A1C2E] text-white shadow-sm"
                    : "text-[#7A1C2E] hover:bg-[#FCE6D8]/60"
                }`}
                title="Loop settings"
                aria-label="Loop settings"
              >
                <Repeat size={20} strokeWidth={2.4} />
              </button>
            </div>

            {/* Hero Artwork: Large Centered Artwork Card */}
            <div className="my-3 flex justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[32px] overflow-hidden border-2 border-[#E87A5D]/75 bg-[#FCE6D8]/50 shadow-[0_12px_32px_rgba(122,28,46,0.18)] p-2.5 flex items-center justify-center">
                <img
                  src={artworkUrl}
                  alt={primaryTitle}
                  className="w-full h-full object-cover rounded-[24px]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/default_katha.png";
                  }}
                />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="text-center my-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#7A1C2E] font-devanagari leading-snug tracking-tight">
                {primaryTitle}
              </h2>
              {englishTitle && (
                <p
                  className="text-lg sm:text-xl font-bold text-[#7A1C2E] font-eng leading-snug mt-1"
                  style={engFontStyle}
                >
                  {englishTitle}
                </p>
              )}

              {/* Devotional Badge Pill (Under Title) */}
              <div className="mt-3 flex justify-center">
                <div
                  onClick={() => setShowLoopModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E8B298] bg-white/75 text-[#7A1C2E] text-xs sm:text-sm font-semibold shadow-sm cursor-pointer hover:bg-white transition font-eng"
                  style={engFontStyle}
                >
                  <span className="font-eng" style={engFontStyle}>{loopBadgeFullText}</span>
                </div>
              </div>
            </div>

            {/* Seekbar & Timers */}
            <div className="mt-4 px-1 font-eng" style={engFontStyle}>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-[#8A4C56] font-eng mb-1.5" style={engFontStyle}>
                <span style={engFontStyle}>{formatTime(currentTime)}</span>
                <span style={engFontStyle}>{formatTime(duration)}</span>
              </div>

              <div className="relative flex items-center py-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={duration > 0 ? (isScrubbing ? scrubValue : currentTime) : 0}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="w-full h-2 bg-[#F3D7C5] rounded-full appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, #800020 0%, #800020 ${progressPercent}%, #F3D7C5 ${progressPercent}%, #F3D7C5 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Main Playback Control Cluster: Rewind 10s + Play/Pause + Forward 10s */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 my-5">
              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="w-14 h-14 rounded-full bg-[#FCE6D8]/70 hover:bg-[#FCE6D8] text-[#7A1C2E] flex items-center justify-center shadow-sm active:scale-95 transition"
                title="Rewind 10 seconds"
                aria-label="Rewind 10 seconds"
              >
                <Rewind10Icon />
              </button>

              {/* Prominent Play / Pause Maroon Button */}
              <button
                type="button"
                onClick={isPlaying ? pause : () => play(currentTrack)}
                className="w-20 h-20 rounded-full bg-[#7A1C2E] hover:bg-[#661625] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(122,28,46,0.4)] active:scale-95 transition"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <Loader2 size={34} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={34} fill="currentColor" />
                ) : (
                  <Play size={34} fill="currentColor" className="ml-1" />
                )}
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="w-14 h-14 rounded-full bg-[#FCE6D8]/70 hover:bg-[#FCE6D8] text-[#7A1C2E] flex items-center justify-center shadow-sm active:scale-95 transition"
                title="Forward 10 seconds"
                aria-label="Forward 10 seconds"
              >
                <Forward10Icon />
              </button>
            </div>

            {/* Devotional Control Pills Row: Loop + Speed + Replay */}
            <div
              className="flex items-center justify-center gap-2.5 sm:gap-3 mt-1 pb-1 font-eng"
              style={engFontStyle}
            >
              {/* Loop Pill */}
              <button
                type="button"
                onClick={() => setShowLoopModal(true)}
                className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition font-eng ${
                  isLoopActive
                    ? "bg-[#7A1C2E] text-white border-[#7A1C2E]"
                    : "border-[#E8B298] bg-[#FFF4E8]/90 hover:bg-[#FFE8D1] text-[#7A1C2E]"
                }`}
                style={engFontStyle}
              >
                <Repeat size={15} strokeWidth={2.4} />
                <span className="font-eng" style={engFontStyle}>{loopButtonLabel}</span>
              </button>

              {/* Speed Selector Pill */}
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="px-4 py-2 rounded-full border border-[#E8B298] bg-[#FFF4E8]/90 hover:bg-[#FFE8D1] text-[#7A1C2E] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition font-eng"
                style={engFontStyle}
                title="Click to cycle playback speed"
              >
                <Gauge size={15} strokeWidth={2.4} />
                <span className="font-eng" style={engFontStyle}>{`${playbackSpeed}x ${t.speed}`}</span>
              </button>

              {/* Replay Pill */}
              <button
                type="button"
                onClick={replay}
                className="px-4 py-2 rounded-full border border-[#E8B298] bg-[#FFF4E8]/90 hover:bg-[#FFE8D1] text-[#7A1C2E] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition font-eng"
                style={engFontStyle}
                title="Restart audio from beginning"
              >
                <RotateCcw size={15} strokeWidth={2.4} />
                <span className="font-eng" style={engFontStyle}>{t.replay}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. JAAP / MANTRA LOOP MODAL POPUP
          ───────────────────────────────────────────────────────────── */}
      {showLoopModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn font-eng"
          style={engFontStyle}
          onClick={() => setShowLoopModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#FFFDF8] border-2 border-[#F0BE8E] p-6 shadow-2xl text-gray-800 font-eng"
            style={engFontStyle}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0BE8E]/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">📿</span>
                <h4 className="font-bold text-lg text-[#7A1C2E] font-eng" style={engFontStyle}>
                  {t.jaapModalTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLoopModal(false)}
                className="w-8 h-8 rounded-full bg-[#FFF0D9] text-[#7A1C2E] flex items-center justify-center hover:bg-[#FCE6D8]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#8A4C56] mt-2 mb-4 font-eng" style={engFontStyle}>
              {t.jaapModalSubtitle}
            </p>

            <div className="space-y-2.5 font-eng" style={engFontStyle}>
              {t.loopOptions.map((opt) => {
                const isSelected = loopMode === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => {
                      setLoop(opt.count);
                      setShowLoopModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left font-eng ${
                      isSelected
                        ? "border-[#7A1C2E] bg-[#FCE6D8]/80 text-[#7A1C2E] shadow-sm font-bold"
                        : "border-[#F0BE8E]/60 bg-white hover:bg-[#FFF7EE] text-[#55232A]"
                    }`}
                    style={engFontStyle}
                  >
                    <div style={engFontStyle}>
                      <p className="text-sm font-bold font-eng" style={engFontStyle}>{opt.label}</p>
                      <p className="text-xs text-gray-500 font-normal mt-0.5 font-eng" style={engFontStyle}>
                        {opt.subtitle}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#7A1C2E] text-white flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalAudioPlayer;