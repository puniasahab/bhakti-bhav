import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

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

  return (
    <>
      <Header />
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center0 mb-3">
          <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text border-tl-[#EF5300] font-bold shadow-md">
            tki ekyk
            <span className="font-eng text-sm">(Jaap Mala)</span>
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((item) => (
            <li key={item._id}>
              <Link
                to={`/jaapmala/${item._id}`}
                className="relative block rounded-xl overflow-hidden shadow-lg  "
              >
                 <div className="overflow_bg">

                <img

                  src={
                    item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `https://api.bhaktibhav.app${item.imageUrl}`
                  }
                  alt={item.title.en}
                  className="w-full rounded-md max-h-[100%] md:max-h-[100%]"
                />
                <div className="absolute inset-0 theme_text flex flex-col items-center justify-center text-center px-4 z-10 top-[35%]">
                  <h2 className="text-xl font-bold">{item.title.hi}</h2>
                  <p className="text-sm font-eng">{item.title.en}</p>
                </div>
                 </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}

export default JaapMala;
