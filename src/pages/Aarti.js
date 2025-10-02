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
        customEngFontSize={"14px"}
        customFontSize={"23px"}
      />
      
      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                  className="relative block rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="overflow_bg">
                    <img
                      src={imgSrc}
                      alt={item.name?.en || item.name?.hi || "Aarti"}
                      className="w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover"
                    />
                    <div className="absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%]">
                      {item.name?.hi && (
                        <h2 className="text-xl font-bold font-hindi">
                          {item.name.hi}
                        </h2>
                      )}
                      {item.name?.en && (
                        <p className="text-sm font-eng">{item.name.en}</p>
                      )}
                    </div>
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
