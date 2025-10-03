import React from "react";
import { Facebook, Instagram } from 'lucide-react';
import  whatsapp_icon  from "../assets/img/whatssapp_icon.png";

function Footer() {
    return (
        <footer className="mt-6 py-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
                <div className="flex space-x-3">
                    <a href="https://www.facebook.com/people/Bhakti-Bhav/61577028644683/"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Facebook color="white" size={20} />
                    </a>
                    <a href="https://www.instagram.com/bhaktibhavapp/"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Instagram color="white" size={20} />
                    </a>
                    <a href="#"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <img src={whatsapp_icon} alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
                    </a>
                </div>

                <div
                    className="flex flex-row space-x-6 theme_text text-center font-eng my-6">
                    <a href="termsAndConditions" className="theme-text hover:underline text-sm">Terms & Conditions</a>
                    <a href="privacyPolicy" className="theme-text hover:underline text-sm">Privacy Policy</a>
                    <a href="aboutUs" className="theme-text hover:underline text-sm">About us</a>
                </div>



            </div>
        </footer>
    );
}

export default Footer;
