import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import PageTitleCard from "../components/PageTitleCard";

function AartiDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, fontSize, setFontSize } = useContext(LanguageContext);
  const { play, pause, stop, isPlaying, currentTrack } = useAudio();

  useEffect(() => {
    fetch(`https://api.bhaktibhav.app/frontend/arti/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === "success" && data.data) {
          setDetail(data.data);
          console.log("Fetched aarti detail:", data.data);
        } else {
          setDetail(null);
          alert("No data found!");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);


  const handlePlay = () => {
    const url = detail.audioUrl?.startsWith("http")
      ? detail.audioUrl
      : `https://api.bhaktibhav.app${detail.audioUrl}`;
    
    if (!url) return;
    
    // Check if this aarti is currently playing
    if (currentTrack === url && isPlaying) {
      pause();
    } else {
      // Store aarti name for the global player
      localStorage.setItem('currentTrackName', `${detail.name?.hi || detail.name?.en} आरती`);
      play(url);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!detail)
    return <p className="text-center py-10 theme_text">❌ No data found!</p>;

  const jsonFile = {
    "share": {
      "hi": "'ks;j djsa",
      "en": "Share"
    },
    "listen": {
      "hi": "vkjrh lqusa",
      "en": "Listen"
    },
    "pause": {
      "hi": "can djsa" ,
      "en": "Pause"
    },
    "player": {
      "hi": "आरती प्लेयर",
      "en": "Aarti Player"
    }
  }
  const shareText = `🌸 ${detail.name?.en || "Aarti"} 🌸\n\n${detail.text?.hi || ""}\n\nListen here: ${window.location.href}`;

  const generateShareTemplate = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match mobile aspect ratio
    canvas.width = 400;
    canvas.height = 700;
    
    // Create background matching home_bg.png - light cream/white gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#FFF8F0'); // Light cream at top
    bgGradient.addColorStop(0.3, '#FFFEF7'); // White-cream
    bgGradient.addColorStop(0.7, '#FFF5E6'); // Light cream
    bgGradient.addColorStop(1, '#F5F5F5'); // Very light grey at bottom
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load and draw the bell image at top-left (matching reference image)
    try {
      const bellImage = new Image();
      bellImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bellImage.onload = resolve;
        bellImage.onerror = reject;
        bellImage.src = '../img/bell_ring.png'; // Main bell image path
      });
      
      // Bell positioning to match reference image exactly
      const bellAreaWidth = canvas.width * 0.25; // 25% width for proper proportion
      const bellAreaHeight = 180; // Fixed height for better proportion
      
      ctx.drawImage(
        bellImage,
        10, // x position - closer to edge like in reference
        8,  // y position - near top edge
        bellAreaWidth,
        bellAreaHeight
      );
      
    } catch (error) {
      console.warn('Bell image failed to load, trying alternative paths');
      
      // Try alternative bell image paths
      try {
        const bellImageAlt = new Image();
        bellImageAlt.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          bellImageAlt.onload = resolve;
          bellImageAlt.onerror = reject;
          bellImageAlt.src = '../img/bell_ring.png'; // Alternative path
        });
        
        const bellAreaWidth = canvas.width * 0.25;
        const bellAreaHeight = 180;
        
        ctx.drawImage(bellImageAlt, 10, 8, bellAreaWidth, bellAreaHeight);
        
      } catch (altError) {
        console.warn('Alternative bell image also failed, drawing fallback');
        
        // Fallback: Draw a simple bell shape
        ctx.fillStyle = '#D4AF37'; // Golden color
        const bellX = 35;
        const bellY = 50;
        const bellSize = 20;
        
        // Simple bell shape
        ctx.beginPath();
        ctx.arc(bellX, bellY, bellSize, Math.PI, 0, false);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(bellX - bellSize, bellY);
        ctx.lineTo(bellX - bellSize - 5, bellY + 30);
        ctx.lineTo(bellX + bellSize + 5, bellY + 30);
        ctx.lineTo(bellX + bellSize, bellY);
        ctx.closePath();
        ctx.fill();
        
        // Bell clapper
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(bellX, bellY + 25, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // "भक्ति भाव" logo at top center
    ctx.fillStyle = '#9A283D';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    const logoY = 60;
    ctx.fillText('भक्ति भाव', canvas.width / 2, logoY);
    
    // Main deity image (if available) - circular with golden border
    if (detail.imageUrl) {
      try {
        const deityImage = new Image();
        deityImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          deityImage.onload = resolve;
          deityImage.onerror = reject;
          deityImage.src = detail.imageUrl.startsWith('http')
            ? detail.imageUrl
            : `https://api.bhaktibhav.app${detail.imageUrl}`;
        });
        
        // Draw deity image in center (circular like reference)
        const imgSize = 120;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 100;
        
        // Golden border
        ctx.save();
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, (imgSize / 2) + 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Clip for circular image
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(deityImage, imgX, imgY, imgSize, imgSize);
        ctx.restore();
        
      } catch (error) {
        console.warn('Deity image failed to load:', error);
        // Fallback - golden circle with ॐ
        const imgSize = 120;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 100;
        
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#9A283D';
        ctx.font = 'bold 40px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ॐ', imgX + imgSize / 2, imgY + imgSize / 2 + 15);
      }
    }
    
    // Aarti title below deity image
    ctx.fillStyle = '#9A283D';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    const titleY = 250;
    
    const aartiName = detail.name?.hi || "श्री गणेश आरती";
    ctx.fillText(aartiName, canvas.width / 2, titleY);
    
    // English subtitle in parentheses
    const englishName = detail.name?.en || "";
    if (englishName) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = '14px sans-serif';
      ctx.fillText(`(${englishName})`, canvas.width / 2, titleY + 25);
    }
    
    // "Click here to read" text
    ctx.fillStyle = '#6A1B9A';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click here to read', canvas.width / 2, titleY + 60);
    
    // Website URL as clickable link in the middle section (main feature)
    const currentUrl = window.location.href;
    ctx.fillStyle = '#0066CC'; // Blue color for link
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    
    // Split URL to fit properly if too long
    if (currentUrl.length > 50) {
      const urlParts = currentUrl.split('/');
      const domain = urlParts[0] + '//' + urlParts[2];
      const path = '/' + urlParts.slice(3).join('/');
      
      ctx.fillText(domain, canvas.width / 2, titleY + 85);
      ctx.fillText(path, canvas.width / 2, titleY + 100);
    } else {
      ctx.fillText(currentUrl, canvas.width / 2, titleY + 85);
    }
    
    // Bottom branding section (positioned like reference image)
    const brandingY = canvas.height - 100; // Moved up slightly for better spacing
    
    // Yellow background box for logo (matching reference size and position)
    ctx.fillStyle = '#FFD65A';
    const logoBoxWidth = 70; // Slightly smaller to match reference
    const logoBoxHeight = 45; // Adjusted height
    const logoBoxX = 30; // Positioned like in reference
    const logoBoxY = brandingY;
    
    // Rounded rectangle for logo background
    const borderRadius = 8; // Slightly more rounded
    ctx.beginPath();
    ctx.moveTo(logoBoxX + borderRadius, logoBoxY);
    ctx.lineTo(logoBoxX + logoBoxWidth - borderRadius, logoBoxY);
    ctx.quadraticCurveTo(logoBoxX + logoBoxWidth, logoBoxY, logoBoxX + logoBoxWidth, logoBoxY + borderRadius);
    ctx.lineTo(logoBoxX + logoBoxWidth, logoBoxY + logoBoxHeight - borderRadius);
    ctx.quadraticCurveTo(logoBoxX + logoBoxWidth, logoBoxY + logoBoxHeight, logoBoxX + logoBoxWidth - borderRadius, logoBoxY + logoBoxHeight);
    ctx.lineTo(logoBoxX + borderRadius, logoBoxY + logoBoxHeight);
    ctx.quadraticCurveTo(logoBoxX, logoBoxY + logoBoxHeight, logoBoxX, logoBoxY + logoBoxHeight - borderRadius);
    ctx.lineTo(logoBoxX, logoBoxY + borderRadius);
    ctx.quadraticCurveTo(logoBoxX, logoBoxY, logoBoxX + borderRadius, logoBoxY);
    ctx.closePath();
    ctx.fill();
    
    // Logo text inside yellow box (matching reference style)
    ctx.fillStyle = '#6d0019';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति', logoBoxX + (logoBoxWidth / 2), logoBoxY + 16);
    ctx.fillText('भाव', logoBoxX + (logoBoxWidth / 2), logoBoxY + 30);
    
    // Branding text next to logo (positioned like reference)
    ctx.fillStyle = 'rgba(109, 0, 25, 0.9)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    const textX = logoBoxX + logoBoxWidth + 12;
    ctx.fillText('Shared from', textX, brandingY + 12);
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Bhakti Bhav App', textX, brandingY + 25);
    
    // App store buttons (matching reference image style)
    const buttonY = brandingY + 35;
    const buttonWidth = 45; // Smaller buttons like reference
    const buttonHeight = 12;
    
    // Google Play button
    ctx.fillStyle = '#000000';
    ctx.fillRect(textX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Google Play', textX + buttonWidth / 2, buttonY + 8);
    
    // App Store button
    ctx.fillStyle = '#000000';
    ctx.fillRect(textX + buttonWidth + 8, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('App Store', textX + buttonWidth + 8 + buttonWidth / 2, buttonY + 8);
    
    // Decorative border
    ctx.strokeStyle = '#E8D5B7';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    return canvas;
  };

  const handleNativeShare = async () => {
    const aartiName = detail.name?.hi || detail.name?.en || "आरती";
    const currentUrl = window.location.href;
    
    // Create share message with website URL
    const shareMessage = `🙏 ${aartiName} - Beautiful आरती from Bhakti Bhav! 🙏

📖 Listen to the complete आरती here: ${currentUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual आरती, mantras, and devotional content!

🔗 https://play.google.com/store/apps/details?id=com.bhaktibhav

🙏 Har Har Mahadev 🙏`;

    try {
      const canvas = await generateShareTemplate();
      
      // Convert canvas to blob and share directly
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${aartiName.replace(/\s+/g, '-')}-bhakti-bhav-aarti.png`, { type: 'image/png' });
          
          const shareData = {
            title: `🙏 ${aartiName} - आरती from Bhakti Bhav! 🙏`,
            text: shareMessage,
            files: [file]
          };
          
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
            } catch (err) {
              console.error("Share failed:", err);
              // Fallback to text share
              await navigator.share({
                title: `🙏 ${aartiName} - आरती from Bhakti Bhav! 🙏`,
                text: shareMessage,
                url: currentUrl
              });
            }
          } else {
            // Fallback to text share
            await navigator.share({
              title: `🙏 ${aartiName} - आरती from Bhakti Bhav! 🙏`,
              text: shareMessage,
              url: currentUrl
            });
          }
        } else {
          alert("Sharing is not supported on this browser.");
        }
      }, 'image/png');
    } catch (err) {
      console.error("Share failed:", err);
      alert("Share failed. Please try again.");
    }
  };

  return (
    <>
      <Header pageName={{ hi: "vkjrh", en: "Aarti" }} hindiFontSize="true" />
      <PageTitleCard
        titleHi={detail.name.hi}
        titleEn={detail.name.en} 
        customEngFontSize={"13px"}
        customFontSize={"19px"}
        
      />
      <div className="container mx-auto px-4 pb-20"> 
        {detail.imageUrl && (
          <img
            src={
              detail.imageUrl.startsWith("http")
                ? detail.imageUrl
                : `https://api.bhaktibhav.app${detail.imageUrl}`
            }
            alt={detail.name?.en || "Aarti Image"}
            className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-lg shadow-lg"
          />
        )}

        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">

            <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`}
            onClick={handleNativeShare}
            >
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
            </button>
          </div>

          <div className="mt-4">
            {detail.audioUrl && (
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${
                  currentTrack === (detail.audioUrl?.startsWith("http") ? detail.audioUrl : `https://api.bhaktibhav.app${detail.audioUrl}`) && isPlaying ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                }`}
              >
                {currentTrack === (detail.audioUrl?.startsWith("http") ? detail.audioUrl : `https://api.bhaktibhav.app${detail.audioUrl}`) && isPlaying ? (
                  <>
                    <span className="audio_pause_icon mr-2"></span> {language === "hi" ? jsonFile.pause.hi : jsonFile.pause.en}
                  </>
                ) : (
                  <>
                    <span className="audio_icon mr-2"></span> {language === "hi" ? jsonFile.listen.hi : jsonFile.listen.en}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className={`theme_text leading-loose mt-4 text-center ${fontSize}  ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ? 
            <div dangerouslySetInnerHTML={{ __html: detail.description?.hi.replace(/\.\.\./g, "---").replace(/,/g, "]") }} /> 
            :  
            <div dangerouslySetInnerHTML={{ __html: detail.description?.en }} />
          }
        </div>

        {/* Text */}
        {detail.text && (
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg shadow max-w-2xl mx-auto">
            <pre
              className={`whitespace-pre-wrap leading-relaxed ${language === "hi" ? `font-hindi ${fontSize}` : `italic font-eng ${fontSize}`}`}
            >
              {language === "hi" ? detail.text.hi : detail.text.en}
            </pre>
          </div>
        )}


      </div>

      
    </>
  );
}

export default AartiDetail;
