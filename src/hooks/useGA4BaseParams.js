import { useMemo } from "react";
import { getBrowserName, getDeviceId, getMobileNoFromLS, getSessionId, getSubscriptionPlanFromLS, getSubscriptionStatusFromLS, getTokenFromLS, getUserIdFromLS } from "../commonFunctions";


const useGA4BaseParams = (screenName) => {
    const isLoggedIn = !!getTokenFromLS();
    const isSubscribed = getSubscriptionStatusFromLS();

    const baseParams = useMemo(() => ({
        user_id: isLoggedIn ? (getUserIdFromLS() || "anonymous") : "anonymous",
        device_id: getDeviceId(),
        platform: getBrowserName(),
        session_id: getSessionId(),
        user_type: isLoggedIn ? (isSubscribed ? "paid" : "free") : "free",
        subscription_plan: isLoggedIn ? getSubscriptionPlanFromLS() : "none",
        language: "en",
        country: "India",
        screen_name: screenName,
        env: "prod",
        phone_number: isLoggedIn ? (getMobileNoFromLS() || "none") : "none",
        source: "web",
    }), [isLoggedIn, isSubscribed, screenName]);

    return baseParams;
};


export default useGA4BaseParams;