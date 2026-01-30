import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { KathaProvider } from "./contexts/KathaContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { PujaKareProvider } from "./contexts/PujaKareContext";
import { AudioProvider } from "./contexts/AudioContext";
import { AuthProvider } from "./contexts/AuthContext";
import PageLoader from "./components/PageLoader";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import Splash from "./pages/Splash";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
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
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Only show splash screen on home page ("/") and if not shown before in this session
    const splashShown = sessionStorage.getItem("splashShown");
    const isHomePage = location.pathname === "/" || location.pathname === "";

    if (!splashShown && isHomePage) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("splashShown", "true");
        // Preload common routes after splash
        preloadCommonRoutes();
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      if (!splashShown) {
        sessionStorage.setItem("splashShown", "true");
      }
      // Preload common routes
      preloadCommonRoutes();
    }
  }, [location.pathname]);

  // Only show splash on home page
  if (loading && (location.pathname === "/" || location.pathname === "")) return <Splash />;

  return (
    <AuthProvider>
      <AudioProvider>
        <LanguageProvider>
          <KathaProvider>
            <PaymentProvider>
              <PujaKareProvider>
                <Suspense >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/vrat-katha" element={<VratKatha />} />
                    <Route path="/vrat-katha/:id" element={<VratKathaDetail />} />
                    <Route path="/vrat-katha/:id/date/:date" element={<VratKathaDetail />} />
                    <Route path="/vrat-katha/categoryDetails/:id" element={<VratKathaCategoryDetails />} />
                    <Route path="/jaap-mala" element={<JaapMala />} />
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
                    <Route path="/kundli" element={<Kundli />} />
                  </Routes>
                </Suspense>
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
