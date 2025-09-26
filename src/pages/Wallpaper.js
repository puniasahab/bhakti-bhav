import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Heart, Lock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

export default function Wallpaper() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!wallpapers.length) return <p className="text-center py-10">❌ No wallpapers found</p>;
 
  const categories = ["All", ...new Set(wallpapers.map((wp) => wp.godName.toLowerCase()))];
 
  const filteredWallpapers =
    activeCategory === "All"
      ? wallpapers
      : wallpapers.filter(
        (wp) => wp.godName?.toLowerCase() === activeCategory.toLowerCase()
      );
 
  const getImageUrl = (wp) => {
    if (wp.imagethumb && wp.imagethumb !== "") {
      return wp.imagethumb.startsWith("http")
        ? wp.imagethumb
        : `https://api.bhaktibhav.app${wp.imagethumb}`;
    }
    return wp.imageUrl.startsWith("http")
      ? wp.imageUrl
      : `https://api.bhaktibhav.app${wp.imageUrl}`;
  };

  return (
    <>
      <Header />
 
      <div className="flex gap-3 justify-start px-4 mt-4 mb-6 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full border text-sm font-eng whitespace-nowrap transition ${activeCategory === cat
                ? "bg-[#9A283D] text-white"
                : "border-[#9A283D] text-[#9A283D]"
              }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-4">
        <ul className="grid grid-cols-2 gap-4">
          {filteredWallpapers.map((wp) => (
            <li key={wp._id}>
              <Link to={`/wallpaper/${wp._id}`} className="block">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <div className="w-full h-40 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(wp)}
                      alt={wp.godName}
                      className="w-auto rounded-md max-h-[100%] md:max-h-[100%]"
                    />
                  </div>

                  {/* {wp.accessType === "paid" && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow">
                      <Lock size={16} className="text-[#9A283D]" />
                    </div>
                  )} */}

                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 theme_text">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow text-xs font-eng">
                      <Download size={14} className="text-[#9A283D]" />
                      {wp.downloads}
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow text-xs font-eng">
                      <Eye size={14} className="text-[#9A283D]" />
                      {wp.views}
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow text-xs font-eng">
                      <Heart size={14} className="text-[#9A283D]" />
                      {wp.likes}
                    </div>
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
