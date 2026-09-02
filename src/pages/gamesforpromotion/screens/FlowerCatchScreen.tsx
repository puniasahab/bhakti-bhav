import React from 'react';
import { motion } from 'framer-motion';
import FlowerCatchGame from '../components/FlowerCatchGame/FlowerCatchGame';

interface FlowerCatchScreenProps {
  onComplete: (discount: number) => void;
}

const FlowerCatchScreen: React.FC<FlowerCatchScreenProps> = ({ onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
    >
      <FlowerCatchGame onComplete={onComplete} />
    </motion.div>
  );
};

export default FlowerCatchScreen;
