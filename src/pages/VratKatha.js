import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";

export default function VratKatha() {
  const [kathas, setKathas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setCategoryData } = useKatha();

  useEffect(() => {
    async function fetchKathas() {
      try {
        /// all-kathas
        const res = await fetch("https://api.bhaktibhav.app/frontend/CategoryKatha");
        const json = await res.json();
        console.log("katha data", json)
        
        // if (json.status === "success" && Array.isArray(json.data)) {
          // Flatten all kathas from all categories
          // const allKathas = [];
          // json.forEach(category => {
          //   if (category.kathas && Array.isArray(category.kathas)) {
          //     allKathas.push(...category.kathas);
          //   }
          // });
          setKathas(json);
        // } else {
        //   setKathas([]);
        // }
      } catch (error) {
        console.error("API Error:", error);
        setKathas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchKathas();
  }, []);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!kathas.length) return <p className="text-center py-10">❌ No kathas found</p>;

  const handleNavigation = (id, index) => {
    if(kathas[index]?.kathas?.length > 0) {
        // Set the category data in context before navigation
        setCategoryData(kathas[index].kathas, kathas[index].name);
        navigate(`/vrat-katha/categoryDetails/${id}`);
    }
    else {
      navigate(`/vrat-katha/${id}`);
    }
  }
  return (
    <>
      <Header />

      <PageTitleCard
        titleHi={"dFkk"}
        titleEn={"Katha"}
        customEngFontSize={"14px"}
        customFontSize={"24px"}
        
      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {kathas.map((katha, index) => (
            <li key={katha._id}>
              <div
                onClick={() => handleNavigation(katha._id, index)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden cursor-pointer"
              >
                <div className="w-full h-40 flex items-center justify-center overflow-hidden  ">
                  <img
                    src={`${katha.imagethumb}`}
                    alt={katha.name?.hi || katha.name?.en}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                  />
                </div>
                <div className="p-2">
                  {katha.name?.hi && (
                    <h2 className="md:text-xl text-lg font-semibold truncate font-hindi pt-3">
                      {katha.name.hi}
                    </h2>
                  )}
                  {katha.name?.en && (
                    <p className="text-sm truncate font-eng">{katha.name.en}</p>
                  )}

                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      
    </>
  );
}
