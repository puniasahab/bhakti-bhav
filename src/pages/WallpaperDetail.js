import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";

function WallpaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`https://api.bhaktibhav.app/frontend/wallpaper/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.status === "success" && resJson.data) {
          setDetail(resJson.data);
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

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail) return <p>No data found!</p>;

  return (
    <>

      <Header
        showWallpaperHeader
        godName={detail.godName}
        downloads={detail.downloads}
        views={detail.views}
        likes={detail.likes}
        pageName={{ hi: "okyisij", en: "Wallpaper" }}
      />

      <PageTitleCard
        titleHi={"okYisij"}
        titleEn={"Wallpaper"} 
        textSize="text-lg"
      />

      <div className="container mx-auto px-4 mt-4">
        <div className="flex flex-col space-y-8">
          <div className="flex-1 flex justify-center items-center p-4">
            <img
              src={`https://api.bhaktibhav.app${detail.imageUrl}`}
              alt={detail.godName}
              className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
            />
          </div>

          <div className="flex justify-center gap-6 py-4 font-eng">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 border-2 border-[#9A283D] rounded-xl theme_text"
            >
              Apply
            </button>
            <button className="px-6 py-2 border-2 border-[#9A283D] rounded-xl theme_text">
              Download
            </button>
            <button className="px-6 py-2 border-2 border-[#9A283D] rounded-xl theme_text">
              Share
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/40">
              <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl font-eng theme_text">
                <p className="font-eng font-semibold text-lg mb-4">Choose a method</p>

                <div className="space-y-3">
                  {["Home Screen", "Lock Screen", "Both"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setMethod(option)}
                      className={`w-full py-2 border-2 rounded-xl ${method === option
                        ? "bg-[#9A283D] text-white border-[#9A283D]"
                        : "border-[#9A283D] text-[#9A283D]"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-6 gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 rounded-xl border-2 border-[#9A283D] text-[#9A283D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Set as:", method);
                      setShowModal(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#9A283D] text-white"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default WallpaperDetail;
