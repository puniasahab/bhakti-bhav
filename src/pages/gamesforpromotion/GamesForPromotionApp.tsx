import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import { AnimatePresence } from 'framer-motion';
import BackgroundAura, { type AuraTheme } from './components/BackgroundAura';
import LandingScreen from './screens/LandingScreen';
import QuestionsScreen from './screens/QuestionsScreen';
import GameSelectionScreen from './screens/GameSelectionScreen';
import BhaktiGameScreen from './screens/BhaktiGameScreen';
import FlowerCatchScreen from './screens/FlowerCatchScreen';
import MemoryMatchScreen from './screens/MemoryMatchScreen';
import DharmaWheelScreen from './screens/DharmaWheelScreen';
import DiyaBalanceGame from './components/DiyaBalanceGame/DiyaBalanceGame';
// import TempleBellGame from './components/TempleBellGame/TempleBellGame';
import MantraMatchGame from './components/MantraMatchGame/MantraMatchGame';
import CinematicScreen from './screens/CinematicScreen';
import RewardScreen from './screens/RewardScreen';
import ClaimScreen from './screens/ClaimScreen';
import SuccessScreen from './screens/SuccessScreen';
import { verifyOTPAndGenerateCoupon } from './api/mockBackend';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [discount, setDiscount] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('divineDiscount') || '0', 10);
  });
  const [sessionId, setSessionId] = useState<string>(() => {
    return sessionStorage.getItem('divineSessionId') || '';
  });
  const [couponCode, setCouponCode] = useState<string>(() => {
    return sessionStorage.getItem('divineCoupon') || '';
  });

  const handleStart = () => {
    // navigate('/gamesforpromotion/questions');
    navigate('/gamesforpromotion/game-selection');
  };

  const handleQuestionsComplete = () => {
    navigate('/gamesforpromotion/game-selection');
  };

  const handleMiniGameComplete = (earnedDiscount: number) => {
    // Save to state and storage
    setDiscount(earnedDiscount);
    sessionStorage.setItem('divineDiscount', earnedDiscount.toString());

    // Generate session ID
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    sessionStorage.setItem('divineSessionId', newSessionId);

    navigate('/gamesforpromotion/reward');
  };

  const handleAnimationComplete = () => {
    navigate('/gamesforpromotion/reward');
  };

  const handleClaim = () => {
    navigate('/gamesforpromotion/claim');
  };

  const handleVerify = async (phone: string, otp: string): Promise<boolean> => {
    try {
      const result = await verifyOTPAndGenerateCoupon(phone, otp, sessionId, discount);
      if (result.success && result.couponCode) {
        setCouponCode(result.couponCode);
        sessionStorage.setItem('divineCoupon', result.couponCode);
        navigate('/gamesforpromotion/success');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const getTheme = (): AuraTheme => {
    const path = location.pathname;
    if (path.includes('/game/asura')) return 'fire';
    if (path.includes('/game/catch') || path.includes('/game/memory')) return 'serene';
    if (path.includes('/game/wheel')) return 'mystic';
    if (path.includes('/game/diya')) return 'fire';
    // if (path.includes('/game/bell')) return 'serene';
    if (path.includes('/game/mantra')) return 'mystic';
    if (path.includes('/reward') || path.includes('/success') || path.includes('/claim')) return 'gold';
    return 'mystic';
  };

  const getProtectedGameElement = (element: any) => {
    if (couponCode) return <Navigate to="/gamesforpromotion/success" replace />;
    if (sessionId) return <Navigate to="/gamesforpromotion/reward" replace />;
    return element;
  };

  const getProtectedPostGameElement = (element: any) => {
    if (couponCode) return <Navigate to="/gamesforpromotion/success" replace />;
    if (!sessionId) return <Navigate to="/gamesforpromotion" replace />;
    return element;
  };

  return (
    <>
      <BackgroundAura theme={getTheme()} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={getProtectedGameElement(<LandingScreen onStart={handleStart} />)} />
          <Route path="questions" element={getProtectedGameElement(<QuestionsScreen onComplete={handleQuestionsComplete} />)} />
          <Route path="game-selection" element={getProtectedGameElement(<GameSelectionScreen />)} />
          <Route path="game/asura" element={getProtectedGameElement(<BhaktiGameScreen onComplete={handleMiniGameComplete} />)} />
          <Route path="game/catch" element={getProtectedGameElement(<FlowerCatchScreen onComplete={handleMiniGameComplete} />)} />
          <Route path="game/memory" element={getProtectedGameElement(<MemoryMatchScreen onComplete={handleMiniGameComplete} />)} />
          <Route path="game/wheel" element={getProtectedGameElement(<DharmaWheelScreen onComplete={handleMiniGameComplete} />)} />
          <Route path="game/diya" element={getProtectedGameElement(<DiyaBalanceGame onComplete={handleMiniGameComplete} />)} />
          {/* <Route path="game/bell" element={getProtectedGameElement(<TempleBellGame onComplete={handleMiniGameComplete} />)} /> */}
          <Route path="game/mantra" element={getProtectedGameElement(<MantraMatchGame onComplete={handleMiniGameComplete} />)} />
          <Route path="cinematic" element={getProtectedGameElement(<CinematicScreen onAnimationComplete={handleAnimationComplete} />)} />
          <Route path="reward" element={getProtectedPostGameElement(<RewardScreen discount={discount} onClaim={handleClaim} />)} />
          <Route path="claim" element={getProtectedPostGameElement(<ClaimScreen onVerify={handleVerify} />)} />
          <Route path="success" element={
            couponCode ? <SuccessScreen couponCode={couponCode} discount={discount} /> : <Navigate to="/gamesforpromotion" replace />
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
