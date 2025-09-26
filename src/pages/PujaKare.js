import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

export default function PujaKare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/puja-kare");
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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!items.length) return <p className="text-center py-10 text-white">❌ No items found</p>;

  return (
    <>
      <Header />
      <div className="flex justify-center items-center mb-3">
        <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
          पूजा करे
          <span className="font-eng text-sm ml-2">(Pooja Kare)</span>
        </p>
      </div>

      <div className="mt-4 container mx-auto px-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/puja-kare/${item.id}`}  
                className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
              >
                <div className="w-full h-36 flex items-center justify-center">
                  <img
                    src={item.image || "/img/default.png"}
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
      </div>

      <Footer />
    </>
  );
}
