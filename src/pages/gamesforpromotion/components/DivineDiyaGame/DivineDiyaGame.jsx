import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import BackgroundTemple from './BackgroundTemple';
import DiyaGrid, { gridPositions } from './DiyaGrid';
import DraggableFlame from './DraggableFlame';
import ParticleCanvas from './ParticleCanvas';
import ProgressBar from './ProgressBar';
import { useAudio } from '../../hooks/useAudio';
import './DivineDiyaGame.css'; // Optional CSS variables if needed

const DivineDiyaGame = forwardRef(({ onGameCompleted }, ref) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [litDiyas, setLitDiyas] = useState([]);
  const [completed, setCompleted] = useState(false);
  
  const particleCanvasRef = useRef(null);
  const { playBell, playConch } = useAudio();
  const flamePosRef = useRef({ x: 0, y: 0 });

  // Expose API
  useImperativeHandle(ref, () => ({
    startGame: () => {
      setLitDiyas([]);
      setCompleted(false);
      setIsPlaying(true);
      if (particleCanvasRef.current) {
        particleCanvasRef.current.clear();
      }
    },
    resetGame: () => {
      setLitDiyas([]);
      setCompleted(false);
      setIsPlaying(false);
      if (particleCanvasRef.current) {
        particleCanvasRef.current.clear();
      }
    },
    destroyGame: () => {
      setIsPlaying(false);
    }
  }));

  const handleDrag = (event, info) => {
    if (completed || !isPlaying) return;
    
    // We get pointer coordinates from the drag event
    const x = info.point.x;
    const y = info.point.y;
    flamePosRef.current = { x, y };

    // Collision detection with grid positions
    // We convert percentages to pixels based on window size
    const w = window.innerWidth;
    const h = window.innerHeight;

    gridPositions.forEach(pos => {
      if (litDiyas.includes(pos.id)) return;

      const px = parseFloat(pos.x) / 100 * w;
      const py = parseFloat(pos.y) / 100 * h;

      const dist = Math.hypot(x - px, y - py);
      if (dist < 50) { // Collision threshold (40-50px)
        lightDiya(pos.id, px, py);
      }
    });
  };

  const lightDiya = (id, px, py) => {
    setLitDiyas(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      
      // Play audio
      playBell();
      
      // Visual FX
      if (particleCanvasRef.current) {
        particleCanvasRef.current.spawnSparks(px, py);
        particleCanvasRef.current.addEnergyWave(px, py);
      }
      
      return next;
    });
  };

  useEffect(() => {
    if (litDiyas.length === 9 && !completed) {
      setCompleted(true);
      handleCompletion();
    }
  }, [litDiyas, completed]);

  const handleCompletion = () => {
    playConch();
    if (particleCanvasRef.current) {
      // Small delay then massive celebration
      setTimeout(() => {
        particleCanvasRef.current.celebrate();
      }, 500);
    }
    
    // Callback after delay
    setTimeout(() => {
      if (onGameCompleted) onGameCompleted();
    }, 4000);
  };

  const progress = (litDiyas.length / 9) * 100;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <BackgroundTemple litDiyas={litDiyas} />
      
      <ProgressBar progress={progress} visible={isPlaying && !completed} />
      
      <ParticleCanvas ref={particleCanvasRef} active={isPlaying} />
      
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: completed ? 0 : 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <DiyaGrid 
          litDiyas={litDiyas} 
          onDiyaLitEvent={(id, x, y) => {}} 
        />
      </motion.div>
      
      <DraggableFlame 
        active={!completed} 
        visible={isPlaying && !completed} 
        onDrag={handleDrag} 
      />
      
    </div>
  );
});

export default DivineDiyaGame;
