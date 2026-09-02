import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './DiyaBalanceGame.css';

interface DiyaBalanceGameProps {
  onComplete: (discount: number) => void;
}

const TOTAL_TIME = 20;

const calculateDiscount = (timeSurvived: number) => {
  if (timeSurvived >= 20) return 50;
  if (timeSurvived >= 15) return 31;
  if (timeSurvived >= 10) return 21;
  return 15;
};

const DiyaBalanceGame: React.FC<DiyaBalanceGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);

  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const windForce = useRef(0);
  const buttonForce = useRef(0);
  
  // Transform background aura based on position to warn user
  const auraColor = useTransform(
    x,
    [-130, 0, 130],
    ['rgba(255, 60, 60, 0.6)', 'rgba(255, 215, 0, 0.3)', 'rgba(255, 60, 60, 0.6)']
  );

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeSurvived(prev => {
        if (prev >= TOTAL_TIME - 1) {
          setIsPlaying(false);
          setGameOverReason("Divine Balance Achieved!");
          return TOTAL_TIME;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Wind Force Generator
  useEffect(() => {
    if (!isPlaying) return;
    const windTimer = setInterval(() => {
      // Random wind force between -4 and 4
      // Increase difficulty slightly over time based on timeSurvived
      const difficultyMultiplier = 1 + (timeSurvived / 10);
      const newForce = (Math.random() - 0.5) * 8 * difficultyMultiplier;
      windForce.current = newForce;
    }, 800);
    return () => clearInterval(windTimer);
  }, [isPlaying, timeSurvived]);

  // Physics Loop
  const updatePhysics = () => {
    if (!isPlaying) return;

    const currentX = x.get();
    
    // Add wind force and button force
    x.set(currentX + windForce.current + buttonForce.current);

    // Check bounds (assuming track is ~300px wide, bounds are roughly -140 to +140)
    if (currentX < -140 || currentX > 140) {
      setIsPlaying(false);
      setGameOverReason("The wind blew the flame out!");
    } else {
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Clean up button force on unmount or game end
  useEffect(() => {
    if (!isPlaying) {
      buttonForce.current = 0;
    }
  }, [isPlaying]);

  // End Game Transition
  useEffect(() => {
    if (hasStarted && !isPlaying && gameOverReason) {
      const timeout = setTimeout(() => {
        onComplete(calculateDiscount(timeSurvived));
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [hasStarted, isPlaying, gameOverReason, timeSurvived, onComplete]);

  const handleStart = () => {
    x.set(0);
    windForce.current = 0;
    buttonForce.current = 0;
    setTimeSurvived(0);
    setGameOverReason(null);
    setHasStarted(true);
    setIsPlaying(true);
  };

  return (
    <div className="diya-game-container">
      <div className="game-header">
        <div className="game-timer">Time: {timeSurvived}s / {TOTAL_TIME}s</div>
      </div>

      <div className="diya-track-container" ref={containerRef}>
        <motion.div 
          className="safe-zone-aura"
          style={{ backgroundColor: auraColor }}
        />
        <div className="track-line">
          <div className="center-mark" />
        </div>
        
        <motion.div 
          className="diya-element"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -140, right: 140 }}
          dragElastic={0}
          dragMomentum={false}
          whileTap={{ scale: 1.1 }}
        >
          <div className="flame">🔥</div>
          <div className="lamp">🪔</div>
        </motion.div>
      </div>

      <div className="instruction-text">
        <p>Use buttons to counter the wind!</p>
        <p className="wind-indicator">
          {windForce.current < -1 ? '💨 Wind blowing Left' : windForce.current > 1 ? 'Wind blowing Right 💨' : 'Calm...'}
        </p>
      </div>

      {hasStarted && isPlaying && (
        <div className="controls-container">
          <button 
            className="control-btn left-btn btn-3d"
            onPointerDown={() => buttonForce.current = -6}
            onPointerUp={() => buttonForce.current = 0}
            onPointerLeave={() => buttonForce.current = 0}
            onContextMenu={(e) => e.preventDefault()}
          >
            ⟵ Push Left
          </button>
          <button 
            className="control-btn right-btn btn-3d"
            onPointerDown={() => buttonForce.current = 6}
            onPointerUp={() => buttonForce.current = 0}
            onPointerLeave={() => buttonForce.current = 0}
            onContextMenu={(e) => e.preventDefault()}
          >
            Push Right ⟶
          </button>
        </div>
      )}

      {!hasStarted && (
        <motion.div className="rules-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rules-card glass-panel">
            <h2>Balance the Diya</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">🪔</span>
                <p><strong>Stay Centered:</strong> Keep the sacred flame away from the edges.</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">💨</span>
                <p><strong>Counter the Wind:</strong> Chaotic winds will push the Diya. Hold the left or right buttons to counter it!</p>
              </div>
            </div>
            <div className="discount-tiers">
              <h4>Rewards</h4>
              <div className="tier-row"><span>20 Seconds</span> <span className="tier-discount">50% OFF</span></div>
              <div className="tier-row"><span>15 Seconds</span> <span className="tier-discount">31% OFF</span></div>
              <div className="tier-row"><span>10 Seconds</span> <span className="tier-discount">21% OFF</span></div>
              <div className="tier-row"><span>&lt;10 Seconds</span> <span className="tier-discount">15% OFF</span></div>
            </div>
            <button className="start-game-btn btn-3d" onClick={handleStart}>
              Start Balancing
            </button>
          </div>
        </motion.div>
      )}

      {hasStarted && !isPlaying && gameOverReason && (
        <motion.div className="game-over-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="game-over-card glass-panel">
            <h2>{gameOverReason}</h2>
            <p style={{ marginBottom: '1rem' }}>You balanced the Diya for <strong>{timeSurvived} seconds</strong>!</p>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px 20px', borderRadius: '15px', marginBottom: '2rem', border: '1px solid var(--accent-gold)' }}>
              <h3 style={{ color: 'var(--accent-gold)', margin: 0 }}>{calculateDiscount(timeSurvived)}% OFF Unlocked!</h3>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Proceeding to blessing...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DiyaBalanceGame;
