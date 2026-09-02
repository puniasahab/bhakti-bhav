import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './MemoryMatchGame.css';

interface MemoryMatchGameProps {
  onComplete: (discount: number) => void;
}

const EMOJIS = ['🪔', '🌸', '🕉️', '📿', '🥥', '🪷'];
const GAME_DURATION = 25; // 25s — tight enough to matter

const calculateDiscount = (matches: number) => {
  if (matches >= 6) return 50;
  if (matches >= 4) return 31;
  if (matches >= 2) return 21;
  if (matches >= 1) return 15;
  return 9;
};

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [matches, setMatches] = useState(0);
  const isCheckingRef = useRef(false); // lock to prevent 3rd card flip during check

  const initCards = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled);
  };

  // Initialize Cards
  useEffect(() => { initCards(); }, []);

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

  // Match checking logic
  useEffect(() => {
    if (flippedIds.length !== 2) return;
    const [firstId, secondId] = flippedIds;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard?.emoji === secondCard?.emoji) {
      // Match!
      setTimeout(() => {
        setCards(prev => prev.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        ));
        setFlippedIds([]);
        setMatches(m => m + 1);
        isCheckingRef.current = false;
      }, 400);
    } else {
      // No match — flip back
      setTimeout(() => {
        setCards(prev => prev.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isFlipped: false }
            : card
        ));
        setFlippedIds([]);
        isCheckingRef.current = false;
      }, 700);
    }
  }, [flippedIds]);

  // Win Condition
  useEffect(() => {
    if (matches === EMOJIS.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [matches, isPlaying]);

  // End Game transition
  useEffect(() => {
    if (hasStarted && !isPlaying && (timeLeft === 0 || matches === EMOJIS.length)) {
      const timeout = setTimeout(() => {
        onComplete(calculateDiscount(matches));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [hasStarted, isPlaying, timeLeft, matches, onComplete]);

  const handleCardClick = (id: number) => {
    if (!isPlaying) return;
    if (isCheckingRef.current) return; // locked during check
    if (flippedIds.includes(id)) return;
    if (cards.find(c => c.id === id)?.isMatched) return;

    const newFlipped = [...flippedIds, id];
    if (newFlipped.length === 2) isCheckingRef.current = true;

    setCards(prev => prev.map(card => card.id === id ? { ...card, isFlipped: true } : card));
    setFlippedIds(newFlipped);
  };

  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft <= 8 ? '#FF4500' : timeLeft <= 15 ? '#FFA500' : '#7CFC00';

  return (
    <div className="memory-game-container">
      <div className="game-header">
        <div className="game-score">Pairs: {matches}/6</div>
        <div className="game-timer" style={{ color: timerColor }}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Timer progress bar */}
      {hasStarted && isPlaying && (
        <div className="timer-bar-wrap">
          <div
            className="timer-bar-fill"
            style={{ width: `${timerPct}%`, background: timerColor, transition: 'width 1s linear, background 0.5s ease' }}
          />
        </div>
      )}

      <div className="memory-grid">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
            whileHover={!card.isMatched ? { scale: 1.04 } : {}}
            whileTap={!card.isMatched ? { scale: 0.96 } : {}}
          >
            <div className="card-inner">
              <div className="card-front">
                <span>🕉️</span>
              </div>
              <div className="card-back">
                {card.emoji}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rules overlay */}
      {!hasStarted && (
        <motion.div className="rules-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rules-card glass-panel">
            <h2>Memory Match</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">🎴</span>
                <p><strong>Flip & Match:</strong> Tap cards to reveal sacred symbols. Find all pairs!</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">⏱️</span>
                <p><strong>Beat the Clock:</strong> You have 25 seconds. Memorize fast!</p>
              </div>
            </div>
            <div className="discount-tiers">
              <h4>Rewards</h4>
              <div className="tier-row"><span>6 Pairs</span> <span className="tier-discount">50% OFF</span></div>
              <div className="tier-row"><span>4+ Pairs</span> <span className="tier-discount">31% OFF</span></div>
              <div className="tier-row"><span>2+ Pairs</span> <span className="tier-discount">21% OFF</span></div>
              <div className="tier-row"><span>1 Pair</span> <span className="tier-discount">15% OFF</span></div>
            </div>
            <button className="start-game-btn btn-3d" onClick={() => { setHasStarted(true); setIsPlaying(true); }}>
              Start Game
            </button>
          </div>
        </motion.div>
      )}

      {/* Game Over overlay */}
      {hasStarted && !isPlaying && (
        <motion.div className="game-over-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="game-over-card glass-panel">
            <h2>{matches === EMOJIS.length ? '🎉 Divine Memory!' : "Time's Up!"}</h2>
            <p style={{ marginBottom: '1rem' }}>You found <strong>{matches}</strong> pairs!</p>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px 20px', borderRadius: '15px', marginBottom: '2rem', border: '1px solid var(--accent-gold)' }}>
              <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>{calculateDiscount(matches)}% OFF Unlocked!</h3>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Proceeding to blessing...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
