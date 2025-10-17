import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      console.log("Starting download for ID:", id);
      
      // Get the image data directly from the download API
      const downloadWallpaperApiResponse = await wallpaperApis.downloadWallpaper(id);
      console.log("Download API response:", downloadWallpaperApiResponse);
      
      // Check if API response is successful and has data
      if (downloadWallpaperApiResponse.status === "success" && downloadWallpaperApiResponse.data && downloadWallpaperApiResponse.data.imageUrl) {
        const imageUrl = downloadWallpaperApiResponse.data.imageUrl;
        const godName = downloadWallpaperApiResponse.data.godName || 'wallpaper';
        
        console.log("Downloading image from:", imageUrl);
        
        // Fetch the image with proper headers
        const response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        // Get the image blob
        const blob = await response.blob();
        
        // Ensure we have a valid blob
        if (!blob || blob.size === 0) {
          throw new Error('Downloaded image is empty or invalid');
        }
        
        // Get the file extension from the URL or Content-Type
        let extension = 'jpg'; // Default extension
        const contentType = response.headers.get('content-type');
        if (contentType) {
          if (contentType.includes('png')) extension = 'png';
          else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
          else if (contentType.includes('webp')) extension = 'webp';
        } else {
          // Fallback: get extension from URL
          const urlParts = imageUrl.split('.');
          if (urlParts.length > 1) {
            extension = urlParts[urlParts.length - 1].toLowerCase().split('?')[0];
          }
        }
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `bhakti-bhav-${godName.replace(/\s+/g, '-')}-wallpaper.${extension}`;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        console.log("Download completed successfully!");
        
      } else {
        throw new Error("Invalid API response or missing image URL");
      }
    } catch (err) {
      console.error("Download error details:", err);
      alert("Download failed. Please check your internet connection and try again.");
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
            <button className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors font-eng" onClick={() => downloadWallpaper(detail._id)}>
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
