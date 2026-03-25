import { trackEvent } from "./analytics"

export const trackEventCommonFunction = (eventName, params, additionalParams = {}) => {
    console.log("Tracking event:", eventName, { ...params, ...additionalParams });
    trackEvent(eventName, { ...params, ...additionalParams }); 
}
