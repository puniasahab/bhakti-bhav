import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitleCard from "../components/PageTitleCard";
import { wallpaperApis } from "../api";
import axios from "axios";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";


function WallpaperDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("");

  const baseParams = useGA4BaseParams("Wallpaper Detail Screen");
  const { trackEvent } = useGA4Tracker(baseParams);

  const hasTracked = useRef(false);


  const downloadWallpaper = async (id) => {
    try {
      const response = await axios.get(`http://api.bhaktibhav.app/frontend/download/${id}`, {
        responseType: 'blob', // important
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from response headers if sent, fallback to default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'download.jpg';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
    }


  }

  useEffect(() => {
    if (!id) return;

    fetch(`https://api.bhaktibhav.app/frontend/wallpaper/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.status === "success" && resJson.data) {
          setDetail(resJson.data);
          if (!hasTracked.current) {
            trackEvent(GA4Events.wallpaper_viewed, { id: resJson.data?._id, event_label: "wallpaper_detail_page_viewed", title: resJson.data?.godName });
            hasTracked.current = true;
          }
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

  //  useEffect(() => {
  //   trackEvent(GA4Events.wallpaper_viewed, { id: detail?._id, event_label: "wallpaper_detail_page_viewed", title: detail?.godName });
  // }, [])

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;
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
    // First try Web Share API for better image sharing support with preview
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
      // Try to fetch and share the image as a file with preview
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const godName = detail.godName || 'Divine Wallpaper';
          const file = new File([blob], `${godName}-bhakti-bhav-wallpaper.jpg`, { type: 'image/jpeg' });
          
          const shareData = {
            title: `🙏 ${godName} - Beautiful wallpaper from Bhakti Bhav! 🙏`,
            text: `🌟 ${godName} Wallpaper from Bhakti Bhav 🌟

�️ Wallpaper Link: ${imageUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual wallpapers, mantras, and devotional content!

🔗 https://play.google.com/store/apps/details?id=com.bhakti_bhav

🙏 Har Har Mahadev 🙏`,
            files: [file],
            url: imageUrl
          };

          if (navigator.canShare(shareData)) {
            return navigator.share(shareData);
          } else {
            throw new Error('Cannot share files');
          }
        })
        .catch(() => {
          // Fallback to WhatsApp URL with optimized message including god name and image link
          const godName = detail.godName || 'Divine Wallpaper';
          const message = `🙏 ${godName} - Beautiful wallpaper from Bhakti Bhav! 🙏

🌟 ${godName} Wallpaper 🌟

🖼️ View/Download Wallpaper: ${imageUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual wallpapers, mantras, and devotional content!

🔗 App Link: https://play.google.com/store/apps/details?id=com.bhakti_bhav

🙏 Har Har Mahadev 🙏`;

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
      const godName = detail.godName || 'Divine Wallpaper';
      const message = `🙏 ${godName} - Beautiful wallpaper from Bhakti Bhav! 🙏

🌟 ${godName} Wallpaper 🌟

🖼️ View/Download Wallpaper: ${imageUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual wallpapers, mantras, and devotional content!

🔗 App Link: https://play.google.com/store/apps/details?id=com.bhaktibhav

🙏 Har Har Mahadev 🙏`;

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
            <button className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors font-eng" onClick={() => {trackEvent(GA4Events.wallpaper_download_icon_clicked, { id: detail._id, event_label: "download_button_clicked_inside_wallpaper_detail_page", title: detail.godName }); downloadWallpaper(detail._id);}}>
              <a href={`https://api.bhaktibhav.app/frontend/download/${detail._id}`} download>
                Download
              </a>
            </button>
            <button
              className="flex-1 max-w-[120px] py-3 px-4 border-2 border-[#9A283D] rounded-xl theme_text font-semibold text-lg hover:bg-[#9A283D] hover:text-white transition-colors font-eng"
              onClick={() => {trackEvent(GA4Events.wallpaper_share_cta_clicked, { id: detail._id, event_label: "share_button_clicked_inside_wallpaper_detail_page", title: detail.godName }); handleWhatsAppShare.bind(this, detail.imageUrl)();}}
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
