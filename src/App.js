import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async'
import { pageView } from './utils/metaPixel';

// ── Firebase debug mode ───────────────────────────────────────────────────
// Set debug_mode = "true" in localStorage to enable Firebase DebugView.
// Remove or set to "false" to disable.
// Change the value below to toggle: true = debug ON, false = debug OFF.
// ─────────────────────────────────────────────────────────────────────────
import { LanguageProvider } from "./contexts/LanguageContext";
import { KathaProvider } from "./contexts/KathaContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { PujaKareProvider } from "./contexts/PujaKareContext";
import { AudioProvider } from "./contexts/AudioContext";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import Splash from "./pages/Splash";
// Import Home directly (not lazy) — it's the main screen,
// should never show a loader when navigating back from other screens
import Home from "./pages/Home";

import VratKatha from "./pages/VratKatha";
import VratKathaDetail from "./pages/VratKathaDetail";
import VratKathaCategoryDetails from "./pages/VratKathaCategoryDetails";
import JaapMala from "./pages/JaapMala";
import NewJaapMala from "./pages/NewJaapMala";
import NewJaapMalaDetails from "./pages/NewJaapMalaDetails";
import JaapMalaDetail from "./pages/JaapMalaDetail";
import Mantra from "./pages/Mantra";
import MantraDetail from "./pages/MantraDetail";
import Aarti from "./pages/Aarti";
import AartiDetail from "./pages/AartiDetail";
import Wallpaper from "./pages/Wallpaper";
import WallpaperDetail from "./pages/WallpaperDetail";
import Rashifal from "./pages/Rashifal";
import HindiCalendar from "./pages/HindiCalendar";
import HindiCalendarDetail from "./pages/HindiCalendarDetail";
import PujaKare from "./pages/PujaKare";
import PujaKareDetail from "./pages/PujaKareDetail";
import Chalisa from "./pages/Chalisa";
import ChalisaDetail from "./pages/ChalisaDetail";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import TermsAndConditions from "./pages/TermsPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Transactions from "./pages/transactions";
import PaymentPage from "./pages/PaymentPage";
import PaymentPay from "./pages/PaymentPay";
import Kundli from "./pages/kundli";
import ParsadPage from "./pages/ParsadPage";
import WinnersList from "./pages/WinnersList";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import PaymentComplete from "./pages/PaymentComplete";
import ContactUs from "./pages/ContactUs";
import Kahaniya from "./pages/Kahaniya";
import KahaniyaDetails from "./pages/KahaniyaDetails";
import AppEvents from "./pages/AppEvents";
import AppEvents1 from "./pages/AppEvents1";


// Wrapper that marks the login flow source when /home-v1 is accessed
function HomeV1Wrapper() {
  useEffect(() => {
    sessionStorage.setItem("loginSource", "home-v1");
  }, []);
  return <Home />;
}

// Wrapper for the regular home — clears any previous home-v1 source
function HomeWrapper() {
  useEffect(() => {
    sessionStorage.removeItem("loginSource");
  }, []);
  return <Home />;
}

function App() {

  const location = useLocation();
  const [loading, setLoading] = useState(() => {
    // Only show splash on first visit to home page, never again in this session
    const splashShown = sessionStorage.getItem("splashShown");
    const isHomePage = location.pathname === "/" || location.pathname === "";
    return !splashShown && isHomePage;
  });

  useEffect(() => {
    if (process.env.REACT_APP_FIREBASE_DEBUG_MODE === "true") {
      localStorage.setItem("debug_mode", "true");
    } else {
      localStorage.removeItem("debug_mode");
    }
  }, []);

  useEffect(() => {
    // If splash was already shown, never show it again
    if (sessionStorage.getItem("splashShown")) {
      setLoading(false);
      return;
    }

    const isHomePage = location.pathname === "/" || location.pathname === "";

    if (isHomePage) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("splashShown", "true");
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      sessionStorage.setItem("splashShown", "true");
    }
    // Only run once on mount — do NOT re-run on location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only show splash on home page
  if (loading && (location.pathname === "/" || location.pathname === "")) return <Splash />;

  function RouteTracker() {
    const location = useLocation();

    useEffect(() => {
      pageView(); // Fires on every route change
    }, [location.pathname]);

    return null;
  }

  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <AudioProvider>
            <KathaProvider>
              <PaymentProvider>
                <PujaKareProvider>
                  <RouteTracker />
                  <Routes>
                    {/* Home is directly imported — no Suspense, no loader, instant render */}
                    <Route path="/" element={<HomeWrapper />} />
                    <Route path="/home-v1" element={<HomeV1Wrapper />} />
                    <Route path="/vrat-katha" element={<VratKatha />} />
                    <Route path="/vrat-katha/:id" element={<VratKathaDetail />} />
                    <Route path="/vrat-katha/:id/date/:date" element={<VratKathaDetail />} />
                    <Route path="/vrat-katha/categoryDetails/:id" element={<VratKathaCategoryDetails />} />
                    <Route path="/jaap-mala" element={<JaapMala />} />
                    <Route path="/newjaapMaala" element={<NewJaapMala />} />
                    <Route path="/newjaapMaala/:categoryId" element={<NewJaapMala />} />
                    <Route path="/newJaapMaala-details/:id" element={<NewJaapMalaDetails />} />
                    <Route path="/newjaapMaala-details/:id" element={<NewJaapMalaDetails />} />
                    <Route path="/jaapmala/:id" element={<JaapMalaDetail />} />
                    <Route path="/mantra" element={<Mantra />} />
                    <Route path="/mantra/:id" element={<MantraDetail />} />
                    <Route path="/aarti" element={<Aarti />} />
                    <Route path="/aarti/:id" element={<AartiDetail />} />
                    <Route path="/wallpaper" element={<Wallpaper />} />
                    <Route path="/wallpaper/:id" element={<WallpaperDetail />} />
                    <Route path="/rashifal" element={<Rashifal />} />
                    <Route path="/hindi-calendar" element={<HindiCalendar />} />
                    <Route path="/hindi-calendar/:id" element={<HindiCalendarDetail />} />
                    <Route path="/puja-kare" element={<PujaKare />} />
                    <Route path="/puja-kare/:id" element={<PujaKareDetail />} />
                    <Route path="/chalisa" element={<Chalisa />} />
                    <Route path="/chalisa/:id" element={<ChalisaDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/termsAndConditions" element={<TermsAndConditions />} />
                    <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/aboutUs" element={<AboutUs />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/paymentPage" element={<PaymentPage />} />
                    <Route path="/PaymentPay" element={<PaymentPay />} />
                    <Route path="/kundli" element={<Kundli />} />
                    <Route path="/parsad" element={<ParsadPage />} />
                    <Route path="/winners" element={<WinnersList />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:id" element={<BlogDetail />} />
                    <Route path="/payment-complete" element={<PaymentComplete />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/kahaniya" element={<Kahaniya />} />
                    <Route path="/kahaniya/:categoryId" element={<Kahaniya />} />
                    <Route path="/kahaniya-details/:contentId" element={<KahaniyaDetails />} />
                    <Route path="/app-events" element={<AppEvents />} />
                    <Route path="/app-events1" element={<AppEvents1 />} />
                  </Routes>
                  <GlobalAudioPlayer />
                </PujaKareProvider>
              </PaymentProvider>
            </KathaProvider>
          </AudioProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
