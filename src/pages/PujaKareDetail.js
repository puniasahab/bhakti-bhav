import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function PujaKare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/all-data");
        const json = await res.json();
        if (json?.status === "success" && Array.isArray(json.data)) {
          setItems(json.data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("API Error:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!items.length)
    return <p className="text-center py-10 text-white">❌ No items found</p>;

  return (
    <>
      <Header pageName={{ hi: "iwtk djs", en: "Puja kare" }} />

      <PageTitleCard
        titleHi={items.title.hi}
        titleEn={items.title.en}
        textSize="text-lg"
      />

      <div className="flex justify-center items-center mb-3">
        <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md">
          पूजा करे
          <span className="font-eng text-sm ml-2">(Pooja Kare)</span>
        </p>
      </div>

      <div className="mt-4 container mx-auto px-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          {items.map((item) => (
            <li key={item._id || item.id}>
              <Link
                to={`/puja-kare/${item.id}`}
                className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
              >
                <div className="w-full h-36 flex items-center justify-center">
                  <img
                    src={
                      item.image
                        ? `https://api.bhaktibhav.app${item.image}`
                        : "/img/default.png"
                    }
                    alt={item.title || "Puja"}
                    className="h-full w-auto object-contain rounded-md"
                  />
                </div>
                <div className="p-2">
                  <h2 className="md:text-2xl text-lg font-medium">
                    {item.title || "Untitled"}
                  </h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-4 gap-6 p-3 mt-10">
          {[
            "/img/deep.png",
            "/img/mandala.png",
            "/img/sank.png",
            "/img/calendar.png",
          ].map((icon, idx) => (
            <a
              href="#"
              key={idx}
              className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full 
                bg-gradient-to-b from-yellow-200 to-orange-300 shadow-md hover:shadow-lg 
                hover:scale-105 transition-all duration-300 ease-in-out mx-auto"
            >
              <img src={icon} alt="icon" className="w-10 h-10 md:w-12 md:h-12" />
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
