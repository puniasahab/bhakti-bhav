import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress, visible }) => {
  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'absolute',
        top: '3%',
        right: '5%',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: '40%',
        maxWidth: '200px'
      }}
    >
      <div style={{ 
        color: '#ffd700', 
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        marginBottom: '10px',
        fontFamily: 'serif'
      }}>
        ✨ Divine Blessing ✨
      </div>
      
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <motion.div 
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #ff9900, #ffd700)',
            boxShadow: '0 0 10px #ffd700'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        />
      </div>
      
      <div style={{
        color: '#ffcca3',
        fontSize: '0.9rem',
        marginTop: '6px'
      }}>
        {Math.round(progress)}%
      </div>
    </motion.div>
  );
};

export default ProgressBar;
