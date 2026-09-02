import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BhaktiGame.css';

interface BhaktiGameProps {
  onComplete: (discount: number) => void;
}

const calculateDiscount = (finalScore: number) => {
  if (finalScore >= 150) return 50; // Max realistically achievable in 20s
  if (finalScore >= 100) return 31;
  if (finalScore >= 50) return 21;
  if (finalScore >= 20) return 15;
  return 9;
};

type EntityType = 'ASURA' | 'SACRED' | null;

interface GridCell {
  id: number;
  type: EntityType;
  emoji: string;
}

const ASURA_EMOJIS = ['👹', '👺', '👿'];
const SACRED_EMOJIS = ['🪔', '🌸', '🕉️', '🥥'];

const GRID_SIZE = 9; // 3x3 grid
const GAME_DURATION = 20; // 20 seconds

const BhaktiGame: React.FC<BhaktiGameProps> = ({ onComplete }) => {
  const [grid, setGrid] = useState<GridCell[]>(
    Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, type: null, emoji: '' }))
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  // Handle Game Over
  useEffect(() => {
    if (!isPlaying && timeLeft === 0) {
      const timeout = setTimeout(() => {
        onComplete(calculateDiscount(score));
      }, 3500); // Show score and discount for 3.5s
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, timeLeft, score, onComplete]);

  // Entity Spawning Logic
  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(() => {
      setGrid((currentGrid) => {
        const newGrid = [...currentGrid];
        
        // Pick a random empty cell
        const emptyCells = newGrid.filter((cell) => cell.type === null);
        if (emptyCells.length === 0) return currentGrid;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 70% chance Asura, 30% chance Sacred
        const isAsura = Math.random() > 0.3;
        const type: EntityType = isAsura ? 'ASURA' : 'SACRED';
        const emojiList = isAsura ? ASURA_EMOJIS : SACRED_EMOJIS;
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

        newGrid[randomCell.id] = { id: randomCell.id, type, emoji };

        // Auto-remove after 1.5s
        setTimeout(() => {
          setGrid((g) => {
            const gCopy = [...g];
            // Only clear if it hasn't been tapped/changed
            if (gCopy[randomCell.id].emoji === emoji) {
              gCopy[randomCell.id] = { id: randomCell.id, type: null, emoji: '' };
            }
            return gCopy;
          });
        }, 1500);

        return newGrid;
      });
    }, 800); // Spawn every 800ms

    return () => clearInterval(spawnInterval);
  }, [isPlaying]);

  const handleTap = (cell: GridCell) => {
    if (!isPlaying || cell.type === null) return;

    if (cell.type === 'ASURA') {
      setScore((s) => s + 10);
    } else if (cell.type === 'SACRED') {
      setScore((s) => Math.max(0, s - 10)); // Prevent negative score
    }

    // Clear the cell immediately upon tap
    setGrid((currentGrid) => {
      const newGrid = [...currentGrid];
      newGrid[cell.id] = { id: cell.id, type: null, emoji: '' };
      return newGrid;
    });
  };

  return (
    <div className="bhakti-game-container">
      <div className="game-header">
        <div className="game-score">Score: {score}</div>
        <div className="game-timer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="game-instructions">
        <h3>Banish Asuras!</h3>
        <p>Tap 👹 to gain points. Avoid sacred 🪔 items!</p>
      </div>

      <div className="game-grid">
        {grid.map((cell) => (
          <div key={cell.id} className="grid-cell" onClick={() => handleTap(cell)}>
            <div className="cloud-base"></div>
            <AnimatePresence>
              {cell.type !== null && (
                <motion.div
                  className="game-entity"
                  initial={{ y: 50, scale: 0.5, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 50, scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  whileTap={{ scale: 0.8 }}
                >
                  {cell.emoji}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {!hasStarted && (
        <motion.div 
          className="rules-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="rules-card">
            <h2>How to Play</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">👹</span>
                <p><strong>Banish Asuras!</strong> Tap demons to earn +10 points.</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">🪔</span>
                <p><strong>Avoid Blessings!</strong> Tapping sacred items loses -10 points.</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">⏱️</span>
                <p><strong>Be Quick!</strong> You only have 20 seconds to score high and unlock a bigger discount!</p>
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
              className="start-game-btn"  
              onClick={() => {
                setHasStarted(true);
                setIsPlaying(true);
              }}
            >
              Start Game
            </button>
          </div>
        </motion.div>
      )}

      {hasStarted && !isPlaying && (
        <motion.div 
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="game-over-card">
            <h2>Time's Up!</h2>
            <p style={{ marginBottom: '1rem' }}>You scored <strong>{score}</strong> points!</p>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px 20px', borderRadius: '15px', marginBottom: '2rem', border: '1px solid var(--accent-gold)' }}>
              <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>{calculateDiscount(score)}% OFF Unlocked!</h3>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Proceeding to blessing...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BhaktiGame;
