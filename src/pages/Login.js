import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApis } from "../api";
import { setMobileNoInLS } from "../commonFunctions";

function Login() {
    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        const response = await loginApis.generateOtp(mobile);
        console.log("OTP Response:", response);
        setLoading(false);
        if(response.success) {
            setMobileNoInLS(mobile)
        }
        
        navigate("/verify-otp", { state: { mobile } });
    };
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
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) =>
                                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))  
                                    }
                                    placeholder="+91 Phone Number"
                                    className="w-full border border-red-300 rounded-lg px-4 md:text-lg text-3xl py-2 focus:outline-none focus:ring-2 focus:ring-red-400 theme_text"
                                />

                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#9A283D] text-white md:text-lg text-2xl py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                Send OTP
                            </button>
                        </form>


                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;
