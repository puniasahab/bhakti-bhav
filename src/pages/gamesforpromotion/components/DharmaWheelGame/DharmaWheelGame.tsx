import React, { useState, useRef } from 'react';
import './DharmaWheelGame.css';

interface DharmaWheelGameProps {
  onComplete: (discount: number) => void;
}

const SLICES = [50, 9, 21, 31, 15, 21];
const SLICE_ANGLE = 360 / SLICES.length; // 60 deg each

const DharmaWheelGame: React.FC<DharmaWheelGameProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'braking' | 'done'>('idle');
  const [displayAngle, setDisplayAngle] = useState(0);
  const [wonDiscount, setWonDiscount] = useState<number | null>(null);

  const rotationRef = useRef(0);  // total accumulated degrees
  const speedRef = useRef(0);     // deg per frame
  const phaseRef = useRef<'idle' | 'spinning' | 'braking' | 'done'>('idle');
  const rafRef = useRef<number>(0);

  const loop = () => {
    if (phaseRef.current === 'idle' || phaseRef.current === 'done') return;

    rotationRef.current += speedRef.current;
    setDisplayAngle(rotationRef.current % 360);

    if (phaseRef.current === 'braking') {
      speedRef.current *= 0.975; // decelerate

      if (speedRef.current < 0.25) {
        // Fully stopped — calculate winner
        const normalizedAngle = (360 - (rotationRef.current % 360)) % 360;
        const winningIndex = Math.floor(normalizedAngle / SLICE_ANGLE) % SLICES.length;
        const discount = SLICES[winningIndex];

        phaseRef.current = 'done';
        setPhase('done');
        setWonDiscount(discount);
        setTimeout(() => onComplete(discount), 3000);
        return; // stop the loop
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  const handleStartSpin = () => {
    setHasStarted(true);
    speedRef.current = 14;
    phaseRef.current = 'spinning';
    setPhase('spinning');
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleStopSpin = () => {
    if (phaseRef.current !== 'spinning') return;
    phaseRef.current = 'braking';
    setPhase('braking');
    // loop is already running — it will detect 'braking' on next frame
  };

  return (
    <div className="wheel-game-container">
      <div className="game-header">
        <div className="game-score">Dharma Wheel</div>
      </div>

      <div className="wheel-wrapper">
        <div className="wheel-needle">▼</div>
        <div
          className="dharma-wheel"
          style={{ transform: `rotate(${displayAngle}deg)` }}
        >
          {SLICES.map((discount, i) => (
            <div
              key={i}
              className="slice-text"
              style={{ transform: `translateX(-50%) rotate(${i * SLICE_ANGLE + SLICE_ANGLE / 2}deg)` }}
            >
              {discount}%
            </div>
          ))}
          <div className="wheel-center">🕉️</div>
        </div>
      </div>

      <div className="wheel-controls">
        {phase === 'spinning' && (
          <button className="stop-wheel-btn" onClick={handleStopSpin}>
            STOP!
          </button>
        )}
        {phase === 'braking' && (
          <p className="stopping-text">Slowing down...</p>
        )}
      </div>

      {/* Rules overlay */}
      {!hasStarted && (
        <div className="rules-overlay">
          <div className="rules-card glass-panel">
            <h2>Dharma Wheel</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-emoji">☸️</span>
                <p><strong>Spin of Fate:</strong> The wheel spins at full speed. It's in karma's hands!</p>
              </div>
              <div className="rule-item">
                <span className="rule-emoji">⚡</span>
                <p><strong>Perfect Timing:</strong> Hit STOP at the right moment to land on 50%!</p>
              </div>
            </div>
            <div className="discount-tiers">
              <h4>Possible Rewards</h4>
              <div className="tier-row"><span>🥇 Best</span> <span className="tier-discount">50% OFF</span></div>
              <div className="tier-row"><span>🥈 Great</span> <span className="tier-discount">31% OFF</span></div>
              <div className="tier-row"><span>🥉 Good</span> <span className="tier-discount">21% OFF</span></div>
              <div className="tier-row"><span>Base</span> <span className="tier-discount">15% OFF</span></div>
            </div>
            <button className="start-game-btn btn-3d" onClick={handleStartSpin}>
              Spin the Wheel
            </button>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {phase === 'done' && wonDiscount !== null && (
        <div className="game-over-overlay">
          <div className="game-over-card glass-panel">
            <h2>The Wheel Has Spoken!</h2>
            <p style={{ marginBottom: '1rem' }}>The divine forces have granted you a blessing.</p>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px 20px', borderRadius: '15px', marginBottom: '2rem', border: '1px solid var(--accent-gold)' }}>
              <h3 style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '2.5rem' }}>{wonDiscount}% OFF!</h3>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Proceeding to blessing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DharmaWheelGame;
