import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MantraMatchGame.css';

interface MantraMatchGameProps {
  onComplete: (discount: number) => void;
}

// ── Game Constants ──────────────────────────────────────────────
const GAME_DURATION = 35;
const SYMBOLS = ['ॐ', '☸', '🕉', '☯', '✡'];
const CATCHER_COUNT = 4;
const SYMBOL_SIZE = 72;
const FALL_ZONE_HEIGHT = 420; // estimated px, recalculated at runtime

const calculateDiscount = (score: number): number => {
  if (score >= 150) return 50;
  if (score >= 100) return 35;
  if (score >= 60)  return 25;
  return 15;
};

// ── Types ────────────────────────────────────────────────────────
interface FallingItem {
  id: number;
  symbol: string;
  lane: number;      // 0..CATCHER_COUNT-1
  top: number;       // px from top of fall zone
  speed: number;     // px per tick
  state: 'falling' | 'hit' | 'miss';
}

interface ScorePopup {
  id: number;
  text: string;
  type: 'correct' | 'wrong';
  x: number;
  y: number;
}

interface CatcherFlash {
  index: number;
  type: 'correct' | 'wrong';
}

// ── Component ─────────────────────────────────────────────────────
const MantraMatchGame: React.FC<MantraMatchGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted]     = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [timeLeft, setTimeLeft]         = useState(GAME_DURATION);
  const [score, setScore]               = useState(0);
  const [lives, setLives]               = useState(3);
  const [combo, setCombo]               = useState(0);
  const [items, setItems]               = useState<FallingItem[]>([]);
  const [popups, setPopups]             = useState<ScorePopup[]>([]);
  const [catcherFlash, setCatcherFlash] = useState<CatcherFlash | null>(null);
  const [showCombo, setShowCombo]       = useState<string | null>(null);
  const [gameOver, setGameOver]         = useState<string | null>(null);

  // Catcher symbols — randomised each game
  const [catchers, setCatchers] = useState<string[]>([]);

  const fallZoneRef    = useRef<HTMLDivElement>(null);
  const rafRef         = useRef<number>(0);
  const lastSpawnRef   = useRef<number>(0);
  const idCounterRef   = useRef<number>(0);
  const isPlayingRef   = useRef(false);
  const livesRef       = useRef(3);
  const comboRef       = useRef(0);
  const scoreRef       = useRef(0);
  const catchersRef    = useRef<string[]>([]);
  const zoneHeightRef  = useRef(FALL_ZONE_HEIGHT);

  // Keep refs in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { catchersRef.current = catchers; }, [catchers]);

  // ── Spawn logic ────────────────────────────────────────────────
  const spawnItem = useCallback((elapsed: number, speed: number) => {
    const lane = Math.floor(Math.random() * CATCHER_COUNT);
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    idCounterRef.current += 1;
    const newItem: FallingItem = {
      id: idCounterRef.current,
      symbol,
      lane,
      top: -SYMBOL_SIZE,
      speed,
      state: 'falling',
    };
    setItems(prev => [...prev, newItem]);
    lastSpawnRef.current = elapsed;
  }, []);

  // ── Game loop ────────────────────────────────────────────────
  const gameLoop = useCallback((startTs: number) => {
    let lastTick = startTs;
    let elapsed = 0;

    const tick = (ts: number) => {
      if (!isPlayingRef.current) return;

      const delta = ts - lastTick;
      lastTick = ts;
      elapsed += delta;

      // Difficulty ramp: speed increases over time
      const progress = Math.min(elapsed / (GAME_DURATION * 1000), 1);
      const speed = 1.2 + progress * 2.5;

      // Spawn interval shrinks as game progresses
      const spawnInterval = Math.max(1200 - progress * 700, 600);

      if (elapsed - lastSpawnRef.current > spawnInterval) {
        spawnItem(elapsed, speed);
      }

      // Move items down
      setItems(prev => {
        const zoneH = zoneHeightRef.current;
        return prev
          .map(item => {
            if (item.state !== 'falling') return item;
            const newTop = item.top + item.speed * (delta / 16.67);

            // Missed — fell off bottom
            if (newTop > zoneH) {
              // lose a life
              livesRef.current -= 1;
              comboRef.current = 0;
              setLives(livesRef.current);
              setCombo(0);

              if (livesRef.current <= 0) {
                isPlayingRef.current = false;
                setIsPlaying(false);
                setGameOver('Out of Lives!');
              }
              return { ...item, state: 'miss' as const };
            }
            return { ...item, top: newTop };
          })
          .filter(item => item.state === 'falling');
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [spawnItem]);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setGameOver('Time Up! Divine Blessing Earned!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // ── Start / restart ────────────────────────────────────────────
  const handleStart = () => {
    // Pick CATCHER_COUNT symbols (from the full set, with possible repeats is fine, but ensure uniqueness)
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, CATCHER_COUNT);
    setCatchers(picked);
    catchersRef.current = picked;

    setItems([]);
    setPopups([]);
    setCatcherFlash(null);
    setShowCombo(null);
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setCombo(0);
    comboRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setGameOver(null);
    lastSpawnRef.current = 0;
    idCounterRef.current = 0;

    setHasStarted(true);
    setIsPlaying(true);
    isPlayingRef.current = true;

    // Measure zone height
    if (fallZoneRef.current) {
      zoneHeightRef.current = fallZoneRef.current.clientHeight;
    }

    requestAnimationFrame((ts) => gameLoop(ts));
  };

  // Cancel RAF when not playing
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── End-game transition ────────────────────────────────────────
  useEffect(() => {
    if (hasStarted && !isPlaying && gameOver) {
      const t = setTimeout(() => onComplete(calculateDiscount(scoreRef.current)), 3500);
      return () => clearTimeout(t);
    }
  }, [hasStarted, isPlaying, gameOver, onComplete]);

  // ── Catcher press ──────────────────────────────────────────────
  const handleCatch = (catcherIndex: number) => {
    if (!isPlaying) return;

    const catcherSymbol = catchersRef.current[catcherIndex];
    const zoneH = zoneHeightRef.current;
    const catchWindow = SYMBOL_SIZE * 1.5; // bottom portion considered "catchable"

    // Find the closest falling item in that lane that's in the catch window
    const match = items
      .filter(i => i.state === 'falling' && i.lane === catcherIndex && i.top >= zoneH - catchWindow)
      .sort((a, b) => b.top - a.top)[0];

    if (!match) {
      // Wrong press — no item ready in that lane
      setCatcherFlash({ index: catcherIndex, type: 'wrong' });
      setTimeout(() => setCatcherFlash(null), 400);
      return;
    }

    if (match.symbol === catcherSymbol) {
      // ✅ Correct
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);

      const pts = newCombo >= 3 ? 20 : 10;
      scoreRef.current += pts;
      setScore(scoreRef.current);

      setItems(prev => prev.filter(i => i.id !== match.id));
      setCatcherFlash({ index: catcherIndex, type: 'correct' });
      setTimeout(() => setCatcherFlash(null), 400);

      // Score popup
      const popupId = Date.now();
      const laneWidth = (fallZoneRef.current?.clientWidth ?? 360) / CATCHER_COUNT;
      const px = laneWidth * catcherIndex + laneWidth / 2;
      setPopups(prev => [...prev, { id: popupId, text: newCombo >= 3 ? `+${pts} 🔥COMBO` : `+${pts}`, type: 'correct', x: px, y: zoneH - 80 }]);
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== popupId)), 900);

      if (newCombo === 3 || newCombo === 5 || newCombo === 8) {
        setShowCombo(`${newCombo}x COMBO! 🔱`);
        setTimeout(() => setShowCombo(null), 900);
      }
    } else {
      // ❌ Wrong symbol matched
      comboRef.current = 0;
      setCombo(0);
      livesRef.current -= 1;
      setLives(livesRef.current);

      setItems(prev => prev.filter(i => i.id !== match.id));
      setCatcherFlash({ index: catcherIndex, type: 'wrong' });
      setTimeout(() => setCatcherFlash(null), 400);

      const popupId = Date.now();
      const laneWidth = (fallZoneRef.current?.clientWidth ?? 360) / CATCHER_COUNT;
      const px = laneWidth * catcherIndex + laneWidth / 2;
      setPopups(prev => [...prev, { id: popupId, text: '-❤️', type: 'wrong', x: px, y: zoneH - 80 }]);
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== popupId)), 900);

      if (livesRef.current <= 0) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setGameOver('Out of Lives!');
      }
    }
  };

  const laneWidth = 100 / CATCHER_COUNT;

  return (
    <div className="mantra-game-container">
      {/* Header */}
      <div className="mantra-header">
        <div className="mantra-score">⭐ {score}</div>
        <div className={`mantra-timer ${timeLeft <= 8 ? 'urgent' : ''}`}>⏱ {timeLeft}s</div>
        <div className="mantra-lives">
          {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
        </div>
      </div>

      {/* Fall Zone */}
      <div className="mantra-fall-zone" ref={fallZoneRef}>
        <div className="catch-line" />

        {/* Falling symbols */}
        {items.map(item => (
          <div
            key={item.id}
            className="falling-symbol"
            style={{
              left: `${laneWidth * item.lane + laneWidth / 2}%`,
              top: `${item.top}px`,
            }}
          >
            {item.symbol}
          </div>
        ))}

        {/* Score popups */}
        {popups.map(p => (
          <div
            key={p.id}
            className={`score-popup ${p.type}`}
            style={{ left: p.x, top: p.y }}
          >
            {p.text}
          </div>
        ))}

        {/* Combo flash */}
        {showCombo && (
          <div className="combo-display">{showCombo}</div>
        )}
      </div>

      {/* Catcher buttons */}
      <div className="mantra-catchers">
        {catchers.map((sym, i) => (
          <button
            key={i}
            className={`catcher-btn ${
              catcherFlash?.index === i
                ? catcherFlash.type === 'correct' ? 'catcher-correct' : 'catcher-wrong'
                : ''
            }`}
            onPointerDown={() => handleCatch(i)}
            touch-action="manipulation"
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Start / Rules overlay */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div className="mantra-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mantra-card">
              <h2>🔱 Mantra Match</h2>
              <p className="subtitle">Catch the sacred symbols before they vanish!</p>

              <div className="symbol-preview">
                {SYMBOLS.map(s => (
                  <div key={s} className="symbol-chip">{s}</div>
                ))}
              </div>

              <div className="rules-list">
                <div className="rule-row">
                  <span>👁️</span>
                  <p><strong>Watch</strong> the falling sacred symbols above.</p>
                </div>
                <div className="rule-row">
                  <span>👇</span>
                  <p><strong>Tap</strong> the matching catcher button at the bottom when the symbol is near the line.</p>
                </div>
                <div className="rule-row">
                  <span>🔥</span>
                  <p><strong>Chain combos</strong> for bonus points — 3+ in a row earns double!</p>
                </div>
                <div className="rule-row">
                  <span>❤️</span>
                  <p>You have <strong>3 lives</strong>. Misses and wrong taps lose one.</p>
                </div>
              </div>

              <div className="discount-tiers-mm">
                <h4>✨ Rewards</h4>
                <div className="tier-row-mm"><span>150+ pts</span><span className="tier-discount-mm">50% OFF</span></div>
                <div className="tier-row-mm"><span>100+ pts</span><span className="tier-discount-mm">35% OFF</span></div>
                <div className="tier-row-mm"><span>60+ pts</span> <span className="tier-discount-mm">25% OFF</span></div>
                <div className="tier-row-mm"><span>&lt; 60 pts</span><span className="tier-discount-mm">15% OFF</span></div>
              </div>

              <button className="start-mantra-btn" onClick={handleStart}>
                Begin the Mantra ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game-over overlay */}
      <AnimatePresence>
        {hasStarted && !isPlaying && gameOver && (
          <motion.div className="mantra-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mantra-card">
              <h2>{gameOver}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                You scored <strong style={{ color: '#FFD700' }}>{score} points</strong>
              </p>
              <div style={{
                background: 'rgba(255,215,0,0.1)', padding: '0.8rem 1.2rem',
                borderRadius: '14px', marginBottom: '1.5rem',
                border: '1px solid rgba(255,215,0,0.25)'
              }}>
                <h3 style={{ color: 'var(--accent-gold)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {calculateDiscount(score)}% OFF Unlocked!
                </h3>
              </div>
              <div className="loading-spinner-mm" />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Proceeding to blessing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MantraMatchGame;

