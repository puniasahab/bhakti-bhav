import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageContext } from "../contexts/LanguageContext";
import { useAudio } from "../contexts/AudioContext";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";

export default function ChalisaDetail() {
  const { id } = useParams();
  const [chalisa, setChalisa] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, fontSize } = useContext(LanguageContext);
  const { play, pause, stop, isPlaying, currentTrack } = useAudio();

  useEffect(() => {
    async function fetchChalisa() {
      try {
        const res = await fetch(
          `https://api.bhaktibhav.app/frontend/chalisa/${id}`
        );
        const json = await res.json();

        if (json.status === "success" && json.data) {
          setChalisa(json.data);
          console.log("Fetched chalisa detail:", json.data);
        } else {
          setChalisa(null);
          alert("No data found!");
        }
      } catch (error) {
        console.error("API Error:", error);
        setChalisa(null);
      } finally {
        setLoading(false);
      }
    }

    fetchChalisa();
  }, [id]);

  const handlePlay = () => {
    const url = chalisa.audioUrl;
    if (!url) return;
    
    // Check if this chalisa is currently playing
    if (currentTrack === url && isPlaying) {
      pause();
    } else {
      // Store chalisa name in localStorage or you could modify the AudioContext to accept metadata
      localStorage.setItem('currentTrackName', `${chalisa.name?.hi || chalisa.name?.en}`);
      play(url);
    }
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;
  if (!chalisa)
    return <p className="text-center py-10">❌ No chalisa found</p>;

  const jsonFile = {
    "share": {
      "hi": "'ks;j djsa",
      "en": "Share"
    },
    "listen": {
      "hi": "pkyhlk lqusa",
      "en": "Listen"
    },
    "pause": {
      "hi": "can djsa" ,
      "en": "Pause"
    },
    "player": {
      "hi": "चालीसा प्लेयर",
      "en": "Chalisa Player"
    }
  }


  const shareText = `🌸 ${chalisa.name?.en || "Chalisa"} 🌸\n\n${chalisa.text?.en|| ""}\n\nListen here: ${window.location.href}`;

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
        bellImage.onload = () => {
          console.log('Bell image loaded successfully from main path');
          resolve();
        };
        bellImage.onerror = reject;
        bellImage.src = "../img/bell_ring.png"; // Primary absolute path
      });

      console.log('Bell image drawn successfully', bellImage);
      
      // Bell positioning to match reference image exactly
      const bellAreaWidth = canvas.width * 0.25; // 25% width for proper proportion
      const bellAreaHeight = 320; // Fixed height for better proportion
      
      ctx.drawImage(
        bellImage,
        15, // x position - closer to edge like in reference
        12,  // y position - near top edge
        bellAreaWidth,
        bellAreaHeight
      );
      
    } catch (error) {
      console.warn('Primary bell image failed to load, trying alternative paths');
      
      // Try alternative bell image paths
      try {
        const bellImageAlt = new Image();
        bellImageAlt.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          bellImageAlt.onload = () => {
            console.log('Alternative bell image loaded successfully from secondary path');
            resolve();
          };
          bellImageAlt.onerror = reject;
          bellImageAlt.src = '../img/bell_ring.png'; // Secondary relative path
        });
        
        console.log('Alternative bell image drawn successfully', bellImageAlt);
        const bellAreaWidth = canvas.width * 0.25;
        const bellAreaHeight = 180;
        
        ctx.drawImage(bellImageAlt, 10, 8, bellAreaWidth, bellAreaHeight);
        
      } catch (altError) {
        console.warn('Secondary bell image also failed, trying tertiary path');
        
        // Try tertiary bell image path
        try {
          const bellImageTertiary = new Image();
          bellImageTertiary.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            bellImageTertiary.onload = () => {
              console.log('Tertiary bell image loaded successfully from bell_ring path');
              resolve();
            };
            bellImageTertiary.onerror = reject;
            bellImageTertiary.src = '/img/bell_ring.png'; // Tertiary path with bell_ring
          });
          
          console.log('Tertiary bell image drawn successfully', bellImageTertiary);
          const bellAreaWidth = canvas.width * 0.25;
          const bellAreaHeight = 180;
          
          ctx.drawImage(bellImageTertiary, 10, 8, bellAreaWidth, bellAreaHeight);
          
        } catch (tertiaryError) {
          console.warn('All bell image paths failed, drawing fallback shape');
          
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
          
          console.log('Fallback bell shape drawn successfully');
        }
      }
    }
    
    // "भक्ति भाव" logo at top center
    ctx.fillStyle = '#9A283D';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    const logoY = 60;
    ctx.fillText('भक्ति भाव', canvas.width / 2, logoY);
    
    // Main deity image (if available) - circular with golden border
    if (chalisa.imageUrl) {
      try {
        const deityImage = new Image();
        deityImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          deityImage.onload = resolve;
          deityImage.onerror = reject;
          deityImage.src = chalisa.imageUrl.startsWith('http')
            ? chalisa.imageUrl
            : `https://api.bhaktibhav.app${chalisa.imageUrl}`;
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
    
    // Chalisa title below deity image
    ctx.fillStyle = '#9A283D';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    const titleY = 250;
    
    const chalisaName = chalisa.name?.hi || "चालीसा";
    ctx.fillText(chalisaName, canvas.width / 2, titleY);
    
    // English subtitle in parentheses
    const englishName = chalisa.name?.en || "";
    if (englishName) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = '14px sans-serif';
      ctx.fillText(`(${englishName})`, canvas.width / 2, titleY + 25);
    }
    
    // "Click below to read and download chalisa" text
    ctx.fillStyle = '#6A1B9A';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click below to read and download chalisa', canvas.width / 2, titleY + 60);
    
    // Bottom branding section (positioned back to original position)
    const brandingY = canvas.height - 100; // Back to original spacing
    
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
    const chalisaName = chalisa.name?.hi || chalisa.name?.en || "चालीसा";
    const currentUrl = window.location.href;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.bhakti_bhav';
    
    // Create share message with website URL and download link
    const shareMessage = `🙏 ${chalisaName} - Beautiful चालीसा from Bhakti Bhav! 🙏

📖 Read the complete चालीसा here: ${currentUrl}

📱 Download Bhakti Bhav app from Play Store for more spiritual चालीसा, mantras, and devotional content!

🔗 ${playStoreUrl}

🙏 Har Har Mahadev 🙏`;

    try {
      const canvas = await generateShareTemplate();
      
      // Create a modal or display div to show the image with clickable links
      const modalDiv = document.createElement('div');
      modalDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 20px;
        box-sizing: border-box;
      `;
      
      // Create container for image and links
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        text-align: center;
      `;
      
      // Add canvas image
      const img = document.createElement('img');
      img.src = canvas.toDataURL();
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        border-radius: 10px;
        margin-bottom: 20px;
      `;
      
      // Create links section
      const linksDiv = document.createElement('div');
      linksDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 15px;
      `;
      
      // Read on website link
      const websiteDiv = document.createElement('div');
      websiteDiv.innerHTML = `
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #2C3E50;">📖 Read on website:</p>
        <a href="${currentUrl}" target="_blank" style="color: #0066CC; text-decoration: none; word-break: break-all; font-size: 14px;">${currentUrl}</a>
      `;
      
      // Download app link
      const downloadDiv = document.createElement('div');
      downloadDiv.innerHTML = `
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #2C3E50;">📱 Download App:</p>
        <a href="${playStoreUrl}" target="_blank" style="color: #0066CC; text-decoration: none; word-break: break-all; font-size: 14px;">${playStoreUrl}</a>
      `;
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ Close';
      closeBtn.style.cssText = `
        background: #9A283D;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        margin-top: 15px;
        font-size: 14px;
      `;
      closeBtn.onclick = () => document.body.removeChild(modalDiv);
      
      // Share button for native sharing
      const shareBtn = document.createElement('button');
      shareBtn.textContent = '📤 Share Image';
      shareBtn.style.cssText = `
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        margin: 15px 10px 0 10px;
        font-size: 14px;
      `;
      
      shareBtn.onclick = async () => {
        // Try native sharing with image
        canvas.toBlob(async (blob) => {
          if (navigator.share && navigator.canShare) {
            const file = new File([blob], `${chalisaName.replace(/\s+/g, '-')}-bhakti-bhav-chalisa.png`, { type: 'image/png' });
            
            const shareData = {
              title: `🙏 ${chalisaName} - चालीसा from Bhakti Bhav! 🙏`,
              text: shareMessage,
              files: [file]
            };
            
            if (navigator.canShare(shareData)) {
              try {
                await navigator.share(shareData);
                document.body.removeChild(modalDiv);
              } catch (err) {
                console.error("Share failed:", err);
                // Fallback to text share
                await navigator.share({
                  title: `🙏 ${chalisaName} - चालीसा from Bhakti Bhav! 🙏`,
                  text: shareMessage,
                  url: currentUrl
                });
                document.body.removeChild(modalDiv);
              }
            } else {
              // Fallback to text share
              await navigator.share({
                title: `🙏 ${chalisaName} - चालीसा from Bhakti Bhav! 🙏`,
                text: shareMessage,
                url: currentUrl
              });
              document.body.removeChild(modalDiv);
            }
          } else {
            alert("Sharing is not supported on this browser.");
          }
        }, 'image/png');
      };
      
      // Assemble the modal
      linksDiv.appendChild(websiteDiv);
      linksDiv.appendChild(downloadDiv);
      
      contentDiv.appendChild(img);
      contentDiv.appendChild(linksDiv);
      contentDiv.appendChild(shareBtn);
      contentDiv.appendChild(closeBtn);
      
      modalDiv.appendChild(contentDiv);
      
      // Close modal when clicking outside
      modalDiv.onclick = (e) => {
        if (e.target === modalDiv) {
          document.body.removeChild(modalDiv);
        }
      };
      
      document.body.appendChild(modalDiv);
      
    } catch (err) {
      console.error("Share failed:", err);
      alert("Share failed. Please try again.");
    }
  };
  return (
    <>
      <Header pageName={{ hi: "pkyhlk", en: "Chalisa" }} hindiFontSize="true" />

      <PageTitleCard
        titleHi={chalisa.name.hi}
        titleEn={chalisa.name.en}
        customEngFontSize={'13px'}
        customFontSize={'18px'}
      />

      <div className="container mx-auto px-4 mt-4 pb-20">

        {chalisa.imageUrl && (
          <div className="flex justify-center mb-6">
          <img
             src={
                chalisa.imageUrl.startsWith("http")
                  ? chalisa.imageUrl
                  : `https://api.bhaktibhav.app${chalisa.imageUrl}`
            }
            alt={chalisa.name?.hi || chalisa.name?.en}
            className="max-w-[300px] max-h-[300px] mx-auto mt-4 rounded-xl shadow-lg"
          />
        </div> 
        )}


        <div className="flex justify-center gap-4 my-6">
          <div className="mt-4">

            <button className={`bg-[#9A283D] text-white px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"}`} onClick={handleNativeShare}>
              <img src="../img/share_icon.png" alt="" className="w-[15px] h-[15px] mr-2" /> {language === "hi" ? jsonFile.share.hi : jsonFile.share.en}
            </button>
          </div>

          <div className="mt-4">
            {chalisa.audioUrl && (
              <button
                onClick={handlePlay}
                className={`px-6 py-2 rounded-full shadow flex items-center ${language === "hi" ? "font-hindi" : "font-eng"} ${
                  currentTrack === chalisa.audioUrl && isPlaying ? "bg-red-600 text-white" : "bg-[#9A283D] text-white"
                }`}
              >
                {currentTrack === chalisa.audioUrl && isPlaying ? (
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

        
        <div className={`theme_text text-center leading-loose ${fontSize} ${language === "hi" ? "font-hindi" : "font-eng"}`}>
          {language === "hi"
            ?
            <div dangerouslySetInnerHTML={{ __html: chalisa.text.hi.replace(/,/g, "]").replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%") }} />
            // chalisa.text.hi.split("\n").map((line, idx) => (
            //   <p key={idx}>{line.replace(/,/g, ']')}</p>
            // ))
            // : chalisa.text.en.split("\n").map((line, idx) => (
            //   <p key={idx}>{line}</p>
            // ))
            : <div dangerouslySetInnerHTML={{ __html: chalisa.text.en }} />
          }
        </div>

      </div>


    </>
  );
}
