// utils/deviceRedirect.js

const STORE_URLS = {
  ios: 'https://apps.apple.com/app/your-app/id123456789',
  android: 'https://play.google.com/store/apps/details?id=com.yourapp',
};

export function getDeviceType() {
  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    return 'ios';
  }
  if (/android/i.test(ua)) {
    return 'android';
  }
  return 'desktop'; // fallback
}

export function redirectToStore(customUrls = {}) {
  const urls = { ...STORE_URLS, ...customUrls };
  const device = getDeviceType();

  if (device === 'ios') {
    window.location.href = urls.ios;
  } else if (device === 'android') {
    window.location.href = urls.android;
  }
  // desktop → do nothing, return device type for caller to handle
  return device;
}