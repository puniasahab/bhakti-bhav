import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { useKatha } from "../contexts/KathaContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
// import { useNavigate } from "react-router-dom";

export default function VratKatha() {
  const navigate = useNavigate();
  const [kathas, setKathas] = useState([]);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();
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
        const newData = [
          ...json.categories.map(item => ({
            ...item, isCategory: true,
          })),
          ...json.uncategorizedKathas.map(item => ({
            ...item, isCategory: false,
          }))
        ]

        newData.map((item) => {
          if (item.isCategory) {
            const allKathasPaid = item.kathas.every(katha => katha.accessType === "paid");
            if (allKathasPaid) {
              item.accessType = "paid";
            }
            else {
              item.accessType = "free";
            }
          }

        })

        newData.sort((a, b) => {
          if(a.accessType === "free" && b.accessType === "paid") {
            return -1;
          }
          else if(a.accessType === "paid" && b.accessType === "free") {
            return 1;
          }
          else {
            return 0;
          }
        });

        // newData.sort((a, b) => {
        //   if (a.isCategory && !b.isCategory) {
        //     const allKathasPaid = a.kathas.every(katha => katha.accessType === "paid");
        //     if (allKathasPaid && b.accessType === "paid") {
        //       return 0;
        //     }
        //     else if (allKathasPaid && b.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }
        //   }
        //   if (!a.isCategory && b.isCategory) {
        //     const allKathasPaid = b.kathas.every(katha => katha.accessType === "paid");
        //     if (allKathasPaid && a.accessType === "paid") {
        //       return 0;
        //     }
        //     else if (allKathasPaid && a.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }

        //   }
        //   if (!a.isCategory && !b.isCategory) {
        //     if (a.accessType === "free" && b.accessType === "paid") {
        //       return -1;
        //     }
        //     else if (a.accessType === "paid" && b.accessType === "free") {
        //       return 1;
        //     }
        //     else {
        //       return 0;
        //     }
        //   }

        //   if (a.isCategory && b.isCategory) {
        //     const allKathasPaidA = a.kathas.every(katha => katha.accessType === "paid");
        //     const allKathasPaidB = b.kathas.every(katha => katha.accessType === "paid");
        //     if ((allKathasPaidA && allKathasPaidB) || (!allKathasPaidA && !allKathasPaidB)) {
        //       return 0;
        //     }
        //     else if (!allKathasPaidA && !allKathasPaidB) {
        //       return 1;
        //     }
        //     else {
        //       return -1;
        //     }
        //   }
        // })
        setKathas(newData);
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

  // const handleNavigation = (id, index) => {
  //   if (kathas[index]?.kathas?.length > 0) {
  //     // Set the category data in context before navigation
  //     setCategoryData(kathas[index].kathas, kathas[index].name);
  //     navigate(`/vrat-katha/categoryDetails/${id}`);
  //   }
  //   else {
  //     navigate(`/vrat-katha/${id}`);
  //   }
  // }

  const handleNavigate = (id, index, accessType) => {
    const isActiveSubscription = getSubscriptionStatusFromLS();
    console.log("get Subscription Status From LS", isActiveSubscription);
    console.log("Type of subscription status:", typeof isActiveSubscription);
    if (isActiveSubscription) {
      console.log("Inside subscription true");
      if (kathas[index]?.kathas?.length > 0 || kathas[index]?.isCategory) {
        setCategoryData(kathas[index].kathas, kathas[index].name);
        navigate(`/vrat-katha/categoryDetails/${id}`);
      }
      else {
        navigate(`/vrat-katha/${id}`);
      }
    }
    else {
      if (kathas[index]?.kathas?.length > 0 || kathas[index]?.isCategory) {
        if (kathas[index]?.kathas?.length > 0) {
          // Set the category data in context before navigation
          setCategoryData(kathas[index].kathas, kathas[index].name);
          navigate(`/vrat-katha/categoryDetails/${id}`);
        }
        // Update this route as needed
      }

      else if (!kathas[index]?.isCategory) {
        if (kathas[index]?.accessType === "free") {
          navigate(`/vrat-katha/${id}`);
        }
        else {
          if (getTokenFromLS()) {
            navigate("/payment");
          }
          else {
            navigate("/login");
          }
        }
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

  const getPaidLogic = (katha) => {
    if (katha.isCategory) {
      const allKathasPaid = katha.kathas.every(katha => katha.accessType === "paid");
      if (allKathasPaid) {
        return "blur-sm";
      }
      else {
        return "";
      }
    }
    else {
      return katha.accessType === "paid" ? "blur-sm" : "";
    }
  }
  return (
    <>
      <Header />

      <PageTitleCard
        titleHi={"ozr dFkk"}
        titleEn={"Vrat Katha"}
        customEngFontSize={"14px"}
        customFontSize={"24px"}

      />

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {kathas.map((katha, index) => (
            <li key={katha._id}>
              <div
                onClick={() => handleNavigate(katha._id, index, katha.accessType)}
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden cursor-pointer"
              >
                <div className="w-full h-40 flex items-center justify-center overflow-hidden  ">
                  <img

                    src={`${katha.imagethumb}`}
                    alt={katha.name?.hi || katha.name?.en}
                    className={`w-auto rounded-md max-h-[100%] md:max-h-[100%] ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}
                  />
                </div>
                <div className="p-2">
                  {katha.name?.hi && (
                    <h2 className={`md:text-xl text-lg font-semibold truncate font-hindi pt-3 ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}>
                      {katha.name.hi}
                    </h2>
                  )}
                  {katha.name?.en && (
                    <p className={`text-sm truncate font-eng ${getSubscriptionStatusFromLS() ? "" : getPaidLogic(katha)}`}>{katha.name.en}</p>
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
