import React from "react";
import  {Facebook, Instagram}  from 'lucide-react';

function Footer() {
    return (
        <footer className="mt-6 py-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">

                <div
                    className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
                    <a href="terms-policy" className="theme-text text-lg hover:underline">Terms & Conditions</a>
                    <a href="#" className="theme-text text-lg hover:underline">Privacy Policy</a>
                    <a href="#" className="theme-text text-lg hover:underline">About us</a>
                </div>

                <div className="flex space-x-3">
                    <a href="#"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Facebook color="white" size={20} />
                    </a>
                    <a href="#"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Instagram color="white" size={20} />
                    </a>
                    <a href="#"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <img src="./img/whatssapp_icon.png" alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
                    </a>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
