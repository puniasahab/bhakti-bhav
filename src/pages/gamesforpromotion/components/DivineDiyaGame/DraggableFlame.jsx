import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const DraggableFlame = ({ onDrag, active, visible }) => {
  const flameRef = useRef(null);
  
  useEffect(() => {
    if (visible && active) {
      // Continuous flicker for the draggable flame
      gsap.to(flameRef.current, {
        scaleX: 1.05,
        scaleY: 1.15,
        y: -3,
        opacity: 0.9,
        yoyo: true,
        repeat: -1,
        duration: 0.12,
        ease: 'power1.inOut',
        transformOrigin: "50% 80%"
      });
    } else {
      gsap.killTweensOf(flameRef.current);
    }
  }, [active, visible]);

  if (!visible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDrag={onDrag}
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        width: 80,
        height: 80,
        zIndex: 100,
        cursor: active ? 'grab' : 'default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        touchAction: 'none',
      }}
      whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
    >
      <div ref={flameRef} style={{ pointerEvents: 'none' }}>
        <svg width="80" height="120" viewBox="0 0 100 140" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="drag-flame-grad" cx="50%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#fff8cc" />
              <stop offset="60%" stopColor="#ffa600" />
              <stop offset="100%" stopColor="#ff2200" />
            </radialGradient>
            <filter id="super-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="16" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo */}
          <circle cx="50" cy="90" r="40" fill="#ffa600" opacity="0.2" filter="blur(15px)" />
          
          {/* Flame Body */}
          <path 
            d="M50 20 Q30 70 30 90 A 20 20 0 0 0 70 90 Q70 70 50 20 Z" 
            fill="url(#drag-flame-grad)" 
            filter="url(#super-glow)" 
          />
          
          {/* Inner Core */}
          <path 
            d="M50 50 Q40 80 40 90 A 10 10 0 0 0 60 90 Q60 80 50 50 Z" 
            fill="#ffffff" 
            filter="blur(2px)" 
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default DraggableFlame;
