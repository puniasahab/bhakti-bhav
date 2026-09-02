import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FlowerCatchGame.css';

interface FlowerCatchGameProps {
  onComplete: (discount: number) => void;
}

const calculateDiscount = (finalScore: number) => {
  if (finalScore >= 150) return 50;
  if (finalScore >= 100) return 31;
  if (finalScore >= 50) return 21;
  if (finalScore >= 20) return 15;
  return 9;
};

type ItemType = 'FLOWER' | 'THORN';

interface FallingItem {
  id: number;
  lane: number;
  type: ItemType;
  emoji: string;
  topPct: number; // 0-110, percentage from top
}

const FLOWERS = ['🌸', '🪷', '🌺', '🌼'];
const THORNS = ['🪨', '🌑'];
const GAME_DURATION = 20;
const NUM_LANES = 4;
const BASKET_BOTTOM_PCT = 82; // basket visual top in %
const CATCH_ZONE_PCT = 76;   // items caught when they reach this %
const REMOVE_AT_PCT = 85;    // items removed at this % regardless (clips at basket)
const ITEM_SPEED = 0.85;       // % per frame
const SPAWN_INTERVAL_MS = 480; // spawn items much faster

let globalId = 0;

const FlowerCatchGame: React.FC<FlowerCatchGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [basketLane, setBasketLane] = useState(1);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [scorePopups, setScorePopups] = useState<{ id: number; text: string; x: number }[]>([]);

  const basketLaneRef = useRef(basketLane);
  const isPlayingRef = useRef(isPlaying);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const touchStartX = useRef(0);

  useEffect(() => { basketLaneRef.current = basketLane; }, [basketLane]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

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
    if (!isPlaying && timeLeft === 0 && hasStarted) {
      const timeout = setTimeout(() => {
        onComplete(calculateDiscount(score));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, timeLeft, score, hasStarted, onComplete]);

  // Spawner
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      const isFlower = Math.random() > 0.45; // 55% flowers, 45% thorns
      const type: ItemType = isFlower ? 'FLOWER' : 'THORN';
      const arr = isFlower ? FLOWERS : THORNS;
      const emoji = arr[Math.floor(Math.random() * arr.length)];
      const lane = Math.floor(Math.random() * NUM_LANES);
      setItems(prev => [...prev, { id: globalId++, lane, type, emoji, topPct: -8 }]);
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(spawner);
  }, [isPlaying]);

  // RAF physics loop - move items and check collision
  const gameLoop = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) return;

    const delta = lastFrameRef.current ? (timestamp - lastFrameRef.current) / 16.67 : 1;
    lastFrameRef.current = timestamp;

    setItems(prev => {
      const surviving: FallingItem[] = [];
      const caught: { type: ItemType; lane: number }[] = [];

      for (const item of prev) {
        const newTop = item.topPct + ITEM_SPEED * delta;

        // Remove at basket level — whether caught or missed, nothing goes below basket
        if (newTop >= REMOVE_AT_PCT) {
          // Check if it's in the catch zone and same lane
          if (newTop >= CATCH_ZONE_PCT && basketLaneRef.current === item.lane) {
            caught.push({ type: item.type, lane: item.lane });
          }
          continue; // always remove once it hits basket height
        }

        surviving.push({ ...item, topPct: newTop });
      }

      if (caught.length > 0) {
        let delta = 0;
        caught.forEach(c => { delta += c.type === 'FLOWER' ? 10 : -10; });
        setScore(s => Math.max(0, s + delta));

        // Score popups
        caught.forEach(c => {
          const popupId = globalId++;
          const laneX = (c.lane * 25) + 12.5;
          setScorePopups(p => [...p, { id: popupId, text: c.type === 'FLOWER' ? '+10' : '-10', x: laneX }]);
          setTimeout(() => setScorePopups(p => p.filter(pp => pp.id !== popupId)), 800);
        });
      }

      return surviving;
    });

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastFrameRef.current = 0;
      rafRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, gameLoop]);

  const moveBasket = (dir: 'left' | 'right') => {
    if (!isPlaying) return;
    setBasketLane(l => dir === 'left' ? Math.max(l - 1, 0) : Math.min(l + 1, NUM_LANES - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPlaying) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 40) moveBasket('right');
    else if (diff < -40) moveBasket('left');
  };

  const laneLeftPct = (lane: number) => (lane * 25) + 12.5;

  return (
    <div
      className="flower-game-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="game-header">
        <div className="game-score">Score: {score}</div>
        <div className="game-timer">00:{timeLeft.toString().padStart(2, '0')}</div>
      </div>

      {/* Play field */}
      <div className="flower-field">
        {/* Lane lines */}
        {Array.from({ length: NUM_LANES }).map((_, i) => (
          <div key={i} className="lane-divider" style={{ left: `${(i + 1) * 25}%` }} />
        ))}

        {/* Active lane highlight */}
        <div
          className="active-lane-glow"
          style={{ left: `${basketLane * 25}%`, width: '25%' }}
        />

        {/* Falling items */}
        {items.map(item => (
          <div
            key={item.id}
            className={`falling-item ${item.type === 'THORN' ? 'thorn' : ''}`}
            style={{
              left: `${laneLeftPct(item.lane)}%`,
              top: `${item.topPct}%`,
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Score popups */}
        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className={`score-popup ${popup.text.startsWith('+') ? 'positive' : 'negative'}`}
            style={{ left: `${popup.x}%`, top: `${CATCH_ZONE_PCT - 10}%` }}
          >
            {popup.text}
          </div>
        ))}

        {/* Basket */}
        <div
          className="basket"
          style={{
            left: `${laneLeftPct(basketLane)}%`,
            top: `${BASKET_BOTTOM_PCT}%`,
            transition: 'left 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <span className="basket-icon">🧺</span>
        </div>
      </div>

      {/* Arrow controls */}
      {hasStarted && isPlaying && (
        <div className="basket-controls">
          <button
            className="arrow-btn btn-3d"
            onPointerDown={() => moveBasket('left')}
          >
            ◀
          </button>
          <div className="lane-dots">
            {Array.from({ length: NUM_LANES }).map((_, i) => (
              <div key={i} className={`dot ${i === basketLane ? 'active' : ''}`} />
            ))}
          </div>
          <button
            className="arrow-btn btn-3d"
            onPointerDown={() => moveBasket('right')}
          >
            ▶
          </button>
        </div>
      )}

      {/* Rules overlay */}
      {!hasStarted && (
        <div className="rules-overlay">
          <div className="rules-card glass-panel">
            <h2>Divine Catch</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">◀▶</span>
                <p><strong>Move Basket:</strong> Tap arrow buttons or swipe left/right to move your basket.</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">🌸</span>
                <p><strong>Catch Flowers!</strong> Earn +10 points for every blessing caught.</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">🪨</span>
                <p><strong>Avoid Rocks!</strong> Lose -10 points if you catch an obstacle.</p>
              </div>
            </div>
            <div className="discount-tiers">
              <h4>Rewards</h4>
              <div className="tier-row"><span>150+ pts</span> <span className="tier-discount">50% OFF</span></div>
              <div className="tier-row"><span>100+ pts</span> <span className="tier-discount">31% OFF</span></div>
              <div className="tier-row"><span>50+ pts</span> <span className="tier-discount">21% OFF</span></div>
              <div className="tier-row"><span>20+ pts</span> <span className="tier-discount">15% OFF</span></div>
            </div>
            <button
              className="start-game-btn btn-3d"
              onClick={() => { setHasStarted(true); setIsPlaying(true); }}
            >
              Start Catching
            </button>
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {hasStarted && !isPlaying && (
        <div className="game-over-overlay">
          <div className="game-over-card glass-panel">
            <h2>Time's Up! 🌸</h2>
            <p style={{ marginBottom: '1rem' }}>You scored <strong>{score}</strong> points!</p>
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

export default FlowerCatchGame;
