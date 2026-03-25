import { useCallback } from "react";
import  {trackGA4Event}  from "../utils/analytics";

const useGA4Tracker  = (baseParams) => {
    // stable function reference won't cause re-renders
    const trackEvent = useCallback((eventName, additionalParams = {}) => {
        console.log("Tracking event:", eventName, { ...baseParams, ...additionalParams });
        trackGA4Event(eventName, { 
            ...baseParams, // common params auto included in every event
            ...additionalParams  // event specific params 
        }); 
    }, [baseParams]);

    return {trackEvent};
}

export default useGA4Tracker;