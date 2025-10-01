import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Camera } from "lucide-react";
import { profileApis } from "../api";
import kundaliBanner from "../assets/img/kundali_banner.png";

function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    state: "",
    dateOfBirth: "",
    birthPlace: "",
    timeOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await profileApis.getProfile();
        console.log("Fetched profile data:", response);
        
        if (response) {
          setFormData({
            name: response.name || "",
            mobileNumber: response.mobileNumber || "",
            email: response.email || "",
            state: response.state || "",
            dateOfBirth: response.dateOfBirth || "",
            birthPlace: response.birthPlace || "",
            timeOfBirth: response.timeOfBirth || "",
            gender: response.gender || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    // Note: Other fields are optional as per requirement

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await profileApis.updateProfile(formData);
        console.log("Profile updated successfully:", response);
        alert("Profile saved successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error saving profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 mt-4 text-center font-eng">
        {initialLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#9A283D] text-lg">Loading profile data...</div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border flex items-center justify-center text-[#9A283D] font-bold text-lg bg-white">
                  भक्ति भाव
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                  <Camera className="theme_text" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 theme_text">
          <input
            type="text"
            name="name"
            placeholder="Name*"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          
          <input
            type="text"
            name="mobileNumber"
            placeholder="Mobile number*"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />
          {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
          
          <input
            type="email"
            name="email"
            placeholder="Email*"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />

          <input
            type="date"
            name="dateOfBirth"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />

          <input
            type="text"
            name="birthPlace"
            placeholder="Birth Place"
            value={formData.birthPlace}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />

          <input
            type="time"
            name="timeOfBirth"
            placeholder="Time of Birth"
            value={formData.timeOfBirth}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          >
            <option value="">Select Gender (Optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9A283D] text-white py-3 rounded-full shadow-md disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </>
        )}
      </div>
    </>
  );
}

export default EditProfile;