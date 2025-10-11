import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { pujaKareApis } from "../api";
import { usePujaKare } from "../contexts/PujaKareContext";

export default function PujaKare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updatePujaKareItems } = usePujaKare();

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await pujaKareApis.getPujaKareItems();
        console.log("Puja Kare API Response:", res.data);
        const itemsData = res.data || [];
        setItems(itemsData);
        // Update context with the fetched data
        updatePujaKareItems(itemsData);
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
       <Header pageName={{ hi: "iwtk djs", en: "Puja kare" }} />
       
      <PageTitleCard
        titleHi={"iwtk djs"}
        titleEn={"Puja kare"}
      />

      <div className="mt-4 container mx-auto px-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          {items.map((item) => (
            <li key={item._id}>
              <Link
                to={`/puja-kare/${item._id}`}
                className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex flex-col"
              >
                <div className="w-full h-36 flex items-center justify-center">
                  <img
                    src={item.randomWallpaper.imagethumb || "/img/default.png"}
                    alt={item.title}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                  />
                </div>
                <div className="p-2">
                  <h2 className="md:text-lg text-lg font-semibold truncate font-hindi pt-2">{item.name?.hi}</h2>
                  <p className="md:text-lg text-md truncate font-eng">({item.name?.en})</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      
    </>
  );
}
