import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Camera } from "lucide-react";
import { profileApis } from "../api";
import { getTokenFromLS } from "../commonFunctions";
import kundaliBanner from "../assets/img/kundali_banner.png";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    state: "",
    dateOfBirth: "",
    birthPlace: "",
    timeOfBirth: "",
    gender: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

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
            imageUrl: response.imageUrl || "",
          });
          
          // Set image preview if imageUrl exists
          if (response.imageUrl) {
            const imageUrl = response.imageUrl.startsWith("http") 
              ? response.imageUrl 
              : `https://api.bhaktibhav.app${response.imageUrl}`;
            setImagePreview(imageUrl);
          }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        // Create FormData to handle both text fields and image file
        const submitFormData = new FormData();
        
        // Append all text fields
        submitFormData.append('name', formData.name);
        submitFormData.append('mobileNumber', formData.mobileNumber);
        submitFormData.append('email', formData.email);
        submitFormData.append('state', formData.state || '');
        submitFormData.append('dateOfBirth', formData.dateOfBirth || '');
        submitFormData.append('birthPlace', formData.birthPlace || '');
        submitFormData.append('timeOfBirth', formData.timeOfBirth || '');
        submitFormData.append('gender', formData.gender || '');
        
        // Append image file if selected
        if (imageFile) {
          console.log("Adding new image file:", imageFile.name, imageFile.type, imageFile.size);
          submitFormData.append('imageUrl', imageFile, imageFile.name);
        }
        
        console.log("FormData contents:");
        for (let [key, value] of submitFormData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size,
              lastModified: value.lastModified
            });
          } else {
            console.log(`${key}:`, value);
          }
        }
        
        console.log("Sending FormData to API...");
        const response = await profileApis.updateProfile(submitFormData);
        console.log("Profile updated successfully:", response);
        
        alert("Profile saved successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error updating profile:", error);
        console.error("Error details:", error.response?.data || error.message);
        alert("Error saving profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Header 
        showProfileHeader={true}
        profileText="Edit Profile"
        hideEditIcon={true}
        showEnglishText={true}
        showVerticalLogout={true}
      />
      <div className="container mx-auto px-4 mt-4 text-center font-eng">
        {initialLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#9A283D] text-lg">Loading profile data...</div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-[#9A283D] flex items-center justify-center text-[#9A283D] font-bold text-lg bg-white shadow-lg overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FFFAF8] to-[#FCD34D] flex items-center justify-center">
                      <span className="text-[#9A283D] font-eng text-sm">Profile Picture</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-[#9A283D] hover:bg-[#FFFAF8] transition-colors cursor-pointer"
                >
                  <Camera size={18} className="text-[#9A283D]" />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 theme_text max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name*"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1 text-left">{errors.name}</p>}
                </div>
                
                <div>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Mobile number*"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-sm mt-1 text-left">{errors.mobileNumber}</p>}
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email*"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>}
                </div>
                
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                >
                  <option value="">Select State</option>
                  {/* <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option> */}
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  {/* <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option> */}
                  <option value="Delhi">Delhi</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  {/* <option value="Ladakh">Ladakh</option> */}
                  {/* <option value="Lakshadweep">Lakshadweep</option> */}
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  {/* <option value="Puducherry">Puducherry</option> */}
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>

                {/* <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                />

                <input
                  type="text"
                  name="birthPlace"
                  placeholder="Birth Place"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                />

                <input
                  type="time"
                  name="timeOfBirth"
                  placeholder="Time of Birth"
                  value={formData.timeOfBirth}
                  onChange={handleChange}
                  className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border-2 border-[#9A283D] rounded-xl px-4 py-3 bg-[#FFFAF8] focus:outline-none focus:border-[#7A1C2B] transition-colors"
                >
                  <option value="">Select Gender (Optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select> */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9A283D] text-white py-3 rounded-xl shadow-lg font-medium text-lg disabled:opacity-50 hover:bg-[#7A1C2B] transition-colors mt-6"
                style={{marginTop: '40px', width: '80%'}}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>

            </form>

            <img onClick = {()=>{navigate('/kundli')}} style={{width: '90%', height: 'auto', margin: '32px auto'}} src={kundaliBanner} alt="Kundali Banner" className="w-full h-40 object-cover" />

        </>
        )}
      </div>
    </>
  );
}

export default EditProfile;