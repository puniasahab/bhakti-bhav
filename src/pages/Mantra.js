import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";

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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!items.length) return <p className="text-center py-10 theme_text font-eng">❌ No mantras found</p>;
  const handleNavigation = (id, accessType) => {

    if (getSubscriptionStatusFromLS()) {
      return `/mantra/${id}`;
    }
    else {
      if (accessType === "free") {
        return `/mantra/${id}`;
      } else {
        if (getTokenFromLS()) {
          return "/payment";
        }
        else {
          return "/login";
        }
      }
    };

  }
  return (
    <div className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-hindi text-white">
      <Header />

      <PageTitleCard
        titleHi={"ea="}
        titleEn={"Mantra"}
        customEngFontSize={"13px"}
        customFontSize={"23px"}

      />

      <div className="container mx-auto px-4 mt-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li key={item._id}>
              <Link

                to={handleNavigation(item._id, item.accessType)}
                className="theme_bg bg-white rounded-xl shadow p-4 text-center hover:bg-yellow-50 transition flex flex-col"
              >
                <div className={`w-full h-36 flex items-center justify-center ${getSubscriptionStatusFromLS() ? "" : item.accessType === "paid" ? "blur" : ""}`}>
                  <img

                    src={item.imagethumb || "/img/default-mantra.png"}
                    alt={item.title}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                  />
                </div>
                <div className="p-2">
                  <h2 className={`md:text-lg text-lg font-semibold truncate font-hindi mt-1 ${getSubscriptionStatusFromLS() ? "" : item.accessType === "paid" ? "blur" : ""}`}>{item.name.hi}</h2>
                  <h2 className={`md:text-lg text-sm font-semibold truncate font-eng ${getSubscriptionStatusFromLS() ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>({item.name.en})</h2>

                </div>
              </Link>
            </li>
          ))}
        </ul>

      </div>


    </div>
  );
}
