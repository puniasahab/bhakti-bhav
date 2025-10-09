import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Heart, Lock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getTokenFromLS, getSubscriptionStatusFromLS } from "../commonFunctions";

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


  const handleNavigate = (id, accessType) => {
    if (getSubscriptionStatusFromLS()) {
      return `/wallpaper/${id}`;
    }
    else {
      if (accessType === "free") {
        return `/wallpaper/${id}`;
      } else {
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
        <ul className="grid grid-cols-2 gap-3">
          {filteredWallpapers.map((wp) => (
            <li key={wp._id}>
              <Link to={handleNavigate(wp._id, wp.accessType)} className="block">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
                  <div className="w-full aspect-[3/4] overflow-hidden">
                    <img
                      src={getImageUrl(wp)}
                      alt={wp.godName}
                      className={`w-full h-full object-cover ${getSubscriptionStatusFromLS() ? "" : wp.accessType === "paid" ? "blur" : ""}`}
                    />
                  </div>

                  {/* {wp.accessType === "paid" && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow">
                      <Lock size={16} className="text-[#9A283D]" />
                    </div>
                  )} */}

                  <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                    <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm text-xs font-eng ${getSubscriptionStatusFromLS() ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Download size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700">{wp.downloads}</span>
                    </div>
                    <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm text-xs font-eng ${getSubscriptionStatusFromLS() ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Eye size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700">{wp.views}</span>
                    </div>
                    <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm text-xs font-eng ${getSubscriptionStatusFromLS() ? "" : wp.accessType === "paid" ? "blur" : ""}`}>
                      <Heart size={12} className="text-[#9A283D]" />
                      <span className="text-gray-700">{wp.likes}</span>
                    </div>
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
