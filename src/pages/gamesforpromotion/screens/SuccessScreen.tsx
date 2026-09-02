import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Copy, Check } from 'lucide-react';
import './SuccessScreen.css';

interface SuccessScreenProps {
  couponCode: string;
  discount: number;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ couponCode, discount }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-container">
      <Confetti width={window.innerWidth} height={window.innerHeight} colors={['#FFD700', '#CD7F32', '#FFF8DC', '#DAA520']} />

      <motion.div
        className="success-card glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <div className="success-icon">✨🏺✨</div>
        <h2 className="success-message text-gradient-gold">Jai Shri Krishna 🙏</h2>
        <p className="success-submessage">Your blessing has been successfully claimed.</p>

        <motion.div
          className="coupon-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        >
          <div className="coupon-header">
            <span className="coupon-logo">DIVINE BLESSING</span>
            <span className="coupon-discount">{discount}% OFF</span>
          </div>

          <div className="coupon-code-container">
            <div className="coupon-code">{couponCode}</div>
          </div>

          <div className="coupon-footer">
            <span>Valid for:</span>
            <span className="timer">{formatTime(timeLeft)}</span>
          </div>
        </motion.div>

        <motion.div
          className="action-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={16} /> Copied
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Copy size={16} /> Copy Code
              </span>
            )}
          </button>
          <button className="btn-3d" onClick={() => window.location.href = '/'}>
            Return to Beginning
          </button>
        </motion.div>

        <motion.div
          className="info-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>Coupon has been sent to <strong>SMS</strong> and <strong>WhatsApp</strong> if available.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
