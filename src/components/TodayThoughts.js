import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "../pages/style.css";

function TodayThoughts() {
  const [thoughtData, setThoughtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const shareTemplateRef = useRef(null);

  useEffect(() => {
    fetch("https://api.bhaktibhav.app/frontend/daythoughts")
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === "success" && data.data) {
          setThoughtData(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching thought:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!thoughtData) {
    return <p className="text-center mt-4 text-red-500">No thought available.</p>;
  }


  const shareText = `🌸 Today's Thought 🌸\n\n"${thoughtData.thought.hi}"\n– ${thoughtData.author.hi}`;

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
    
    // Load and draw the bell image
    try {
      const bellImage = new Image();
      bellImage.crossOrigin = 'anonymous'; // Handle CORS if needed
      
      await new Promise((resolve, reject) => {
        bellImage.onload = resolve;
        bellImage.onerror = reject;
        bellImage.src = './img/bell_ring.png'; // Path to your bell image
      });
      
      // Position the bell image at top-left matching .bell_bg CSS styling
      // Width: 30% of canvas (mobile), positioned at top-left
      const bellAreaWidth = canvas.width * 0.3; // 30% width for mobile
      const bellAreaHeight = 375 * (canvas.height / 700); // Scale proportionally
      
      // Draw the bell image at the correct position and size
      ctx.drawImage(
        bellImage, 
        0, // x position (left edge)
        0, // y position (top edge)
        bellAreaWidth, // width (30% of canvas)
        bellAreaHeight // height (scaled proportionally)
      );
      
    } catch (error) {
      console.warn('Bell image failed to load, falling back to drawn bell:', error);
      
      // Fallback: Draw a simple bell if image fails to load
      ctx.fillStyle = '#D4AF37';
      const bellX = 40;
      const bellY = 50;
      
      // Simple bell shape
      ctx.beginPath();
      ctx.arc(bellX, bellY, 16, Math.PI, 0, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(bellX - 16, bellY);
      ctx.lineTo(bellX - 20, bellY + 25);
      ctx.lineTo(bellX + 20, bellY + 25);
      ctx.lineTo(bellX + 16, bellY);
      ctx.closePath();
      ctx.fill();
    }
    
    // Logo area - matching mt-[120px] from HTML
    ctx.fillStyle = '#9A283D'; // Theme color for logo text
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    const logoY = 120 * (canvas.height / 700); // Scale proportionally
    ctx.fillText('भक्ति भाव', canvas.width / 2, logoY);
    
    // Content area - matching mt-[150px] px-6 from HTML
    const contentStartY = 270 * (canvas.height / 700); // Adjusted for better spacing
    
    // Subtitle - matching "~~~ आज का सुविचार ~~~"
    ctx.fillStyle = '#9A283D';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('~~~ आज का सुविचार ~~~', canvas.width / 2, contentStartY);
    
    // Main thought text - matching text-3xl leading-relaxed font-semibold
    ctx.fillStyle = '#2C3E50'; // Dark color for main text
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    
    // Word wrap for the thought with proper spacing
    const words = thoughtData.thought.hi.split(' ');
    let line = '';
    let y = contentStartY + 60;
    const maxWidth = canvas.width - 80; // px-6 equivalent padding
    const lineHeight = 35; // leading-relaxed equivalent
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line.trim(), canvas.width / 2, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), canvas.width / 2, y);
    
    // Author name - matching mt-4 text-base font-medium
    ctx.font = '18px serif';
    ctx.fillStyle = '#5D4037'; // Darker color for author
    ctx.fillText(`– ${thoughtData.author.hi}`, canvas.width / 2, y + 50);
    
    // Bottom branding section - matching mt-auto mb-6
    const brandingY = canvas.height - 80; // mb-6 equivalent
    
    // Yellow background box for logo - matching bg-[#FFD65A] text-[#6d0019]
    ctx.fillStyle = '#FFD65A';
    const logoBoxWidth = 70;
    const logoBoxHeight = 45;
    const logoBoxX = (canvas.width / 2) - 90;
    const logoBoxY = brandingY;
    
    // Rounded rectangle for logo background (rounded-md)
    const borderRadius = 6;
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
    
    // Small logo icon placeholder inside yellow box
    ctx.fillStyle = '#6d0019';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति भाव', logoBoxX + (logoBoxWidth / 2), logoBoxY + 30 + 8);
    
    // Branding text next to logo - matching text-[#6d0019]/90
    ctx.fillStyle = 'rgba(109, 0, 25, 0.9)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Shared from', logoBoxX + logoBoxWidth + 10, brandingY + 15);
    
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Bhakti Bhav App', logoBoxX + logoBoxWidth + 10, brandingY + 32);
    
    // Add subtle decorative border
    ctx.strokeStyle = '#E8D5B7';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    return canvas;
  };

  const handleNativeShare = async () => {
    try {
      const canvas = await generateShareTemplate();
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'bhakti-bhav-thought.png', { type: 'image/png' });
          
          const shareData = {
            title: "Today's Thought - Bhakti Bhav",
            text: shareText,
            files: [file]
          };
          
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
            } catch (err) {
              console.error("Share failed:", err);
              // Fallback to text share
              await navigator.share({
                title: "Today's Thought - Bhakti Bhav",
                text: shareText,
                url: window.location.href
              });
            }
          } else {
            // Fallback to text share
            await navigator.share({
              title: "Today's Thought - Bhakti Bhav",
              text: shareText,
              url: window.location.href
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

  const handleWhatsAppShare = async () => {
    try {
      const canvas = await generateShareTemplate();
      
      // Convert canvas to blob and create download link for WhatsApp
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bhakti-bhav-thought.png';
        link.click();
        URL.revokeObjectURL(url);
        
        // Also open WhatsApp with text
        setTimeout(() => {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\nDownload Bhakti Bhav App for more spiritual content!')}`;
          window.open(whatsappUrl, "_blank");
        }, 1000);
      }, 'image/png');
    } catch (err) {
      console.error("WhatsApp share failed:", err);
      // Fallback to text only
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(url, "_blank");
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await generateShareTemplate();
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add canvas image to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 120;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save('bhakti-bhav-thought.pdf');
      
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  return (
    <div className="basis-[60%] md:basis-[70%] bg-[#FFD35A] theme_text rounded-xl p-3 text-center text-sm shadow-md relative">
      <div className="text-center custom_bg mb-6 flex flex-col md:space-y-6">
        <h2 className="mb-2 text-lg mt-[30px]">vkt dk lqfopkj</h2>

        <p className="md:text-3xl font-bold text-md mt-[30px]">
          ^^{thoughtData.thought.hi.replace(/,/g, ']')}**
        </p> 

        <p className="mt-5 text-sm">
          &ndash; {thoughtData.author.hi} 
        </p>
      </div>

      <div className="flex justify-center space-x-4 mt-6"> 
        <button onClick={handleNativeShare}>
          <img
            src="./img/hd_share_icon.png"
            alt="share"
            width="24"
            height="24"
            className="max-w-full h-auto mx-auto"
          />
        </button>
    
        <button onClick={handleWhatsAppShare}>
          <img
            src="./img/hd_whatsapp_icon.png"
            alt="whatsapp"
            width="24"
            height="24"
            className="max-w-full h-auto mx-auto"
          />
        </button>
 
        <button onClick={handleDownload}>
          <img
            src="./img/hd_adobe_icon.png"
            alt="download"
            width="24"
            height="24"
            className="max-w-full h-auto mx-auto"
          />
        </button>
      </div>
    </div>
  );
}

export default TodayThoughts;
