import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Mantra() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/all-mantras");
        const json = await res.json();
        setItems(json.data || []);  
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) return <p className="text-center py-10 theme_text">⏳ Loading...</p>;
  if (!items.length) return <p className="text-center py-10 theme_text font-eng">❌ No mantras found</p>;

  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-hindi text-white">
      <Header />

      <div className="flex justify-center items-center mb-3">
        <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
          मंत्र संग्रह
          <span className="font-eng text-sm ml-2">(Mantra Collection)</span>
        </p>
      </div>

      <main className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/mantra/${item._id}`} // dynamic detail link
                className="theme_bg bg-white rounded-xl shadow p-4 text-center hover:bg-yellow-50 transition flex flex-col"
              >
                <div className="w-full h-36 flex items-center justify-center">
                  <img
                    src={item.imagethumb || "/img/default-mantra.png"}  
                    alt={item.title}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                  />
                </div>
                <div className="p-2">
                  <h2 className="md:text-3xl text-lg font-normal">{item.title}</h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
