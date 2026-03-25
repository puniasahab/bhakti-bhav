import React from "react";
import { Facebook, Instagram } from 'lucide-react';
import whatsapp_icon from "../assets/img/whatssapp_icon.png";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
    
function Footer() {
    const baseParams = useGA4BaseParams("Home Screen");
    const { trackEvent } = useGA4Tracker(baseParams);

    return (
        <footer className="mt-6 py-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
                <div className="flex space-x-3">
                    <a href="https://www.facebook.com/people/Bhakti-Bhav/61577028644683/"
                        onClick = {() => trackEvent(GA4Events.facebook_icon_clicked, { platform: "facebook", event_label: "facebook_icon_clicked_on_home_screen"})}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Facebook color="white" size={20} />
                    </a>
                    <a href="https://www.instagram.com/bhaktibhavapp/"
                        onClick = {() => trackEvent(GA4Events.instagram_icon_clicked, { platform: "instagram", event_label: "instagram_icon_clicked_on_home_screen" })}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <Instagram color="white" size={20} />
                    </a>
                    <a href="https://wa.me/917042515876"
                        onClick = {() => trackEvent(GA4Events.whatsapp_icon_clicked, { platform: "whatsapp", event_label: "whatsapp_icon_clicked_on_home_screen"})}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
                        <img src={whatsapp_icon} alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
                    </a>
                </div>

                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 theme_text text-center font-eng my-4">
                    <a href="termsAndConditions" className="theme-text hover:underline text-sm whitespace-nowrap">Terms & Conditions</a>
                    <a href="privacyPolicy" className="theme-text hover:underline text-sm whitespace-nowrap">Privacy Policy</a>
                    <a href="aboutUs" className="theme-text hover:underline text-sm whitespace-nowrap">About Us</a>
                    <a href="blogs" className="theme-text hover:underline text-sm whitespace-nowrap">Blogs</a>
                    <a href="contact-us" className="theme-text hover:underline text-sm whitespace-nowrap">Contact Us</a>
                </div>



            </div>
        </footer>
    );
}

export default Footer;
