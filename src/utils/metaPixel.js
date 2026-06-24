import ReactPixel from 'react-facebook-pixel';

const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID; // 🔁 Replace with your actual Pixel ID
let isPixelInitialized = false;
let lastPageViewPath = "";

const options = {
  autoConfig: true,       // Auto-configure based on fbq settings
  debug: false,
};

export const initPixel = () => {
  if (!PIXEL_ID || isPixelInitialized) return;

  ReactPixel.init(PIXEL_ID, {}, options);
  isPixelInitialized = true;
};

export const pageView = () => {
  if (!isPixelInitialized) return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (currentPath === lastPageViewPath) return;

  lastPageViewPath = currentPath;
  ReactPixel.pageView();
};

export const trackFacebookPixelEvent = (event, data = {}) => {
  if (!isPixelInitialized) return;
  ReactPixel.track(event, data);
};

export const trackCustomEvent = (eventName, data = {}) => {
  if (!isPixelInitialized) return;
  ReactPixel.trackCustom(eventName, data);
};
