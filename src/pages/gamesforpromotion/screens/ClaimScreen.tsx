import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClaimScreen.css';

interface ClaimScreenProps {
  onVerify: (phone: string, otp: string) => Promise<boolean>;
}

const ClaimScreen: React.FC<ClaimScreenProps> = ({ onVerify }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      setStep('otp');
      setError('');
    } else {
      setError('Please enter a valid phone number');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit on last
    if (index === 5 && value !== '') {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (fullOtp: string) => {
    if (fullOtp.length !== 6) return;
    setLoading(true);
    setError('');
    const success = await onVerify(phone, fullOtp);
    if (!success) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="claim-container"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="claim-message">
        🙏 <br /><br />
        Your Divine Blessing has been reserved.<br />
        Claim it now.
      </div>

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div className="input-group">
              <span className="country-code">+91</span>
              <input
                type="tel"
                className="phone-input"
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <motion.button
              className="cta-button"
              onClick={handlePhoneSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send OTP
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Enter OTP sent to +91 {phone}
            </div>
            <div className="otp-container">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  disabled={loading}
                />
              ))}
            </div>
            {error && <div className="error-message">{error}</div>}
            {loading && <div style={{ color: 'var(--accent-gold)' }}>Verifying...</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClaimScreen;
