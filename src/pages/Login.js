import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginApis } from "../api";
import { setMobileNoInLS } from "../commonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";

function Login() {
    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loginSource = sessionStorage.getItem("loginSource") || "home"; // "home-v1" or "home"

    const baseParams = useGA4BaseParams("Login Screen");
    const { trackEvent } = useGA4Tracker(baseParams);


    const hasTracked = useRef(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mobile || mobile.length !== 10) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);

        // try {
        //     const res = await fetch("https://api.bhaktibhav.app/frontend/generate-otp", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ mobile }),
        //     });

        //     const data = await res.json();

        //     if (data.success) {
        //         navigate("/verify-otp", { state: { mobile } });
        //     } else {
        //         alert(data.message || "Failed to send OTP");
        //     }
        // } catch (error) {
        //     console.error("Login API Error:", error);
        //     alert("Something went wrong!");
        // } finally {
        //     setLoading(false);
        // }
        const mobileNumber = mobile;

        // Generate or get deviceId
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            // Generate a unique device ID if it doesn't exist
            // crypto.randomUUID() is only available in secure contexts (HTTPS)
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                deviceId = crypto.randomUUID();
            } else {
                // Fallback for non-secure contexts (HTTP / older browsers)
                deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            }
            localStorage.setItem('deviceId', deviceId);
        }

        trackEvent(GA4Events.login_otp_requested, { event_label: "send_otp_button_clicked_on_login_screen" });

        const response = await loginApis.generateOtp(mobileNumber, deviceId);
        console.log("OTP Response:", response);
        setLoading(false);
        if (response.success) {
            setMobileNoInLS(mobile)
        }

        navigate("/verify-otp", { state: { mobile, loginSource } });
    };

    useEffect(() => {
        if (hasTracked.current) return;
        hasTracked.current = true;

        trackEvent(GA4Events.login_screen_opened, {
            event_label: "login_screen_visited",
        });
        // trackEvent(GA4Events.login_screen_opened, {event_label: "login_screen_visited"});
    }, []);
    return (

        <div className="flex items-center justify-center h-screen relative">
            <div className="absolute inset-0 top-0 md:w-[15%] md:left-[35%]">
                <div className="w-[90%] h-[45%] md:w-[100%] md:h-[30%] bg-[url('./img/bell-img.png')] bg-contain bg-no-repeat" />
            </div>

            <div className="flex flex-col items-center text-center z-10">
                <img
                    src="./img/logo_splash.png"
                    alt="Logo"
                    className="w-[192px] h-[184px] mb-4 mt-[100px]"
                />

                <div className="flex justify-center items-center theme_text mt-[50px] font-eng w-full px-4">
                    <div className="w-full bg-[rgba(255,250,244,0.6)] rounded-xl shadow-md p-6 border-[#9A283D] border-[0.2px]">

                        <form onSubmit={handleSubmit}>
                            <p className="md:text-xl text-3xl font-semibold mb-4 theme_text font-eng">Sign In</p>
                            <div className="mb-4">
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-gray-700 font-semibold md:text-lg text-2xl pointer-events-none z-10">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) =>
                                            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                                        }
                                        placeholder="Phone Number"
                                        className="w-full border border-red-300 rounded-lg pl-16 pr-4 md:text-lg text-2xl py-3 focus:outline-none focus:ring-2 focus:ring-red-400 theme_text flex items-center placeholder:text-lg placeholder:md:text-base"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#9A283D] text-white md:text-lg text-2xl py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                Send OTP
                            </button>

                            {/* Skip button — only shown when coming from /home-v1 */}
                            {loginSource === "home-v1" && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="w-full mt-3 text-[#9A283D] md:text-base text-xl py-2 rounded-lg border border-[#9A283D] hover:bg-[#9A283D]/5 transition font-eng"
                                >
                                    Skip
                                </button>
                            )}
                        </form>


                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;
