import React, { useEffect, useRef } from "react";

import { GA4Events } from "../utils/ga4Events.enum";
import { splashScreenApi } from "../api";
import { AUTH_TOKEN_KEY, getDeviceId, getDeviceTokenFromLS, getFirebaseAppInstanceIdFromLS, getTokenFromLS, getUserIdFromLS, setTokenInLS, setUserIdInLS } from "../commonFunctions";

import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";

const getSplashPlatform = () => {
  // const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
  // if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  // if (/android/i.test(userAgent)) return "android";
  return "web";
};

const getSplashCountryCode = () => {
  const language = navigator.language || "";
  return language.toLowerCase().includes("-in") ? "91" : "91";
};

const getSplashAuthData = (response) => {
  const queue = [response];
  const visited = new Set();
  let token = null;
  let userId = null;

  while (queue.length > 0 && (!token || !userId)) {
    const item = queue.shift();
    if (!item || typeof item !== "object" || visited.has(item)) continue;

    visited.add(item);

    token = token || item.token || item.accessToken || item.authToken || item.jwt;
    userId = userId || item.userId || item._id || item.id;

    Object.values(item).forEach((value) => {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    });
  }

  return {
    token,
    userId
  };
};

function Splash() {

  const baseParams = useGA4BaseParams("splash_screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const fetchSplashScreenData = async () => {
      try {
        const deviceId = getDeviceId();

        let payload = {
          firebaseAppInstanceId: getFirebaseAppInstanceIdFromLS(),
          deviceId,
          deviceToken: getDeviceTokenFromLS(),
          appVersion: process.env.REACT_APP_VERSION || "testversion",
          platform: getSplashPlatform(),
          countryCode: getSplashCountryCode()
        };
        const newUserId = getUserIdFromLS();
        if (!newUserId) {
          payload.userId = newUserId
        }
        const response = await splashScreenApi.getSplashScreenData("v1", payload);
        const { token, userId } = getSplashAuthData(response);

        if (userId) {
          setUserIdInLS(userId);
        }

        if (token) {
          const savedToken = setTokenInLS(token);
          console.log(`Splash token saved in localStorage key "${AUTH_TOKEN_KEY}":`, !!savedToken, getTokenFromLS());
          console.log(getTokenFromLS(), " got token saved inside local storage at", new Date().toLocaleTimeString());
        } else {
          console.warn("Splash screen API response does not include token:", response);
        }

        console.log("Splash screen API response:", response);
      } catch (error) {
        console.error("Error fetching splash screen API response:", error);
      }
    };

    fetchSplashScreenData();

    if (!hasTrackedRef.current) {
      trackEvent(GA4Events.website_splash_screen_displayed);
      hasTrackedRef.current = true;
    }
  }, [trackEvent]);


  return (
    <div className="flex items-center justify-center h-screen relative">
      <div className="absolute inset-0 top-0 md:w-[15%] md:left-[35%]">
        <div className="w-[90%] h-[45%] md:w-[100%] md:h-[30%] 
        bg-[url('https://bhaktibhav.app/img/bell-img.png')]
         bg-contain bg-no-repeat"/>
      </div>

      <div className="flex flex-col items-center text-center  z-10">
        <img
          // src="./img/logo_splash.png"
          src="https://bhaktibhav.app/img/logo_splash.png"
          alt="Logo"
          className="w-[192px] h-[184px] mb-4"
        />
        <div className="flex justify-center items-center theme_text font-hindi bg-[url('./img/border_bg.png')] bg-no-repeat splash_bg pb-3">
          <p className="p-6 text-3xl ">fgUnh dySaMj] iapkax frfFk] <br /> R;ksgkj] ozr dFkk] pkyhlk]<br /> vkjrh laxzg] ea=] tkiekyk</p>
        </div>
      </div>
    </div>
  );
}

export default Splash;
