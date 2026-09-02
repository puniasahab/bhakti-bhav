import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './GameSelectionScreen.css';

const GAMES = [
  { id: 'asura', title: 'Banish Asuras', desc: 'Tap fast to clear negative energy!', emoji: '👹', route: '/gamesforpromotion/game/asura' },
  { id: 'catch', title: 'Divine Catch', desc: 'Catch falling blessings in your basket.', emoji: '🌸', route: '/gamesforpromotion/game/catch' },
  { id: 'memory', title: 'Memory Match', desc: 'Find the sacred pairs quickly.', emoji: '🎴', route: '/gamesforpromotion/game/memory' },
  { id: 'wheel', title: 'Dharma Wheel', desc: 'Test your exact timing to hit the jackpot!', emoji: '☸️', route: '/gamesforpromotion/game/wheel' },
  { id: 'diya', title: 'Balance the Diya', desc: 'Keep the sacred flame steady against the wind.', emoji: '🪔', route: '/gamesforpromotion/game/diya' },
  // { id: 'bell', title: 'Temple Bell', desc: 'Ring the bell at the perfect moment!', emoji: '🔔', route: '/gamesforpromotion/game/bell' },
  { id: 'mantra', title: 'Mantra Match', desc: 'Catch the sacred symbols before they vanish!', emoji: '🔱', route: '/gamesforpromotion/game/mantra' },
];

const GameSelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="game-selection-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="selection-header">
        <h2>Choose Your Path</h2>
        <p>Select a divine challenge to earn your blessing discount!</p>
      </div>

      <div className="game-cards-grid">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            className="game-card glass-panel"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(game.route)}
            whileTap={{ scale: 0.95 }}
          >
            <div className="game-emoji">{game.emoji}</div>
            <div className="game-info">
              <h3>{game.title}</h3>
              <p>{game.desc}</p>
            </div>
            <button className="play-now-btn">Play</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GameSelectionScreen;
