import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function Aarti() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/all-artis");
        const json = await res.json();
        if (json?.status === "success") {
          setItems(json.data || []);
          console.log(json.data);
        } else {
          setItems([]);
          alert("No data found!");
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
    return <p className="text-center py-10 theme_text">❌ No items found</p>;

  return (
    <>

      <Header pageName={{ hi: "vkjrh", en: "Aarti" }} />

      <PageTitleCard
        titleHi={"vkjrh"}
        titleEn={"Aarti"}  
      />
      
      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const imgSrc = item.imagethumb
              ? item.imagethumb.startsWith("http")
                ? item.imagethumb
                : `https://api.bhaktibhav.app${item.imagethumb}`
              : "/img/default-aarti.png";

            return (
              <li key={item._id || idx}>
                <Link
                  to={`/aarti/${item._id || idx}`}
                  className="theme_bg bg-white rounded-xl shadow p-4 text-center hover:bg-yellow-50 transition flex flex-col"
                >
                  <div className="w-full h-36 flex items-center justify-center">
                    <img
                      src={imgSrc}
                      alt={item.name?.en || item.name?.hi || "Aarti"}
                      className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                    />
                  </div>
                  <div className="p-2">
                    <h2 className="md:text-2xl text-lg font-normal theme_text">
                      {item.name?.hi}
                    </h2>
                    <p className="font-eng text-sm text-gray-600">{item.name?.en}</p>
                  </div>
                </Link>
              </li>
            );
          })}

        </ul>
      </div>

      
    </>
  );
}
