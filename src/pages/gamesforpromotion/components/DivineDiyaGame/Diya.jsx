import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Diya.css';

const Diya = ({ id, lit, x, y, onLitEvent }) => {
  const diyaRef = useRef(null);
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    if (lit && !isLit) {
      setIsLit(true);
      // Vibration animation only for the base
      gsap.to(diyaRef.current, {
        x: '+=2',
        yoyo: true,
        repeat: 3,
        duration: 0.05,
        ease: 'power1.inOut'
      });
      
      if (onLitEvent) {
        onLitEvent(id, x, y);
      }
    } else if (!lit) {
      setIsLit(false);
      gsap.killTweensOf(diyaRef.current);
      gsap.set(diyaRef.current, { x: 0 });
    }
  }, [lit, id, x, y, onLitEvent, isLit]);

  return (
    <div 
      className="diya-container" 
      ref={diyaRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        width: 80,
        height: 80,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <defs>
          <filter id={`brass-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id={`brass-grad-${id}`} cx="50%" cy="30%" r="50%" fx="50%" fy="20%">
            <stop offset="0%" stopColor="#f7d070" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6d1c" />
          </radialGradient>
          <radialGradient id={`flame-grad-${id}`} cx="50%" cy="70%" r="50%" fx="50%" fy="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fff3b0" />
            <stop offset="70%" stopColor="#ff9900" />
            <stop offset="100%" stopColor="#ff3300" />
          </radialGradient>
          <radialGradient id={`halo-grad-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Ambient Glow behind flame */}
        <circle cx="50" cy="35" r="0" fill={`url(#halo-grad-${id})`} className={isLit ? "glow-active" : "glow-inactive"} />

        {/* Flame SVG Path centered at 0,0 and translated */}
        <g transform="translate(50, 50)">
          <g className={isLit ? "flame-active" : "flame-inactive"}>
            <path d="M0 -30 Q-10 -10 -10 0 A 10 10 0 0 0 10 0 Q10 -10 0 -30 Z" fill={`url(#flame-grad-${id})`} filter="drop-shadow(0 0 4px #ff9900)" />
            {/* Inner bright core */}
            <path d="M0 -15 Q-5 -5 -5 0 A 5 5 0 0 0 5 0 Q5 -5 0 -15 Z" fill="#ffffff" filter="blur(1px)" />
          </g>
        </g>

        {/* Diya Base */}
        <g filter="drop-shadow(0px 8px 6px rgba(0,0,0,0.6))">
          {/* Top bowl rim */}
          <ellipse cx="50" cy="55" rx="30" ry="10" fill="#a68422" />
          <ellipse cx="50" cy="54" rx="28" ry="8" fill="#523e0a" />
          
          {/* Front wick holder (spout) */}
          <path d="M50 63 L45 50 L55 50 Z" fill="#d4af37" />
          
          {/* Main bowl body */}
          <path d="M20 55 C20 75, 40 85, 50 85 C60 85, 80 75, 80 55 C80 60, 60 68, 50 68 C40 68, 20 60, 20 55 Z" fill={`url(#brass-grad-${id})`} />
          
          {/* Stand */}
          <path d="M40 85 L35 95 L65 95 L60 85 Z" fill={`url(#brass-grad-${id})`} />
        </g>
      </svg>
    </div>
  );
};

export default Diya;
