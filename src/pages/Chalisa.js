import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";

export default function Chalisa() {
  const [chalisa, setChalisa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChalisa() {
      try {
        const res = await fetch("https://api.bhaktibhav.app/frontend/all-Chalisas");
        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          setChalisa(json.data);
        } else {
          setChalisa([]);
          alert("No data found!");
        }
      } catch (error) {
        console.error("API Error:", error);
        setChalisa([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChalisa();
  }, []);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!chalisa.length) return <p className="text-center py-10">❌ No chalisa found</p>;

  const handleNavigate = (id, accessType) => {
    if(getSubscriptionStatusFromLS()) {
        return `/chalisa/${id}`;
    }
    else {
      if(accessType === "free") {
        return `/chalisa/${id}`;
      }
      else {
        if(getTokenFromLS()) {
          return "/payment";
        }
        else {
          return "/login";
        }
      }
    }
  }

  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} />

      <PageTitleCard
        titleHi={"चालीसा"}
        titleEn={"Chalisa"}
        customFontSize={"18px"}
        customEngFontSize={"13px"}
        
      /> 

      {/* Katha Grid */}
      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {chalisa.map((chalisa) => (
            <li key={chalisa._id}>
              <Link
                to={handleNavigate(chalisa._id, chalisa.accessType)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden"
              > 
                <div className="w-full h-40 flex items-center justify-center bg-gray-50">
                  <img
                    src={chalisa.imagethumb?.startsWith("http")
                      ? chalisa.imagethumb
                      : `https://api.bhaktibhav.app${chalisa.imagethumb}`
                    }
                    alt={chalisa.name?.hi || chalisa.name?.en}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${getSubscriptionStatusFromLS() ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}
                  />
                </div> 

                <div className="px-3 py-4">
                  {chalisa.name?.hi && (
                    <h2 className={`md:text-lg text-lg font-semibold truncate font-hindi pt-2 ${getSubscriptionStatusFromLS() ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}>
                      {chalisa.name.hi}
                    </h2>
                  )}
                  {chalisa.name?.en && (
                    <p className={`text-sm truncate font-eng ${getSubscriptionStatusFromLS() ? "" : chalisa.accessType === "paid" ? "blur-sm" : ""}`}>{chalisa.name.en}</p>
                  )} 
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      
    </>
  );
}
