import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, IndianRupee, Search, UserRound } from "lucide-react";
import { getTokenFromLS } from "../commonFunctions";
import "./VratKathaHeader.css";

export default function DevotionalHeader({ children, backRoute, fallbackRoute = "/", reading = false, pageName, fontSizePx, onResetFont, onIncreaseFont, language }) {
  const navigate = useNavigate();
  const location = useLocation();
  const surfaceRef = useRef(null);
  const [height, setHeight] = useState(120);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const measure = () => setHeight(surface.getBoundingClientRect().height);
    measure();
    // Reserve enough space even when a translated title wraps or fonts load.
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(surface);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const goBack = () => {
    if (backRoute) navigate(backRoute);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallbackRoute);
  };

  return (
    <>
      <div ref={surfaceRef} className={`vrat-katha-header-surface ${reading ? "is-reading" : ""}`}>
        <div className="container mx-auto vrat-katha-header-inner">
          <header className="vrat-katha-header-bar">
            <div className="vrat-katha-header-brand">
              <button type="button" className="vrat-katha-header-back" aria-label="Go Back" onClick={goBack}>
                <ChevronLeft size={reading ? 30 : 24} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <span className="vrat-katha-header-label font-devanagari">
                {reading ? (language === "en" ? pageName?.en : pageName?.hi) : "भक्ति भाव"}
              </span>
            </div>
            {reading ? (
              <div className="vrat-katha-font-actions font-eng">
                <button type="button" onClick={onResetFont} title="Normal Font Size (16px)" aria-pressed={fontSizePx === 16}>A</button>
                <button type="button" onClick={onIncreaseFont} title={`Increase Font Size (Current: ${fontSizePx}px, Max: 26px)`} aria-pressed={fontSizePx > 16}>A+</button>
              </div>
            ) : (
              <div className="vrat-katha-header-actions">
                <button type="button" aria-label="Search" onClick={() => navigate("/search", { state: { from: location.pathname + location.search } })}>
                  <Search size={24} strokeWidth={2.3} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Payment" onClick={() => navigate(getTokenFromLS() ? "/payment" : "/login")}>
                  <IndianRupee size={23} strokeWidth={2.5} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Profile" onClick={() => navigate(getTokenFromLS() ? "/profile" : "/login")}>
                  <UserRound size={23} strokeWidth={2.3} aria-hidden="true" />
                </button>
              </div>
            )}
          </header>
          {children}
        </div>
      </div>
      <div style={{ height }} aria-hidden="true" />
    </>
  );
}
