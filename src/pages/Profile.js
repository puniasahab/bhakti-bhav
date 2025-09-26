// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

const Profile = () => {
    const [profile, setProfile] = useState({
        name: "",
        mobile: "",
        email: "",
        state: "",
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("https://api.bhaktibhav.app/user/profile");
                const data = await res.json();
                setProfile(data);  
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleSave = async () => {
        if (!profile.name || !profile.mobile || !profile.email || !profile.state) {
            alert("All fields are required!");
            return;
        }
        if (!/^\d{10}$/.test(profile.mobile)) {
            alert("Mobile number must be 10 digits!");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(profile.email)) {
            alert("Invalid email format!");
            return;
        }

        try {
            const res = await fetch("https://api.example.com/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            alert("Profile updated successfully!");
            setEditMode(false);
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong!");
        }
    };

    if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

    return (
        <>
            <Header />
            <div className="min-h-screen flex flex-col items-center p-4 font-eng">
                <div className="w-full max-w-md rounded-xl p-6">
 
                    <div className="flex flex-col items-center mb-6">
                        <div className="border border-orange-200 rounded-full w-24 h-24 flex items-center justify-center text-orange-400 font-bold text-lg">
                            भक्ति भाव
                        </div>
                    </div>
 
                    <div className="bg-orange-200 text-orange-800 text-center py-2 rounded-lg mb-6 cursor-pointer">
                        Your Premium plan is active
                    </div>
 
                    <div className="space-y-4">
                        <InputField label="Name" name="name" value={profile.name} onChange={handleChange} editMode={editMode} />
                        <InputField label="Mobile number" name="mobile" value={profile.mobile} onChange={handleChange} editMode={editMode} />
                        <InputField label="Email" name="email" value={profile.email} onChange={handleChange} editMode={editMode} />
                        <InputField label="State" name="state" value={profile.state} onChange={handleChange} editMode={editMode} />
                    </div>
 
                    <div className="mt-6 flex justify-center gap-4">
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="bg-orange-400 text-white px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="bg-orange-400 text-white px-4 py-2 rounded-lg"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

// ✅ Reusable Input Component
const InputField = ({ label, name, value, onChange, editMode }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            disabled={!editMode}
            className={`w-full p-2 rounded-lg border ${editMode ? "border-orange-400" : "border-gray-200"
                } bg-yellow-100`}
        />
    </div>
);

export default Profile;
