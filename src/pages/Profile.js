import React, { useEffect, useState } from "react";
import { ChevronRight, Pencil } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Profile = () => {
    const [profile, setProfile] = useState({
        name: "Vinay Kumar",
        mobile: "9999999999",
        email: "LoremIpsum@gmail.com",
        state: "Delhi",
    });

    useEffect(() => {
        // ✅ Fetch Profile API here if needed
    }, []);

    return (
        <div className="min-h-screen font-eng">
            <Header />

            <div className="flex justify-center mb-6 mt-4">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full border flex items-center justify-center text-[#9A283D] font-bold text-lg bg-white">
                        भक्ति भाव
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                        <Pencil size={18} className="text-[#7A1C2B]" />
                    </div>
                </div>
            </div>


            <div className="mx-6 mt-6 bg-[#FCD34D] rounded-xl shadow p-3 flex items-center justify-between cursor-pointer">
                <span className="text-[#7A1C2B] font-medium">
                    Your Premium plan is active
                </span>
                <ChevronRight className="text-[#7A1C2B]" />
            </div>

            <div className="mx-6 mt-6 space-y-4">
                <InfoCard label="Name" value={profile.name} />
                <InfoCard label="Mobile number" value={profile.mobile} />
                <InfoCard label="Email" value={profile.email} />
                <InfoCard label="State" value={profile.state} />
            </div>
            <Footer />
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="bg-[#FCD34D] rounded-xl p-3">
        <p className="text-[#7A1C2B] text-sm mb-1">{label}</p>
        <p className="text-black font-medium">{value}</p>
    </div>
);

export default Profile;
