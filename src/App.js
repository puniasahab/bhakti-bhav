import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // DO NOT import BrowserRouter here
import Home from "./pages/Home";
import VratKatha from "./pages/VratKatha";
import JaapMala from "./pages/JaapMala";
import JaapMalaDetail from "./pages/JaapMalaDetail";
import Mantra from "./pages/Mantra";
import MantraDetail from "./pages/MantraDetail";
import Aarti from "./pages/Aarti";
import AartiDetail from "./pages/AartiDetail";
import Wallpaper from "./pages/Wallpaper";
import WallpaperDetail from "./pages/WallpaperDetail";
import Rashifal from "./pages/Rashifal";
// import RashifalDetail from "./pages/RashifalDetail";
import HindiCalendar from "./pages/HindiCalendar";
import PujaKare from "./pages/PujaKare";
import Splash from "./pages/Splash";
import VratKathaDetail from "./pages/VratKathaDetail";
import HindiCalendarDetail from "./pages/HindiCalendarDetail";
import PujaKareDetail from "./pages/PujaKareDetail";
import Chalisa from "./pages/Chalisa";
import ChalisaDetail from "./pages/ChalisaDetail";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import { LanguageProvider } from "./contexts/LanguageContext";
import { KathaProvider } from "./contexts/KathaContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { PujaKareProvider } from "./contexts/PujaKareContext";
import TermsAndConditions from "./pages/TermsPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Transactions from "./pages/transactions";
import PaymentPage from "./pages/PaymentPage";
import VratKathaCategoryDetails from "./pages/VratKathaCategoryDetails";
import Kundli from "./pages/kundli";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");

    if (!splashShown) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("splashShown", "true");
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <Splash />;
  
  return (
    <LanguageProvider>
      <KathaProvider>
        <PaymentProvider>
          <PujaKareProvider>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vrat-katha" element={<VratKatha />} />
            <Route path="/vrat-katha/:id" element={<VratKathaDetail />} />
            <Route path="/jaap-mala" element={<JaapMala />} />
            <Route path="/jaapmala/:id" element={<JaapMalaDetail />} />
            <Route path="/mantra" element={<Mantra />} />
            <Route path="/mantra/:id" element={<MantraDetail />} />
            <Route path="/aarti" element={<Aarti />} />
            <Route path="/aarti/:id" element={<AartiDetail />} />
            <Route path="/wallpaper" element={<Wallpaper />} />
            <Route path="/wallpaper/:id" element={<WallpaperDetail />} />
            <Route path="/rashifal" element={<Rashifal />} />
            {/* <Route path="/rashifal/:id" element={<RashifalDetail />} /> */}
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
            <Route path='/vrat-katha/categoryDetails/:id' element={<VratKathaCategoryDetails />} />
            <Route path="kundli" element = {<Kundli />} />
          </Routes>
          </PujaKareProvider>
        </PaymentProvider>
      </KathaProvider>
    </LanguageProvider>
  );
}

export default App;
