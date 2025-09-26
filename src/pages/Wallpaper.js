import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Wallpaper() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.bhaktibhav.app/frontend/wallpapers")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.status === "success" && Array.isArray(resJson.data)) {
          setWallpapers(resJson.data);
        } else {
          setWallpapers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wallpapers:", err);
        setWallpapers([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center py-10 theme_text">⏳ Loading...</p>;
  if (!wallpapers.length) return <p className="text-center py-10">❌ No wallpapers found</p>;

  return (
    <>
      <Header />

      <div className="flex justify-center items-center mb-3">
        <p className="mb-0 text-2xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md">
          वालपेपर
          <span className="font-eng text-sm ml-2">(Wallpapers)</span>
        </p>
      </div>

      <div className="container mx-auto px-4 mt-4">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {wallpapers.map((wp) => (
            <li key={wp._id}>
              <Link
                to={`/wallpaper/${wp._id}`}  
                className="theme_bg bg-white rounded-xl shadow hover:bg-yellow-50 transition block overflow-hidden"
              >
                <div className="w-full h-36 flex items-center justify-center">
                  <img
                    src={`https://api.bhaktibhav.app${wp.imageUrl}`}
                    alt={wp.godName}
                    className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                  />
                </div>
                <div className="p-2">
                  <h2 className="md:text-xl text-lg font-semibold capitalize font-eng">
                    {wp.godName}
                  </h2>
                  <p className="text-sm text-gray-600 font-eng">
                    {wp.views} views • {wp.likes} likes
                  </p>
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
