import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import './RewardScreen.css';

interface RewardScreenProps {
  discount: number;
  onClaim: () => void;
}

const RewardScreen: React.FC<RewardScreenProps> = ({ discount, onClaim }) => {
  // Generate random floating petals
  const petals = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <motion.div 
      className="reward-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1 }}
    >
      {discount >= 50 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FFD700', '#CD7F32', '#FFF8DC', '#DAA520']} style={{zIndex: 100}} />}
      {petals.map(p => (
        <motion.div
          key={p.id}
          className="floating-petal"
          initial={{ y: '-10vh', left: `${p.x}vw`, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
        />
      ))}

      <motion.div 
        className="scroll-container"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 }}
        style={{ transformOrigin: "top center" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="reward-title">✨ Divine Blessing Received 🎉</div>
          <div className="reward-value">{discount}% OFF</div>
          <div className="reward-subtitle">On your next offering</div>
        </motion.div>
      </motion.div>

      <motion.button 
        className="claim-btn btn-3d"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 100 }}
        onClick={onClaim}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Claim My Blessing
      </motion.button>
    </motion.div>
  );
};

export default RewardScreen;
