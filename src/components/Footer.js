import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Facebook, Home, Instagram, Languages, Quote, SunMedium } from 'lucide-react';
import whatsapp_icon from "../assets/img/whatssapp_icon.png";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";

function Footer({ variant = "default", onSuvicharClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const baseParams = useGA4BaseParams("Home Screen");
    const { trackEvent } = useGA4Tracker(baseParams);
    const isHomeActive = location.pathname === "/" || location.pathname === "/home" || location.pathname === "/home-v1";

    const openLanguageModal = () => {
        window.dispatchEvent(new Event("bhakti-bhav:open-language-modal"));
    };

    const handleSuvicharClick = () => {
        if (onSuvicharClick) {
            onSuvicharClick();
            return;
        }
        navigate("/");
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };

    if (variant === "homeNav") {
        const navItems = [
            {
                key: "home",
                label: "Home",
                Icon: Home,
                active: isHomeActive,
                element: Link,
                to: "/"
            },
            {
                key: "language",
                label: "Language",
                Icon: Languages,
                active: false,
                onClick: openLanguageModal
            },
            {
                key: "rashifal",
                label: "Rashifal",
                Icon: SunMedium,
                active: location.pathname.toLowerCase() === "/rashifal",
                element: Link,
                to: "/rashifal"
            },
            {
                key: "suvichar",
                label: "Suvichar",
                Icon: Quote,
                active: false,
                onClick: handleSuvicharClick
            }
        ];

        return (
            <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEE7E2] bg-white/95 shadow-[0_-10px_28px_rgba(31,22,20,0.08)] backdrop-blur">
                <nav className="container mx-auto grid max-w-md grid-cols-4 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 md:max-w-5xl" aria-label="Home navigation">
                    {navItems.map(({ key, label, Icon, active, element: Element, to, onClick }) => {
                        const className = `font-eng flex min-w-0 flex-col items-center justify-center gap-1 text-xs leading-none transition ${active ? "text-[#9A283D]" : "text-[#9D9D9D]"}`;
                        const iconClassName = active ? "text-[#9A283D]" : "text-[#9D9D9D]";
                        const content = (
                            <>
                                <Icon size={28} strokeWidth={active ? 2.8 : 2.4} className={iconClassName} />
                                <span className={`${active ? "font-bold" : "font-medium"} truncate`}>{label}</span>
                            </>
                        );

                        if (Element) {
                            return (
                                <Element key={key} to={to} className={className}>
                                    {content}
                                </Element>
                            );
                        }

                        return (
                            <button key={key} type="button" onClick={onClick} className={className}>
                                {content}
                            </button>
                        );
                    })}
                </nav>
            </footer>
        );
    }

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
                    <a href="termsAndConditions" onClick = {() => {trackEvent(GA4Events.terms_and_condition_option_clicked, { event_label: "terms_and_conditions_clicked_on_footer" })}} className="theme-text hover:underline text-sm whitespace-nowrap">Terms & Conditions</a>
                    <a href="privacyPolicy" onClick = {() => {trackEvent(GA4Events.privacy_policy_clicked, { event_label: "privacy_policy_clicked_on_footer" })}} className="theme-text hover:underline text-sm whitespace-nowrap">Privacy Policy</a>
                    <a href="aboutUs" onClick = {() => {trackEvent(GA4Events.about_us_clicked, { event_label: "about_us_clicked_on_footer" })}} className="theme-text hover:underline text-sm whitespace-nowrap">About Us</a>
                    <a href="blogs" onClick = {() => {trackEvent(GA4Events.blogs_clicked, { event_label: "blogs_clicked_on_footer" })}} className="theme-text hover:underline text-sm whitespace-nowrap">Blogs</a>
                    <a href="contact-us" onClick = {() => {trackEvent(GA4Events.contact_us_clicked, { event_label: "contact_us_clicked_on_footer" })}} className="theme-text hover:underline text-sm whitespace-nowrap">Contact Us</a>
                </div>



            </div>
        </footer>
    );
}

export default Footer;
