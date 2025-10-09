import React, { useEffect, useState } from "react";
import { ChevronRight, Pencil } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { profileApis } from "../api";

const Profile = () => {
    const [profile, setProfile] = useState({
        name: "",
        mobileNumber: "",
        email: "",
        state: "",
        gender: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await profileApis.getProfile();
                console.log("Profile API Response:", res);
                
                if (res) {
                    console.log("Setting profile data:", res);
                    setProfile({
                        name: res.name || "",
                        mobileNumber: res.mobileNumber || "",
                        email: res.email || "",
                        state: res.state || "",
                        gender: res.gender || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfileData();
    }, []);

    return (
        <div className="min-h-screen font-eng">
            <Header 
                showProfileHeader={true}
                profileText="भक्ति भाव"
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-[#9A283D] text-lg">Loading profile...</div>
                </div>
            ) : (
                <>
                    <div className="mx-6 mt-6 bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] rounded-xl shadow-lg p-4 flex items-center justify-between cursor-pointer border border-[#F59E0B]">
                        <span className="text-[#7A1C2B] font-semibold text-base">
                            Your Premium plan is active
                        </span>
                        <ChevronRight className="text-[#7A1C2B] w-5 h-5" />
                    </div>

                    <div className="mx-6 mt-6 space-y-4">
                        <InfoCard label="Name" value={profile.name || "Not provided"} />
                        <InfoCard label="Mobile number" value={profile.mobileNumber || "Not provided"} />
                        <InfoCard label="Email" value={profile.email || "Not provided"} />
                        <InfoCard label="State" value={profile.state || "Not provided"} />
                        {/* {profile.gender && (
                            <InfoCard label="Gender" value={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} />
                        )} */}
                    </div>
                </>
            )}
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
