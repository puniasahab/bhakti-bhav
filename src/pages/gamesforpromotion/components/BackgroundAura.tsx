import React, { useMemo } from 'react';
import './BackgroundAura.css';

export type AuraTheme = 'mystic' | 'fire' | 'serene' | 'gold';

interface BackgroundAuraProps {
  theme?: AuraTheme;
}

const BackgroundAura: React.FC<BackgroundAuraProps> = ({ theme = 'mystic' }) => {
  // Generate 25 floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 15
    }));
  }, []);

  return (
    <div className={`background-container theme-${theme}`}>
      <div className="aura-layer layer-1"></div>
      <div className="aura-layer layer-2"></div>
      <div className="aura-layer layer-3"></div>
      
      <div className="particles-container">
        {particles.map(p => (
          <div 
            key={p.id}
            className="particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundAura;
