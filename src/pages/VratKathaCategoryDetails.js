import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";

export default function VratKathaCategoryDetails() {
  const { selectedCategoryKathas, selectedCategoryName } = useKatha();
  const navigate = useNavigate();

  useEffect(() => {
    // If no data is available, redirect back to main katha page
    if (!selectedCategoryKathas.length) {
      navigate('/vrat-katha');
    }
  }, [selectedCategoryKathas, navigate]);

  if (!selectedCategoryKathas.length) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />

      <PageTitleCard
        titleHi={selectedCategoryName?.hi || "dFkk"}
        titleEn={selectedCategoryName?.en || "Katha"}
        customEngFontSize={"13px"}
        customFontSize={"19px"}
      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {selectedCategoryKathas.map((katha) => (
            <li key={katha._id}>
              <Link
                to={`/vrat-katha/${katha._id}`}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden"
              >
                <div className="w-full h-40 flex items-center justify-center overflow-hidden">
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
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* <Footer /> */}
    </>
  );
}
