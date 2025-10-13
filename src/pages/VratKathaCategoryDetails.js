import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";

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


  const handleNavigation = (id, accessType) => {
    if (getSubscriptionStatusFromLS()) {
      return `/vrat-katha/${id}`;
    }
    else {
      if (accessType === "free") {
        return `/vrat-katha/${id}`;
      }
      else {
        if (getTokenFromLS()) {
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
      <Header hideEditIcon={true} showProfileHeader={true} profileText="भक्ति भाव" />

      <PageTitleCard
        titleHi={selectedCategoryName?.hi || "dFkk"}
        titleEn={selectedCategoryName?.en || "Katha"}
        customEngFontSize={"13px"}
        customFontSize={"19px"}
      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {selectedCategoryKathas.sort((a, b) => {
            if (a.accessType === "free" && b.accessType === "paid") return -1;
            if (a.accessType === "paid" && b.accessType === "free") return 1;
            return 0;
          }).map((katha) => (
            <li key={katha._id}>
              <Link
                to={handleNavigation(katha._id, katha.accessType)}
                className="relative block rounded-xl overflow-hidden shadow-lg"
              >
                <div className="overflow_bg">
                  <img
                    src={katha.imagethumb || katha.imageUrl}
                    alt={katha.name?.hi || katha.name?.en}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%] ${getSubscriptionStatusFromLS() ? "" : katha.accessType === "paid" ? "blur-sm" : ""}`}>
                    {katha.name?.hi && (
                      <h2 className="text-xl font-bold font-hindi">
                        {katha.name.hi}
                      </h2>
                    )}
                    {katha.name?.en && (
                      <p className="text-sm font-eng">{katha.name.en}</p>
                    )}
                  </div>
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
