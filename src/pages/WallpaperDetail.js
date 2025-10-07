import { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import { wallpaperApis } from "../api";

function WallpaperDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("");


  const downloadWallpaper = async (id) => {
    try {
      // Fetch the wallpaper data from API
      const response = await wallpaperApis.downloadWallpaper(id);
      console.log("Download response:", response);
      
      if (!response.status || response.code !== 200) {
        throw new Error("Failed to fetch wallpaper data");
      }

      // Get the image URL from the response
      const imageUrl = response.data.imageUrl;
      if (!imageUrl) {
        throw new Error("Image URL not found in response");
      }

      // Fetch the actual image as a blob
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch image from URL");
      }
      
      const blob = await imageResponse.blob();

      // Extract filename from URL or use a default name
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || `bhakti-bhav-wallpaper-${response.data.godName}.png`;

      // Create a temporary object URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click(); // trigger the download
      a.remove();

      // Revoke the object URL to free memory
      window.URL.revokeObjectURL(url);
      
      console.log("Download completed successfully");
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Unable to download image. Please try again.");
    }
  }

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

  const handleShare = (imageUrl) => { 
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this wallpaper!",
          text: "Beautiful wallpaper for your phone/desktop.",
          url: imageUrl,
        })
        .catch(console.error);
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(imageUrl);
      alert("Link copied to clipboard!");
    }
  }
  const handleWhatsAppShare = (imageUrl) => {
    // First try Web Share API for better image sharing support
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
      // Try to fetch and share the image as a file
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'bhakti-bhav-wallpaper.jpg', { type: 'image/jpeg' });
          const shareData = {
            title: '🙏 Beautiful wallpaper from Bhakti Bhav! 🙏',
            text: '📱 Please download Bhakti Bhav app from Play Store for more spiritual wallpapers, mantras, and devotional content!\n\n🔗 https://play.google.com/store/apps/details?id=com.bhaktibhav',
            files: [file]
          };
          
          if (navigator.canShare(shareData)) {
            return navigator.share(shareData);
          } else {
            throw new Error('Cannot share files');
          }
        })
        .catch(() => {
          // Fallback to WhatsApp URL with optimized message
          const message = `🙏 Beautiful wallpaper from Bhakti Bhav! 🙏

Check out this amazing wallpaper: ${imageUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual content!
🔗 https://play.google.com/store/apps/details?id=com.bhaktibhav`;
          
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
          const whatsappWebUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          
          // Try WhatsApp app first, then web version
          const tryWhatsAppApp = () => {
            window.location.href = whatsappUrl;
            // Fallback to web version after a short delay if app doesn't open
            setTimeout(() => {
              window.open(whatsappWebUrl, '_blank');
            }, 1000);
          };
          
          tryWhatsAppApp();
        });
    } else {
      // Fallback for browsers without Web Share API
      const message = `🙏 Beautiful wallpaper from Bhakti Bhav! 🙏

Check out this amazing wallpaper: ${imageUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual content!
🔗 https://play.google.com/store/apps/details?id=com.bhaktibhav`;
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const whatsappWebUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      // Try WhatsApp app first, then web version
      try {
        window.location.href = whatsappWebUrl;
        setTimeout(() => {
          window.open(whatsappWebUrl, '_blank');
        }, 1000);
      } catch (error) {
        window.open(whatsappWebUrl, '_blank');
      }
    }
  };

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
        titleHi={"okyisij"}
        titleEn={"Wallpaper"}
        customEngFontSize={"14px"}
        customFontSize={"24px"}
        
      />

      <div className="container mx-auto px-1 mt-4">
        <div className="flex flex-col">
          {/* Image Container */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative max-w-sm w-full">
              <img
                src={`${detail.imageUrl}`}
                alt={detail.godName}
                className="w-full h-auto aspect-[3/4] object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {/* <button className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors">
              Apply
            </button> */}
            <button className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors font-eng" onClick = {() => downloadWallpaper(detail._id)}>
              Download
            </button>
            <button 
              className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors font-eng" 
              onClick={handleWhatsAppShare.bind(this, detail.imageUrl)}
            >
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
                      onClick={() => { setMethod(option) }}
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
      
    </>
  );
}

export default WallpaperDetail;
