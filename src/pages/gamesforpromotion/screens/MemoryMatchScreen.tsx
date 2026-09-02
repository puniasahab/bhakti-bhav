import React from 'react';
import { motion } from 'framer-motion';
import MemoryMatchGame from '../components/MemoryMatchGame/MemoryMatchGame';

interface MemoryMatchScreenProps {
  onComplete: (discount: number) => void;
}

const MemoryMatchScreen: React.FC<MemoryMatchScreenProps> = ({ onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
    >
      <MemoryMatchGame onComplete={onComplete} />
    </motion.div>
  );
};

export default MemoryMatchScreen;
