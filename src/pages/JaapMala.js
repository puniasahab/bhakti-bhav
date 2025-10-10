import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";

function JaapMala() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.bhaktibhav.app/frontend/all-jaapmala")
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          setData([]);
          alert("No data found!");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  const handleNavigate = (id, accessType) => {
    const subscriptionStatus = getSubscriptionStatusFromLS();
    console.log("get Subscription Status From LS", subscriptionStatus);
    console.log("Type of subscription status:", typeof subscriptionStatus);
    
    if (subscriptionStatus) {
        return `/jaapmala/${id}`;
      
    } else {
      if (accessType === "free") {
        return `/jaapmala/${id}`;
      } else {
        if (getTokenFromLS())
          return `/payment`;
        else {
          return "/login";
        }
      }
    }
  }

  function toHindiDigits(str) {
  const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
  return str.replace(/\d/g, d => map[d]);
}


const HindiWithEnglishNumbers = ( text ) => {
  // Split text by numbers while keeping numbers in result
  const parts = text.split(/(\d+)/);

  return (
    <h2 className="text-xl font-bold">
      {parts.map((part, index) => {
        if (/^\d+$/.test(part)) {
          // Numbers only
          return (
            <span key={index} className="font-eng">
              {part}
            </span>
          );
        } else {
          // Hindi or other text
          return (
            <span key={index} className="font-hindi">
              {part}
            </span>
          );
        }
      })}
    </h2>
  );
};

  return (
    <>
      <Header pageName={{ hi: "tkkp ekyk", en: "Jaap mala" }} />
      <PageTitleCard
        titleHi={"tki ekyk"}
        titleEn={"Jaap mala"}
        customEngFontSize={"13px"}
        customFontSize={"21px"}
      />

      <div className="container mx-auto px-4">

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((item) => (
            <li key={item._id}>
              <Link
                to={handleNavigate(item._id, item.accessType)}
                className="relative block rounded-xl overflow-hidden shadow-lg  "
              >
                <div className={`overflow_bg`}>

                  <img

                    src={
                      item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : `https://api.bhaktibhav.app${item.imageUrl}`
                    }
                    alt={item.title.en}
                    className={`w-full rounded-md max-h-[150px] md:max-h-[150px] object-cover ${getSubscriptionStatusFromLS() ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}
                  />
                  <div className={`absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%] ${getSubscriptionStatusFromLS() ? "" : item.accessType === "paid" ? "blur-sm" : ""}`}>
                    {/* <h2 className="text-xl font-bold" 
                    // style={{fontFamily: "KrutiDev"}}>
                      >{item.title.hi}</h2> */}
                      {HindiWithEnglishNumbers(item.title.hi)}
                    <p className="text-sm font-eng">{item.title.en}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </>
  );
}

export default JaapMala;
