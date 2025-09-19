import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './App.css'
import {Provider} from 'react-redux';
import Home from './screens/Home'
import TermsAndConditions from './screens/termsAndConditions'
import PrivacyPolicy from './screens/privacyPolicy'
import AboutUs from './screens/aboutUs'
import Wallpapers from './screens/wallpapers'
import Rashifal from './screens/rashifal';
import { store } from "../store";
import JaapMala from './screens/jaapMala';
import HindiCalendar from './screens/hindiCalendar';
import Katha from './screens/katha';
import IkadashiKatha from './screens/katha/ikadashi';
import Pooja from './screens/pooja';
import GanpatiPooja from './screens/pooja/ganpatiPooja';

// Component to handle scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Provider store = {store} >
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/termsAndConditions" element={<TermsAndConditions />} />
        <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/rashifal" element={<Rashifal />} />
        <Route path="/jaapMala" element={<JaapMala />} />
        <Route path="/hindiCalendar" element={<HindiCalendar />} />
        <Route path="/katha" element={<Katha />} />
        <Route path="/ikadashi" element={<IkadashiKatha />} />
        <Route path="/pooja" element={<Pooja />} />
        <Route path="/ganpatiPooja" element={<GanpatiPooja />} />
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
