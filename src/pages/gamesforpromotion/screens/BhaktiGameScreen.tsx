import React from 'react';
import { motion } from 'framer-motion';
import BhaktiGame from '../components/BhaktiGame/BhaktiGame';

interface BhaktiGameScreenProps {
  onComplete: (discount: number) => void;
}

const BhaktiGameScreen: React.FC<BhaktiGameScreenProps> = ({ onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
    >
      <BhaktiGame onComplete={onComplete} />
    </motion.div>
  );
};

export default BhaktiGameScreen;
