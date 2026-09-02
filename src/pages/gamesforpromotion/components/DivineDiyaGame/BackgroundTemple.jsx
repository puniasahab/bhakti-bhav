import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { gridPositions } from './DiyaGrid';
import godImage from '../../assets/divine_deity_bg.png';

const BackgroundTemple = ({ litDiyas }) => {
  const raysRef = useRef(null);
  const totalDiyas = 9;
  const isComplete = litDiyas.length === totalDiyas;

  useEffect(() => {
    // Ambient breathing for background rays (when complete)
    gsap.to(raysRef.current, {
      rotation: '+=5',
      scale: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 8,
      ease: 'sine.inOut'
    });
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#000',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {/* Base Deity Image */}
      <img 
        src={godImage} 
        alt="Divine Deity" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          position: 'absolute',
          filter: isComplete ? 'brightness(1.2) contrast(1.1)' : 'none',
          transition: 'filter 3s ease',
        }}
      />
      
      {/* Lighting Overlay - Multiplies with the image beneath */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isComplete ? '#FFF' : '#222', // #222 gives a ~15% base brightness. Goes white at the end.
          mixBlendMode: 'multiply',
          transition: 'background-color 3s ease',
        }}
      >
        {/* Render a white radial gradient for each lit diya */}
        {gridPositions.map(pos => {
          const isLit = litDiyas.includes(pos.id);
          return (
            <div
              key={pos.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                width: '80vmin', // Large radius
                height: '80vmin',
                background: 'radial-gradient(circle, #FFF 0%, rgba(255,255,255,0) 60%)',
                opacity: isLit ? 1 : 0,
                transition: 'opacity 1s ease-out',
                mixBlendMode: 'screen', // Additive blending within this layer
              }}
            />
          );
        })}
      </div>

      {/* Divine rays (hidden initially, shown fully at end) */}
      <div 
        ref={raysRef}
        style={{
          position: 'absolute',
          top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
          background: 'conic-gradient(from 0deg at 50% 40%, transparent 0deg, rgba(255, 200, 100, 0.4) 20deg, transparent 40deg, transparent 80deg, rgba(255, 200, 100, 0.3) 100deg, transparent 120deg, transparent 240deg, rgba(255, 200, 100, 0.4) 260deg, transparent 280deg, transparent 360deg)',
          opacity: isComplete ? 0.6 : 0,
          mixBlendMode: 'screen',
          transition: 'opacity 3s ease',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default BackgroundTemple;
