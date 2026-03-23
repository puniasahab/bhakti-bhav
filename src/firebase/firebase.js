// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLoe9hw6JjA3igGU5uGjd1R4bqzNaYgOg",
    authDomain: "bhakti-bhav-f507b.firebaseapp.com",
    projectId: "bhakti-bhav-f507b",
    storageBucket: "bhakti-bhav-f507b.firebasestorage.app",
    messagingSenderId: "553054076489",
    appId: "1:553054076489:web:6b42aa599266b1eabb4998",
    measurementId: "G-8VDVBY46R5"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// analytics is initialized once, asynchronously, at module load time
let analytics = null;

const initAnalyticsOnLoad = async () => {
    try {
        const supported = await isSupported();
        if (supported) {
            analytics = getAnalytics(app);
            console.log("[Firebase] Analytics initialized successfully ✅");
        } else {
            console.warn("[Firebase] Analytics not supported in this environment ⚠️");
        }
    } catch (err) {
        console.error("[Firebase] Analytics initialization failed ❌", err);
    }
};

// Call immediately so analytics is ready before any trackEvent call
initAnalyticsOnLoad();

/**
 * Track a custom GA event.
 * Logs to console in every environment so you can verify params easily.
 * If localStorage has debug_mode = "true", appends debug_mode:1 so
 * Firebase DebugView picks up the event in real-time.
 */
export const trackEvent = (eventName, params = {}) => {
    const isDebug = localStorage.getItem("debug_mode") === "true";

    const finalParams = isDebug ? { ...params, debug_mode: 1 } : params;

    // Always log to console for visibility
    console.log(`[Firebase trackEvent] 📊 "${eventName}"`, finalParams);

    if (analytics) {
        logEvent(analytics, eventName, finalParams);
        console.log(`[Firebase trackEvent] ✅ Sent to Firebase Analytics${isDebug ? " (DEBUG MODE 🐛)" : ""}`);
    } else {
        console.warn(`[Firebase trackEvent] ⚠️ Analytics not ready yet — event "${eventName}" was NOT sent to Firebase`);
    }
};