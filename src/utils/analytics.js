const GA_ID_PRIMARY = process.env.REACT_APP_GA_ID_PRIMARY;
const GA_ID_SECONDARY = process.env.REACT_APP_GA_ID_SECONDARY;

const gtag = (...args) => {
  if (window.gtag) window.gtag(...args);
};

// Send to both (default)
export const trackEvent = (event, params = {}) => {
  gtag("event", event, params);
};

export const trackGA4Event = (event, params) => {
    queueMicrotask(() => {
    if (typeof window === "undefined" || !window.gtag) {
      console.warn(`GA4: gtag not initialized for event: ${event}`);
      return;
    }

    try {
      window.gtag("event", event, { ...params });
    } catch (err) {
      console.error("GA4 tracking failed:", err);
    }
  });
};

// Send to specific ID
export const trackEventToPrimary = (event, params = {}) => {
  gtag("event", event, {
    ...params,
    send_to: GA_ID_PRIMARY
  });
};

export const trackEventToSecondary = (event, params = {}) => {
  gtag("event", event, {
    ...params,
    send_to: GA_ID_SECONDARY
  });
};