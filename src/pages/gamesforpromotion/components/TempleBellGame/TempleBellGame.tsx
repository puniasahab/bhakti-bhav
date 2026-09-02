import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TempleBellGame.css';

interface TempleBellGameProps {
  onComplete: (discount: number) => void;
}

const GAME_DURATION = 15;
const PERFECT_THRESHOLD = 0.12; // within 12% of center = PERFECT
const GOOD_THRESHOLD = 0.28;    // within 28% = GOOD

const calculateDiscount = (score: number) => {
  if (score >= 150) return 50;
  if (score >= 100) return 31;
  if (score >= 60) return 21;
  return 15;
};

type FeedbackType = 'PERFECT' | 'GOOD' | 'MISS' | null;

const playBellSound = (type: FeedbackType) => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();

  if (type === 'MISS') {
    // Dull 'thud' sound for a miss
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    return;
  }

  // Rich bell tone for GOOD/PERFECT using additive synthesis
  // Perfect is a higher, brighter pitch (A5 = 880Hz), Good is lower (E5 = 659Hz)
  const baseFreq = type === 'PERFECT' ? 880 : 659.25;

  // Ratios for bell-like partials (fundamental, octave, minor third above octave, etc.)
  const partials = [1, 2, 2.4, 3, 4.5, 5.33];
  const gains = [1, 0.6, 0.4, 0.25, 0.2, 0.1];
  const decayTime = type === 'PERFECT' ? 2.5 : 1.5;

  partials.forEach((p, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq * p;

    // Sharp attack
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gains[i] * 0.15, ctx.currentTime + 0.02);
    // Long exponential decay
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + decayTime);
  });
};

const TempleBellGame: React.FC<TempleBellGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bellAngle, setBellAngle] = useState(0);   // -1 to +1, left to right
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [rings, setRings] = useState(0);
  const [perfects, setPerfects] = useState(0);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Bell physics loop — sine wave that speeds up over elapsed time
  const bellLoop = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) return;

    const elapsed = (timestamp - startTimeRef.current) / 1000; // seconds
    // Speed increases from 1.2 to 2.5 rad/s over 15s
    const frequency = 1.2 + (elapsed / GAME_DURATION) * 1.3;
    const angle = Math.sin(elapsed * frequency * Math.PI);
    setBellAngle(angle);

    rafRef.current = requestAnimationFrame(bellLoop);
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Game Over
  useEffect(() => {
    if (hasStarted && !isPlaying && timeLeft === 0) {
      cancelAnimationFrame(rafRef.current);
      const timeout = setTimeout(() => {
        onComplete(calculateDiscount(score));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [hasStarted, isPlaying, timeLeft, score, onComplete]);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(bellLoop);
  };

  const handleRing = () => {
    if (!isPlaying) return;

    // bellAngle: -1 = far left, 0 = center, +1 = far right
    const absAngle = Math.abs(bellAngle);
    clearTimeout(feedbackTimerRef.current);

    let fb: FeedbackType;
    let pts = 0;

    if (absAngle <= PERFECT_THRESHOLD) {
      fb = 'PERFECT';
      pts = 20;
      setPerfects(p => p + 1);
    } else if (absAngle <= GOOD_THRESHOLD) {
      fb = 'GOOD';
      pts = 8;
    } else {
      fb = 'MISS';
      pts = 0;
    }

    setRings(r => r + 1);
    setScore(s => s + pts);
    setFeedback(fb);
    playBellSound(fb);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 600);
  };

  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft <= 5 ? '#FF4500' : timeLeft <= 9 ? '#FFA500' : '#7CFC00';

  // Bell visual position: map -1..+1 to -120..+120 px swing
  // Bell visual position is not mapped in px directly, ropeAngle handles it
  // Rope tilt angle in degrees
  const ropeAngle = bellAngle * 35;

  return (
    <div className="bell-game-container">
      <div className="game-header">
        <div className="game-score">Score: {score}</div>
        <div className="game-timer" style={{ color: timerColor }}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Timer bar */}
      {hasStarted && isPlaying && (
        <div className="timer-bar-wrap">
          <div
            className="timer-bar-fill"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
      )}

      {/* Bell stage */}
      <div className="bell-stage">
        {/* Temple arch */}
        <div className="temple-arch" />

        {/* Rope + Bell pendulum */}
        <div
          className="pendulum-pivot"
          style={{ transform: `rotate(${ropeAngle}deg)` }}
        >
          <div className="rope" />
          <div className={`bell-emoji ${feedback === 'PERFECT' ? 'ring-shake' : ''}`}>
            🔔
          </div>
        </div>

        {/* Center sweet-spot indicator */}
        <div className="center-zone">
          <div className="center-zone-inner" />
        </div>

        {/* Feedback popup */}
        {feedback && (
          <div className={`feedback-popup feedback-${feedback.toLowerCase()}`}>
            {feedback === 'PERFECT' ? '✨ PERFECT!' : feedback === 'GOOD' ? '👍 GOOD!' : '❌ MISS'}
          </div>
        )}
      </div>

      {/* Ring button */}
      {hasStarted && isPlaying && (
        <div className="ring-control">
          <button className="ring-btn" onPointerDown={handleRing}>
            🔔 RING!
          </button>
          <div className="ring-stats">
            <span>{rings} rings</span>
            <span>·</span>
            <span>{perfects} ✨ perfect</span>
          </div>
        </div>
      )}

      {/* Rules overlay */}
      {!hasStarted && (
        <div className="rules-overlay">
          <div className="rules-card glass-panel">
            <h2>Ring the Temple Bell</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">🔔</span>
                <p><strong>Watch the Swing:</strong> The bell swings left and right, getting faster!</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">🎯</span>
                <p><strong>Hit Center = PERFECT:</strong> Tap RING when bell is at center for 20 pts!</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">⚡</span>
                <p><strong>Stay Sharp:</strong> Bell speeds up — keep your timing precise!</p>
              </div>
            </div>
            <div className="discount-tiers">
              <h4>Rewards</h4>
              <div className="tier-row"><span>150+ pts</span> <span className="tier-discount">50% OFF</span></div>
              <div className="tier-row"><span>100+ pts</span> <span className="tier-discount">31% OFF</span></div>
              <div className="tier-row"><span>60+ pts</span>  <span className="tier-discount">21% OFF</span></div>
              <div className="tier-row"><span>Any ring</span> <span className="tier-discount">15% OFF</span></div>
            </div>
            <button className="start-game-btn btn-3d" onClick={handleStart}>
              Start Ringing
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {hasStarted && !isPlaying && (
        <div className="game-over-overlay">
          <div className="game-over-card glass-panel">
            <h2>🔔 Session Complete!</h2>
            <p style={{ marginBottom: '0.5rem' }}>Score: <strong>{score}</strong> pts · {rings} rings · {perfects} ✨ perfect</p>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px 20px', borderRadius: '15px', marginBottom: '2rem', border: '1px solid var(--accent-gold)' }}>
              <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>{calculateDiscount(score)}% OFF Unlocked!</h3>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Proceeding to blessing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleBellGame;
