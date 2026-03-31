import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import Loader from "../components/Loader";
import { blogApis } from "../api.jsx";
import { X } from "lucide-react";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const data = await blogApis.getBlogs();
        console.log("Consoling line data:", data);
        setBlogs(data?.data || []);
      } catch (err) {
        console.error("Consoling line Blog fetch error:", err);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) return <Loader message="🙏 Loading Blogs 🙏" size={200} />;

  return (
    <>
      <Header pageName={{ hi: "Cykx", en: "Blogs" }} />

      <PageTitleCard
        titleHi={"ब्लॉग"}
        titleEn={"Blogs"}
        customFontSize={"22px"}
        customEngFontSize={"13px"}
      />

      <div className="container mx-auto px-4 pb-10">

        {error && (
          <div className="text-center py-8 text-red-500 font-eng">{error}</div>
        )}

        {!error && blogs.length === 0 && (
          <div className="text-center py-10 font-eng text-gray-500">No blogs found.</div>
        )}

        {/* Blog Cards List */}
        <div className="space-y-4">
          {blogs.map((blog) => {
            const thumbnailUrl = blog?.thumbnail?.url || null;
            const thumbnailAlt = blog?.thumbnail?.alt || blog?.title || "Blog thumbnail";

            return (
              <div
                key={blog.id}
                onClick={() => setSelected(blog)}
                className="flex gap-3 bg-[rgba(255,250,244,0.92)] rounded-2xl shadow-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                style={{ border: "1.5px solid #E9B9C5" }}
              >
                {/* Thumbnail — only rendered when available */}
                {thumbnailUrl && (
                  <div className="shrink-0 w-24 self-stretch bg-[#f5e9ec] overflow-hidden rounded-l-2xl">
                    <img
                      src={thumbnailUrl}
                      alt={thumbnailAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Text */}
                <div className={`flex-1 py-3 pr-3 flex flex-col justify-center ${!thumbnailUrl ? "pl-3" : ""}`}>
                  <h3 className="font-eng font-bold text-[#9A283D] text-sm leading-snug line-clamp-2">
                    {blog.title}
                  </h3>
                  {blog.description && (
                    <p className="font-eng text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {blog.description}
                    </p>
                  )}
                  <span className="font-eng text-xs text-[#9A283D] font-semibold mt-1.5">
                    Read more →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Return to Home */}
        <div className="h-16" /> {/* spacer so last card isn't hidden behind the fixed button */}

      </div>

      {/* Return to Home — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 pt-2 bg-gradient-to-t from-[#FFFAF4]/90 to-transparent pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="font-eng font-bold text-white py-3 px-8 rounded-full shadow-lg pointer-events-auto"
          style={{ backgroundColor: "#9A283D" }}
        >
          ← Return to Home
        </button>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#FFFAF4] rounded-3xl overflow-hidden"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button — fixed at top-right, never scrolls */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-20 bg-white rounded-full p-1.5 shadow-md"
            >
              <X size={20} className="text-[#9A283D]" />
            </button>

            {/* Scrollable content area */}
            <div className="overflow-y-auto" style={{ maxHeight: "85vh" }}>

              {/* Hero image — use blog_images[0] if available */}
              {selected?.blog_images && selected.blog_images.length > 0 && (
                <div className="w-full h-52 overflow-hidden rounded-t-3xl">
                  <img
                    src={selected.blog_images[0].url}
                    alt={selected.blog_images[0].alt || selected.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="px-5 pt-4 pb-8">
                {/* Title */}
                <h2 className="font-eng font-bold text-[#9A283D] text-lg leading-snug mb-3">
                  {selected.title}
                </h2>

                {/* Divider */}
                <div
                  className="w-16 h-1 rounded-full mb-4"
                  style={{ background: "linear-gradient(to right, #9A283D, #F5A418)" }}
                />

                {/* Description */}
                {selected.description ? (
                  <p className="font-eng text-sm text-gray-700 leading-relaxed">
                    {selected.description}
                  </p>
                ) : (
                  <p className="font-eng text-sm text-gray-500">No content available.</p>
                )}

                {/* Remaining blog images (index 1 onwards) */}
                {selected?.blog_images && selected.blog_images.length > 1 && (
                  <div className="mt-5 space-y-3">
                    {selected.blog_images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.alt || `Blog image ${idx + 2}`}
                        className="w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </>
  );
}
