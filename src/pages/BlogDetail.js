import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { blogApis } from "../api.jsx";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchBlog() {
      try {
        setLoading(true);
        const data = await blogApis.getBlogById(id);
        console.log("Consoling line BlogDetail data:", data);
        // API may return { data: [...] } or { data: {...} }
        const blog = Array.isArray(data?.data) ? data.data[0] : data?.data;
        setBlog(blog || null);
      } catch (err) {
        console.error("Consoling line BlogDetail fetch error:", err);
        setError("Failed to load blog. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) return <Loader message="🙏 Loading Blog 🙏" size={200} />;

  if (error || !blog) {
    return (
      <>
        <Header pageName={{ hi: "CykWx", en: "Blogs" }} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#FFFAF4" }}>
          <p className="font-eng text-red-500 text-center">{error || "Blog not found."}</p>
          <button
            onClick={() => navigate("/blogs")}
            className="font-eng font-bold text-white py-3 px-8 rounded-full shadow-lg"
            style={{ backgroundColor: "#9A283D" }}
          >
            ← Back to Blogs
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header pageName={{ hi: "CykWx", en: "Blogs" }} />

      <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFFAF4" }}>

        {/* Hero image */}
        {blog?.blog_images && blog.blog_images.length > 0 && (
          <div className="container mx-auto px-4 pt-4">
            <div className="w-full rounded-2xl overflow-hidden shadow-md">
              <img
                src={blog.blog_images[0].url}
                alt={blog.blog_images[0].alt || blog.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 pt-5 pb-10">

          {/* Title */}
          <h2 className="font-eng font-bold text-[#9A283D] text-xl leading-snug mb-1">
            {blog.title}
          </h2>

          {/* Gradient underline accent */}
          <div
            className="w-12 h-[3px] rounded-full mb-4"
            style={{ background: "linear-gradient(to right, #9A283D, #F5A418)" }}
          />

          {/* Body — full HTML content from API */}
          {blog.description && (
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{
                __html: blog.description
              }}
            />
          )}

          {/* Remaining blog images (index 1 onwards) */}
          {blog?.blog_images && blog.blog_images.length > 1 && (
            <div className="mt-5 space-y-3">
              {blog.blog_images.slice(1).map((img, idx) => (
                <div key={idx} className="w-full rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={img.url}
                    alt={img.alt || `Blog image ${idx + 2}`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back to Blogs — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 pt-2 bg-gradient-to-t from-[#FFFAF4]/90 to-transparent pointer-events-none">
        <button
          onClick={() => { navigate("/blogs"); window.scrollTo(0, 0); }}
          className="font-eng font-bold text-white py-3 px-8 rounded-full shadow-lg pointer-events-auto"
          style={{ backgroundColor: "#9A283D" }}
        >
          ← Back to Blogs
        </button>
      </div>
    </>
  );
}
