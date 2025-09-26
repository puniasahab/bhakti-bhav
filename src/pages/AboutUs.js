import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutUs() {
    return (
        <>
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800 font-eng">
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-2">Hindu Devotionals</h2>
                    <p className="mb-2">
                        Discover the ultimate devotional companion with the <strong className="theme_text">Bhakti Bhav</strong> app. Immerse yourself in a rich collection of prayers, bhajans, and spiritual content tailored for devotees of Hinduism.
                    </p>
                    <p>
                        Stay connected with your faith, access daily prayers, and find peace and tranquility with our user-friendly mobile app.
                    </p>
                </div>

            </div>  

            <Footer />
        </>
    );
}
