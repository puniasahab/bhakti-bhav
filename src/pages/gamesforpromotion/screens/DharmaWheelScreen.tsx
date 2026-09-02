import React from 'react';
import { motion } from 'framer-motion';
import DharmaWheelGame from '../components/DharmaWheelGame/DharmaWheelGame';

interface DharmaWheelScreenProps {
  onComplete: (discount: number) => void;
}

const DharmaWheelScreen: React.FC<DharmaWheelScreenProps> = ({ onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
    >
      <DharmaWheelGame onComplete={onComplete} />
    </motion.div>
  );
};

export default DharmaWheelScreen;
