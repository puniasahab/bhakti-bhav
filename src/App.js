import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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

// Lazy load all other pages for code splitting
const VratKatha = lazy(() => import("./pages/VratKatha"));
const VratKathaDetail = lazy(() => import("./pages/VratKathaDetail"));
const VratKathaCategoryDetails = lazy(() => import("./pages/VratKathaCategoryDetails"));
const JaapMala = lazy(() => import("./pages/JaapMala"));
const JaapMalaDetail = lazy(() => import("./pages/JaapMalaDetail"));
const Mantra = lazy(() => import("./pages/Mantra"));
const MantraDetail = lazy(() => import("./pages/MantraDetail"));
const Aarti = lazy(() => import("./pages/Aarti"));
const AartiDetail = lazy(() => import("./pages/AartiDetail"));
const Wallpaper = lazy(() => import("./pages/Wallpaper"));
const WallpaperDetail = lazy(() => import("./pages/WallpaperDetail"));
const Rashifal = lazy(() => import("./pages/Rashifal"));
const HindiCalendar = lazy(() => import("./pages/HindiCalendar"));
const HindiCalendarDetail = lazy(() => import("./pages/HindiCalendarDetail"));
const PujaKare = lazy(() => import("./pages/PujaKare"));
const PujaKareDetail = lazy(() => import("./pages/PujaKareDetail"));
const Chalisa = lazy(() => import("./pages/Chalisa"));
const ChalisaDetail = lazy(() => import("./pages/ChalisaDetail"));
const Login = lazy(() => import("./pages/Login"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const TermsAndConditions = lazy(() => import("./pages/TermsPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Payment = lazy(() => import("./pages/Payment"));
const Transactions = lazy(() => import("./pages/transactions"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const Kundli = lazy(() => import("./pages/kundli"));
const ParsadPage = lazy(() => import("./pages/ParsadPage"));
const WinnersList = lazy(() => import("./pages/WinnersList"));
const Blogs = lazy(() => import("./pages/Blogs"));
const PaymentComplete = lazy(() => import("./pages/PaymentComplete"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

// Preload commonly accessed routes after initial render
const preloadCommonRoutes = () => {
  setTimeout(() => {
    import("./pages/Aarti");
    import("./pages/Chalisa");
    import("./pages/Mantra");
    import("./pages/JaapMala");
  }, 2000);
};

function App() {

  const FIREBASE_DEBUG_MODE = true;
 localStorage.setItem("debug_mode", String(FIREBASE_DEBUG_MODE));
  const location = useLocation();
  const [loading, setLoading] = useState(() => {
    // Only show splash on first visit to home page, never again in this session
    const splashShown = sessionStorage.getItem("splashShown");
    const isHomePage = location.pathname === "/" || location.pathname === "";
    return !splashShown && isHomePage;
  });

  useEffect(() => {
    // If splash was already shown, never show it again
    if (sessionStorage.getItem("splashShown")) {
      setLoading(false);
      preloadCommonRoutes();
      return;
    }

    const isHomePage = location.pathname === "/" || location.pathname === "";

    if (isHomePage) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("splashShown", "true");
        preloadCommonRoutes();
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      sessionStorage.setItem("splashShown", "true");
      preloadCommonRoutes();
    }
    // Only run once on mount — do NOT re-run on location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only show splash on home page
  if (loading && (location.pathname === "/" || location.pathname === "")) return <Splash />;

  return (
    <AuthProvider>
      <AudioProvider>
        <LanguageProvider>
          <KathaProvider>
            <PaymentProvider>
              <PujaKareProvider>
                <Routes>
                  {/* Home is directly imported — no Suspense, no loader, instant render */}
                  <Route path="/" element={<Home />} />
                  {/* All other routes are lazy-loaded with Suspense (no fallback loader) */}
                  <Route path="/vrat-katha" element={<Suspense><VratKatha /></Suspense>} />
                  <Route path="/vrat-katha/:id" element={<Suspense><VratKathaDetail /></Suspense>} />
                  <Route path="/vrat-katha/:id/date/:date" element={<Suspense><VratKathaDetail /></Suspense>} />
                  <Route path="/vrat-katha/categoryDetails/:id" element={<Suspense><VratKathaCategoryDetails /></Suspense>} />
                  <Route path="/jaap-mala" element={<Suspense><JaapMala /></Suspense>} />
                  <Route path="/jaapmala/:id" element={<Suspense><JaapMalaDetail /></Suspense>} />
                  <Route path="/mantra" element={<Suspense><Mantra /></Suspense>} />
                  <Route path="/mantra/:id" element={<Suspense><MantraDetail /></Suspense>} />
                  <Route path="/aarti" element={<Suspense><Aarti /></Suspense>} />
                  <Route path="/aarti/:id" element={<Suspense><AartiDetail /></Suspense>} />
                  <Route path="/wallpaper" element={<Suspense><Wallpaper /></Suspense>} />
                  <Route path="/wallpaper/:id" element={<Suspense><WallpaperDetail /></Suspense>} />
                  <Route path="/rashifal" element={<Suspense><Rashifal /></Suspense>} />
                  <Route path="/hindi-calendar" element={<Suspense><HindiCalendar /></Suspense>} />
                  <Route path="/hindi-calendar/:id" element={<Suspense><HindiCalendarDetail /></Suspense>} />
                  <Route path="/puja-kare" element={<Suspense><PujaKare /></Suspense>} />
                  <Route path="/puja-kare/:id" element={<Suspense><PujaKareDetail /></Suspense>} />
                  <Route path="/chalisa" element={<Suspense><Chalisa /></Suspense>} />
                  <Route path="/chalisa/:id" element={<Suspense><ChalisaDetail /></Suspense>} />
                  <Route path="/login" element={<Suspense><Login /></Suspense>} />
                  <Route path="/verify-otp" element={<Suspense><VerifyOtp /></Suspense>} />
                  <Route path="/termsAndConditions" element={<Suspense><TermsAndConditions /></Suspense>} />
                  <Route path="/privacyPolicy" element={<Suspense><PrivacyPolicy /></Suspense>} />
                  <Route path="/aboutUs" element={<Suspense><AboutUs /></Suspense>} />
                  <Route path="/profile" element={<Suspense><Profile /></Suspense>} />
                  <Route path="/edit-profile" element={<Suspense><EditProfile /></Suspense>} />
                  <Route path="/payment" element={<Suspense><Payment /></Suspense>} />
                  <Route path="/transactions" element={<Suspense><Transactions /></Suspense>} />
                  <Route path="/paymentPage" element={<Suspense><PaymentPage /></Suspense>} />
                  <Route path="/kundli" element={<Suspense><Kundli /></Suspense>} />
                  <Route path="/parsad" element={<Suspense><ParsadPage /></Suspense>} />
                  <Route path="/winners" element={<Suspense><WinnersList /></Suspense>} />
                  <Route path="/blogs" element={<Suspense><Blogs /></Suspense>} />
                  <Route path="/payment-complete" element={<Suspense><PaymentComplete /></Suspense>} />
                  <Route path="/contact-us" element={<Suspense><ContactUs /></Suspense>} />
                </Routes>
                <GlobalAudioPlayer />
              </PujaKareProvider>
            </PaymentProvider>
          </KathaProvider>
        </LanguageProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
