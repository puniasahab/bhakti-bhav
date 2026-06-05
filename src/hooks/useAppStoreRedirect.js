// hooks/useAppStoreRedirect.js
import { useState, useEffect } from 'react';
import { getDeviceType } from '../utils/deviceRedirect';

const STORE_URLS = {
  ios: 'https://apps.apple.com/us/app/bhakti-bhav-mantra-puja-app/id6752835678#information',
  android: 'https://play.google.com/store/apps/details?id=com.bhakti_bhav&pcampaignid=web_share',
};

export function useAppStoreRedirect() {
  const [deviceType, setDeviceType] = useState(null);

  useEffect(() => {
    setDeviceType(getDeviceType()); // runs only on client, safe for SSR
  }, []);

  const redirectToStore = () => {
    if (deviceType === 'ios')     window.location.href = STORE_URLS.ios;
    if (deviceType === 'android') window.location.href = STORE_URLS.android;
  };

  return { deviceType, redirectToStore, storeUrls: STORE_URLS };
}