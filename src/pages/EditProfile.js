import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Camera } from "lucide-react";
import kundaliBanner from "../assets/img/kundali_banner.png";

function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    state: "",
    dob: "",
    birthPlace: "",
    birthTime: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile number must be 10 digits";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.birthPlace) newErrors.birthPlace = "Birth place is required";
    if (!formData.birthTime) newErrors.birthTime = "Time of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", formData);
      alert("Profile saved successfully!");
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 mt-4 text-center font-eng"> 
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border flex items-center justify-center text-[#9A283D] font-bold text-lg bg-white">
              भक्ति भाव
            </div>
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">  
              <Camera className="theme_text"/>
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
          <input
            type="text"
            name="mobile"
            placeholder="Mobile number*"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email*"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State*"
            value={formData.state}
            onChange={handleChange}
            className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#9A283D] text-white py-3 rounded-full shadow-md"
          >
            Confirm
          </button>
        </form>
 
        <div className="my-6 text-center py-2">
          <img
              src={kundaliBanner}
              alt={"kundali banner"}
              className="max-w-md w-full rounded-lg"
            />
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-4 theme_text">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="Date of birth"
              className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
            />
            <input
              type="text"
              name="birthPlace"
              placeholder="Birth place"
              value={formData.birthPlace}
              onChange={handleChange}
              className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
            />
            <input
              type="time"
              name="birthTime"
              value={formData.birthTime}
              onChange={handleChange}
              placeholder="Time of birth"
              className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-[#9A283D] rounded-lg px-4 py-3 bg-[#FFFAF8] focus:outline-none"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full border-2 border-[#9A283D] text-[#9A283D] py-3 rounded-full font-bold shadow-md bg-white"
          >
            Yes, I'm in
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default EditProfile;
