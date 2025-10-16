import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMobileNoFromLS, setTokenInLS } from "../commonFunctions";
import { loginApis } from "../api";


function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const phone = location.state?.phone || "";

    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(false);


    const generateOtp = async () => {
        try {
            const mobile = getMobileNoFromLS();
            const response = await loginApis.generateOtp(mobile);
            console.log("OTP Response:", response);
        }
        catch (error) {
            console.error("Error generating OTP:", error);
        }
    }

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        let newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`).focus(); // move forward
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus(); // move back
        }
    };

    // ✅ NEW: handle copy–paste OTP (fills all inputs at once)
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasteData) return;

        let newOtp = [...otp];
        pasteData.split("").forEach((char, idx) => {
            if (idx < otp.length) {
                newOtp[idx] = char;
            }
        });

        setOtp(newOtp);

        const lastIndex = Math.min(pasteData.length - 1, otp.length - 1);
        document.getElementById(`otp-${lastIndex}`).focus();
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            alert("Please enter a valid 4-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("https://api.bhaktibhav.app/frontend/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile: getMobileNoFromLS(), otp: otpCode }),
            });

            const data = await res.json();
            console.log("data", data)
            if (data && data?.token?.length > 0) {
                setTokenInLS(data.token);
                navigate("/"); // redirect to home/dashboard
            }
        } catch (error) {
            console.error("Verify API Error:", error);
            // alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex items-center justify-center h-screen relative">
            <div className="absolute inset-0 top-0 md:w-[15%] md:left-[35%]">
                <div className="w-[90%] h-[45%] md:w-[100%] md:h-[30%] bg-[url('./img/bell-img.png')] bg-contain bg-no-repeat" />
            </div>

            <div className="flex flex-col items-center text-center z-10 w-full">
                <img
                    src="./img/logo_splash.png"
                    alt="Logo"
                    className="w-[192px] h-[184px] mb-4 mt-[100px]"
                />

                <div className="flex justify-center items-center theme_text mt-[50px] font-eng w-full px-4">
                    <div className="w-full bg-[rgba(255,250,244,0.6)] rounded-xl shadow-md p-6 border-[#9A283D] border-[0.2px]">
                        <h2 className="md:text-xl text-3xl font-semibold mb-4 theme_text font-eng">Verify OTP</h2>
                        <p className="text-gray-700 mt-2 text-xl">
                            We've sent a code to <span className="font-semibold">{phone}</span>
                        </p>

                        <div className="flex justify-between mt-6 mb-4 gap-2" onPaste={handlePaste}>
                            {otp.map((val, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    maxLength="1"
                                    value={val}
                                    onChange={(e) => handleChange(e, idx)}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    className="w-10 h-12 text-center text-lg border-b-2 border-[#800000] focus:outline-none focus:border-red-600"
                                />
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <button
                                disabled={timeLeft > 0}
                                onClick={() => { setTimeLeft(30); generateOtp(); }}
                                className={`${timeLeft > 0 ? "text-gray-400" : "text-[#800000] underline"
                                    }`}
                            >
                                Resend OTP
                            </button>
                            <span>{timeLeft > 0 ? `${timeLeft}s` : "0s"}</span>
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className="w-full bg-[#800000] text-white py-2 rounded-lg hover:bg-[#a00000] transition disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>


                    </div>

                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;
