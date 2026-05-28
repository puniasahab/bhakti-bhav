    import ReactPixel from 'react-facebook-pixel';

const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID; // 🔁 Replace with your actual Pixel ID

const options = {
  autoConfig: true,       // Auto-configure based on fbq settings
  debug: true,           // Set to true during development
};

export const initPixel = () => {
  ReactPixel.init(PIXEL_ID, {}, options);
};

export const pageView = () => {
  ReactPixel.pageView();
};

export const trackFacebookPixelEvent = (event, data = {}) => {
  ReactPixel.track(event, data);
};

export const trackCustomEvent = (eventName, data = {}) => {
  ReactPixel.trackCustom(eventName, data);
};