import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';

import './QuestionsScreen.css';

interface QuestionsScreenProps {
  onComplete: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    title: 'Chanting the names of the Divine brings me deep inner peace and clarity.',
    image: '/chanting_meditation.jpg',
    leftOption: { title: 'DISAGREE', label: 'SWIPE LEFT' },
    rightOption: { title: 'AGREE', label: 'SWIPE RIGHT' },
    correctAnswer: 'right'
  },
  {
    id: 2,
    title: 'True devotion (Bhakti) requires abandoning all family and worldly duties.',
    image: '/divine_love.jpg',
    leftOption: { title: 'DISAGREE', label: 'SWIPE LEFT' },
    rightOption: { title: 'AGREE', label: 'SWIPE RIGHT' },
    correctAnswer: 'left'
  },
  {
    id: 3,
    title: 'Offering our daily actions as a service to God (Karma Yoga) purifies our consciousness.',
    image: '/offering_hands.jpg',
    leftOption: { title: 'DISAGREE', label: 'SWIPE LEFT' },
    rightOption: { title: 'AGREE', label: 'SWIPE RIGHT' },
    correctAnswer: 'right'
  }
];

const QuestionsScreen: React.FC<QuestionsScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  
  const controls = useAnimation();
  const x = useMotionValue(0);
  
  // Transform values for floating arrows based on drag
  const leftArrowOpacity = useTransform(x, [-100, -20, 0], [1, 0.5, 0]);
  const leftArrowScale = useTransform(x, [-100, 0], [1.2, 1]);
  const leftArrowColor = useTransform(x, [-100, -20], ['#FF4757', '#666666']);
  
  const rightArrowOpacity = useTransform(x, [0, 20, 100], [0, 0.5, 1]);
  const rightArrowScale = useTransform(x, [0, 100], [1, 1.2]);
  const rightArrowColor = useTransform(x, [20, 100], ['#666666', '#2ED573']);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    controls.start({ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } });
  }, [currentIndex, controls]);

  const handleDragEnd = async (_event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    let swipedDirection: 'left' | 'right' | null = null;
    if (offset > 100 || velocity > 500) {
      swipedDirection = 'right';
    } else if (offset < -100 || velocity < -500) {
      swipedDirection = 'left';
    }

    if (swipedDirection) {
      if (swipedDirection === QUESTIONS[currentIndex].correctAnswer) {
        await controls.start({ x: swipedDirection === 'right' ? 500 : -500, rotate: swipedDirection === 'right' ? 15 : -15, opacity: 0, transition: { duration: 0.3 } });
        handleAnswer(swipedDirection);
      } else {
        controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        setShowWrongAnswer(true);
      }
    } else {
      // Return to center
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleAnswer = (direction: 'left' | 'right') => {
    setScore(prev => prev + (direction === 'right' ? 150 : 50));
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Reset controls for the new top card
      controls.set({ x: 0, rotate: 0, opacity: 1 });
      x.set(0);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      className="questions-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="progress-header">
        <div className="score-text">SCORE: {score}</div>
        <div className="timer-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <motion.h2 
        key={`title-${currentIndex}`}
        className="question-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {QUESTIONS[currentIndex]?.title}
      </motion.h2>

      <div className="cards-container">
        {QUESTIONS.map((question, index) => {
          if (index < currentIndex) return null; // Hide swiped cards
          const isTop = index === currentIndex;
          const offset = index - currentIndex;

          return (
            <motion.div
              key={question.id}
              className="swipe-card glass-panel"
              style={{ 
                x: isTop ? x : 0, 
                zIndex: QUESTIONS.length - index 
              }}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={isTop ? handleDragEnd : undefined}
              animate={
                isTop 
                  ? controls 
                  : { scale: 1 - offset * 0.05, y: offset * 20, opacity: 1, rotate: 0 }
              }
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              whileTap={isTop ? { scale: 0.95, cursor: 'grabbing' } : {}}
              whileDrag={isTop ? { scale: 1.05 } : {}}
            >
              {isTop && (
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: '24px', opacity: 0.8, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  ↔
                </div>
              )}
              <img src={question.image} alt="Question" className="card-image" />
              <div className="card-overlay" />
            </motion.div>
          );
        })}

        <motion.div 
          className="floating-arrow left"
          style={{
            opacity: leftArrowOpacity,
            scale: leftArrowScale,
            color: leftArrowColor
          }}
        >
          «
        </motion.div>
        <motion.div 
          className="floating-arrow right"
          style={{
            opacity: rightArrowOpacity,
            scale: rightArrowScale,
            color: rightArrowColor
          }}
        >
          »
        </motion.div>
      </div>

      <div className="labels-row">
        <div className="label-group">
          <div className="badge false">✕</div>
          <span className="label-text">
            SWIPE LEFT<br />FOR <span className="label-highlight false">DISAGREE</span>
          </span>
        </div>

        <div className="label-group">
          <div className="badge true">✓</div>
          <span className="label-text">
            SWIPE RIGHT<br />FOR <span className="label-highlight true">AGREE</span>
          </span>
        </div>
      </div>

      <div className="instruction-text">Swipe to Answer !</div>

      <div className="bottom-actions">
        <button className="skip-btn" onClick={() => handleNextQuestion()}>Skip</button>
        <button className="pause-btn">Pause</button>
      </div>

      <AnimatePresence>
        {showWrongAnswer && (
          <motion.div 
            className="wrong-answer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="wrong-answer-content glass-panel"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <h3>✕ Incorrect</h3>
              <p>That's not the right answer. Please try again!</p>
              <button 
                className="try-again-btn btn-3d" 
                onClick={() => {
                  setShowWrongAnswer(false);
                  setCurrentIndex(0);
                  setScore(0);
                  controls.set({ x: 0, rotate: 0, opacity: 1 });
                  x.set(0);
                }}
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionsScreen;
