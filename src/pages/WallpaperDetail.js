import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function WallpaperDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; // wait for id

    fetch(`https://api.bhaktibhav.app/frontend/wallpaper/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.status === "success" && resJson.data) {
          setDetail(resJson.data); // ✅ directly set the object
          console.log("Fetched wallpaper detail:", resJson.data);
        } else {
          setDetail(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wallpaper by id:", err);
        setDetail(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!detail) return <p>No data found!</p>;

  return (
    <>
      <Header /> 
        <div className="flex justify-center items-center mb-3">
          <p
            className="mb-0 text-xl w-auto py-1 bg-[rgba(255,250,244,0.6)] rounded-b-xl mx-auto px-4 theme_text font-bold shadow-md"
          >
            {detail.godName}
          </p>
          
        </div>

        <div className="container mx-auto p-4 text-center theme_text">
          <img
            src={`https://api.bhaktibhav.app${detail.imageUrl}`}
            alt={detail.godName}
            className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
          />

          {/* Wallpaper Info */}
          <div className="mt-4 theme_text space-y-1 font-eng flex items-center justify-between">
            <p><strong>Views:</strong> {detail.views}</p>
            <p><strong>Likes:</strong> {detail.likes}</p>
            <p><strong>Downloads:</strong> {detail.downloads}</p>
          </div>
        </div>
        <Footer />
      </>
      );
}

      export default WallpaperDetail;
