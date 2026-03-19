import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import Loader from "../components/Loader";
import { blogApis } from "../api.jsx";
import { X } from "lucide-react";

// Drupal JSONAPI helpers
function getImageUrl(blog, included) {
  const imgRel = blog?.relationships?.field_blog_image?.data;
  if (!imgRel || !included) return null;
  const imgRes = included.find((inc) => inc.id === imgRel.id);
  if (!imgRes) return null;

  // Try different URI shapes Drupal JSONAPI may return
  const uriUrl = imgRes?.attributes?.uri?.url;
  const uriValue = imgRes?.attributes?.uri?.value; // e.g. "public://filename.jpg"
  const imageStyleUri =
    imgRes?.attributes?.image_style_uri?.[0]?.thumbnail ||
    imgRes?.attributes?.image_style_uri?.[0]?.medium ||
    imgRes?.attributes?.image_style_uri?.[0]?.large;

  const raw = uriUrl || imageStyleUri;
  if (raw) return raw.startsWith("http") ? raw : `https://drupal.df3.club${raw}`;

  // Fallback: build public file URL from uri.value (public://path)
  if (uriValue) {
    const filePath = uriValue.replace("public://", "/sites/default/files/");
    return `https://drupal.df3.club${filePath}`;
  }

  return null;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [included, setIncluded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const data = await blogApis.getBlogs();
        setBlogs(data?.data || []);
        setIncluded(data?.included || []);
      } catch (err) {
        console.error("Blog fetch error:", err);
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
            const title = blog?.attributes?.title || "Untitled";
            const bodyRaw = blog?.attributes?.body?.value || blog?.attributes?.body?.processed || "";
            const summary = blog?.attributes?.body?.summary || stripHtml(bodyRaw).slice(0, 100);
            const imgUrl = getImageUrl(blog, included);
            const date = blog?.attributes?.created
              ? new Date(blog.attributes.created).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })
              : null;

            return (
              <div
                key={blog.id}
                onClick={() => setSelected({ blog, imgUrl, title, bodyRaw, date })}
                className="flex gap-3 bg-[rgba(255,250,244,0.92)] rounded-2xl shadow-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                style={{ border: "1.5px solid #E9B9C5" }}
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-24 h-24 bg-[#f5e9ec] flex items-center justify-center overflow-hidden rounded-l-2xl">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl">🙏</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 py-3 pr-3 flex flex-col justify-center">
                  <h3 className="font-eng font-bold text-[#9A283D] text-sm leading-snug line-clamp-2">
                    {title}
                  </h3>
                  {date && (
                    <p className="font-eng text-xs text-gray-400 mt-0.5">{date}</p>
                  )}
                  {summary && (
                    <p className="font-eng text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {summary}...
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
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="font-eng font-bold text-white py-3 px-8 rounded-full shadow-md"
            style={{ backgroundColor: "#9A283D" }}
          >
            ← Return to Home
          </button>
        </div>

      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#FFFAF4] rounded-3xl overflow-y-auto"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-md"
            >
              <X size={20} className="text-[#9A283D]" />
            </button>

            {/* Detail Image */}
            {selected.imgUrl && (
              <div className="w-full h-52 overflow-hidden rounded-t-3xl">
                <img
                  src={selected.imgUrl}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="px-5 pt-4 pb-8">
              {/* Date */}
              {selected.date && (
                <p className="font-eng text-xs text-gray-400 mb-1">{selected.date}</p>
              )}

              {/* Title */}
              <h2 className="font-eng font-bold text-[#9A283D] text-lg leading-snug mb-3">
                {selected.title}
              </h2>

              {/* Divider */}
              <div className="w-16 h-1 rounded-full mb-4" style={{ background: "linear-gradient(to right, #9A283D, #F5A418)" }}></div>

              {/* Body */}
              {selected.bodyRaw ? (
                <div
                  className="font-eng text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selected.bodyRaw }}
                />
              ) : (
                <p className="font-eng text-sm text-gray-500">No content available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
