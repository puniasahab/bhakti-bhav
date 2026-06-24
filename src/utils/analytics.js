const GA_ID_PRIMARY = process.env.REACT_APP_GA_ID_PRIMARY;
const GA_ID_SECONDARY = process.env.REACT_APP_GA_ID_SECONDARY;
const EVENT_DEDUPE_WINDOW_MS = 1000;
const recentEvents = new Map();

const gtag = (...args) => {
  if (window.gtag) window.gtag(...args);
};

const getEventKey = (event, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${event}:${JSON.stringify(sortedParams)}`;
};

const shouldTrackEvent = (event, params = {}) => {
  const key = getEventKey(event, params);
  const now = Date.now();
  const lastTrackedAt = recentEvents.get(key);

  if (lastTrackedAt && now - lastTrackedAt < EVENT_DEDUPE_WINDOW_MS) {
    return false;
  }

  recentEvents.set(key, now);
  return true;
};

// Send to both (default)
export const trackEvent = (event, params = {}) => {
  if (!shouldTrackEvent(event, params)) return;
  gtag("event", event, params);
};

export const trackGA4Event = (event, params) => {
    if (!shouldTrackEvent(event, params)) return;

    queueMicrotask(() => {
    if (typeof window === "undefined" || !window.gtag) {
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
  if (!shouldTrackEvent(event, { ...params, send_to: GA_ID_PRIMARY })) return;
  gtag("event", event, {
    ...params,
    send_to: GA_ID_PRIMARY
  });
};

export const trackEventToSecondary = (event, params = {}) => {
  if (!shouldTrackEvent(event, { ...params, send_to: GA_ID_SECONDARY })) return;
  gtag("event", event, {
    ...params,
    send_to: GA_ID_SECONDARY
  });
};
