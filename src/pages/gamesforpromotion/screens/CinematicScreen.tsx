import { useRef } from 'react';
import DivineDiyaGame from '../components/DivineDiyaGame/DivineDiyaGame';
import './CinematicScreen.css';

interface CinematicScreenProps {
  onAnimationComplete: () => void;
}

const CinematicScreen: React.FC<CinematicScreenProps> = ({ onAnimationComplete }) => {
  const gameRef = useRef(null);

  const handleGameCompleted = () => {
    onAnimationComplete();
  };

  return (
    <div className="cinematic-container" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <DivineDiyaGame ref={gameRef} onGameCompleted={handleGameCompleted} />
    </div>
  );
};

export default CinematicScreen;
