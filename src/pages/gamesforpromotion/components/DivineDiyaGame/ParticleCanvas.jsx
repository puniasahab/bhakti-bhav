import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const ParticleCanvas = forwardRef(({ active }, ref) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const energyWaves = useRef([]);
  const animationFrameId = useRef(null);
  const centerPoint = useRef({ x: window.innerWidth / 2, y: window.innerHeight * 0.5 }); // Temple center

  useImperativeHandle(ref, () => ({
    spawnSparks: (x, y) => {
      // Spawn tiny golden sparks
      for (let i = 0; i < 15; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2,
          life: 1,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#ffd700' : '#ff9900'
        });
      }
    },
    addEnergyWave: (startX, startY) => {
      // Draw a connecting wave to center
      energyWaves.current.push({
        startX, startY,
        progress: 0,
        active: true
      });
    },
    celebrate: () => {
      // Massive petal/particle explosion
      for (let i = 0; i < 150; i++) {
        particles.current.push({
          x: Math.random() * window.innerWidth,
          y: -10 - Math.random() * 50,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 5 + 2,
          life: 2, // Lasts longer
          size: Math.random() * 6 + 2,
          color: ['#ffd700', '#ff9900', '#ffb347', '#ff6600'][Math.floor(Math.random()*4)],
          isPetal: Math.random() > 0.7
        });
      }
    },
    clear: () => {
      particles.current = [];
      energyWaves.current = [];
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      centerPoint.current = { x: canvas.width / 2, y: canvas.height * 0.5 };
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!active) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      // Draw Energy Waves
      energyWaves.current.forEach(wave => {
        if (!wave.active) return;
        wave.progress += 0.02;
        if (wave.progress > 1) wave.progress = 1;
        
        const currentX = wave.startX + (centerPoint.current.x - wave.startX) * wave.progress;
        const currentY = wave.startY + (centerPoint.current.y - wave.startY) * wave.progress;

        ctx.beginPath();
        ctx.moveTo(wave.startX, wave.startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 * (1 - wave.progress)})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd700';
        ctx.stroke();
      });

      // Update and Draw Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        let p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        // Gravity for petals
        if (p.isPetal) {
          p.vx += Math.sin(p.life * 10) * 0.1; // fluttering
        } else {
          p.vy += 0.1; // gravity for sparks
        }

        if (p.life <= 0 || p.y > canvas.height) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life > 1 ? 1 : p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.isPetal ? 0 : 5;
        ctx.shadowColor = p.color;

        if (p.isPetal) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 5);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [active]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none'
      }}
    />
  );
});

export default ParticleCanvas;
