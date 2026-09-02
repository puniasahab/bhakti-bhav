import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingScreen.css';

interface LandingScreenProps {
  onStart: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
      onStart();
    }, 400); // Ripple delay
  };

  return (
    <div className="landing-container">
      <motion.div
        className="content-wrapper glass-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="hero-illustration"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <div className="hero-logo-circle">
            <span className="logo-text-top">भक्ति</span>
            <span className="logo-text-bottom">भाव</span>
          </div>
        </motion.div>

        <motion.h1
          className="landing-title text-gradient-gold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Receive Your<br />Divine Blessing
        </motion.h1>

        <motion.p
          className="landing-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Answer 3 devotional questions and unlock your personalized Divine Blessing. */}
        </motion.p>

        <motion.button
          className="start-button btn-3d"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onClick={handlePress}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Your Journey
          <AnimatePresence>
            {isPressed && (
              <motion.div
                className="cta-ripple"
                initial={{ opacity: 0.5, scale: 0 }}
                animate={{ opacity: 0, scale: 2.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
