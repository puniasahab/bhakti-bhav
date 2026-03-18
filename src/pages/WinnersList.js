import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import prasadImg from "../assets/img/prasad.png";

const winners = [
  { name: "Ishaan Malhotra", state: "Sikkim" },
  { name: "Ananya Iyer", state: "Rajasthan" },
  { name: "Rohan Deshmukh", state: "Kerala" },
  { name: "Arjun Reddy", state: "Himachal Pradesh" },
  { name: "Kavya Nair", state: "Rajasthan" },
  { name: "Devansh Joshi", state: "Kerala" },
  { name: "Kabir Gill", state: "Puducherry" },
  { name: "Sia Bharadwaj", state: "Uttar Pradesh" },
  { name: "Zoya Khan", state: "Ladakh" },
];

export default function WinnersList() {
  return (
    <>
      <Header />

      <div className="container mx-auto px-4 pb-10">

        {/* Banner Image */}
        <div className="rounded-2xl overflow-hidden shadow-md mb-5 mt-5">
          <img
            src={prasadImg}
            alt="Vaishno Devi Temple"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Section Title */}
        <h2 className="font-hindi theme_text text-2xl font-bold text-center mb-5">
          माता की भेंट पाने वाले भक्त
        </h2>

        {/* Winners List */}
        <div className="space-y-3">
          {winners.map((winner, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-5 py-4 rounded-2xl shadow-sm"
              style={{ backgroundColor: "#faeeb1ff" }}
            >
              <span className="font-eng font-bold text-[#3B1A08] text-lg">
                {index + 1}. {winner.name}
              </span>
              <span className="font-eng text-[#3B1A08] text-base text-xs">
                {winner.state}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* <Footer /> */}
    </>
  );
}
