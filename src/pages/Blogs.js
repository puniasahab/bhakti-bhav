import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PageTitleCard from "../components/PageTitleCard";
import Loader from "../components/Loader";
import { blogApis } from "../api.jsx";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // ── Blog List Page ──────────────────────────────────────────────────────────
  return (
    <>
      <Header pageName={{ hi: "CykWx", en: "Blogs" }} />

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
                onClick={() => { navigate(`/blogs/${blog.id}`); window.scrollTo(0, 0); }}
                className="flex gap-3 bg-[rgba(255,250,244,0.92)] rounded-2xl shadow-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                style={{ border: "1.5px solid #E9B9C5" }}
              >
                {/* Thumbnail */}
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

        {/* Spacer for fixed button */}
        <div className="h-16" />

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
    </>
  );
}
