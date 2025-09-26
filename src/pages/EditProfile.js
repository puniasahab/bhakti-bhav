import React, { useState } from "react";

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
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <button className="bg-yellow-200 px-4 py-2 rounded mb-4">← Edit Profile</button>

      <h1 className="text-center text-2xl font-bold mb-4">भक्ति भाव</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Mobile */}
        <div>
          <input
            type="text"
            name="mobile"
            placeholder="Mobile number"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* State */}
        <div>
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded font-semibold"
        >
          Confirm
        </button>
      </form>

      <div className="my-6 p-4 bg-yellow-100 rounded text-center font-semibold">
        Free Kundli
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DOB */}
        <div>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>

        {/* Birth Place */}
        <div>
          <input
            type="text"
            name="birthPlace"
            placeholder="Birth place"
            value={formData.birthPlace}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.birthPlace && (
            <p className="text-red-500 text-sm">{errors.birthPlace}</p>
          )}
        </div>

        {/* Time of Birth */}
        <div>
          <input
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.birthTime && (
            <p className="text-red-500 text-sm">{errors.birthTime}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded font-semibold"
        >
          Yes, I’m in
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
