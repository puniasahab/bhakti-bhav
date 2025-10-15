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
    
    // Create a gradient background similar to the home_bg.png
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#2D1B69'); // Dark purple at top
    bgGradient.addColorStop(0.3, '#4A148C'); // Medium purple
    bgGradient.addColorStop(0.7, '#6A1B9A'); // Lighter purple
    bgGradient.addColorStop(1, '#8E24AA'); // Light purple at bottom
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bell background area - matching .bell_bg CSS styling
    // Position: absolute top: 0, left: 0, width: 30% (mobile), height: 375px
    const bellAreaWidth = canvas.width * 0.3; // 30% width for mobile
    const bellAreaHeight = 375 * (canvas.height / 700); // Scale proportionally
    
    // Create bell chain decoration to simulate bell_ring.png
    ctx.fillStyle = '#FFD700'; // Golden color for bells
    
    // Bell chain decoration at top left (more elaborate to match bell_ring.png)
    const bellCount = 6;
    const startX = 20;
    const startY = 20;
    
    for (let i = 0; i < bellCount; i++) {
      const x = startX + (i % 2) * 15; // Alternating pattern
      const y = startY + (i * 25);
      
      // Bell shapes with more detail
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Bell top cap
      ctx.fillRect(x - 4, y - 10, 8, 4);
      
      // Connecting chain
      if (i < bellCount - 1) {
        ctx.fillRect(x - 1, y + 8, 2, 15);
      }
      
      // Add some bell details
      ctx.fillStyle = '#B8860B'; // Darker gold for details
      ctx.beginPath();
      ctx.arc(x, y + 3, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#FFD700'; // Back to main color
    }
    
    // Logo area - positioned like in HTML (mt-[120px] equivalent)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    const logoY = 120 * (canvas.height / 700); // Scale proportionally
    ctx.fillText('भक्ति भाव', canvas.width / 2, logoY);
    
    // Content area - positioned like HTML (mt-[150px] equivalent)
    const contentStartY = 150 * (canvas.height / 700);
    
    // Decorative subtitle - matching HTML "~~~ आज का सुविचार ~~~"
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('~~~ आज का सुविचार ~~~', canvas.width / 2, contentStartY + 50);
    
    // Main thought text area - matching HTML text-3xl md:text-2xl leading-relaxed font-semibold
    ctx.fillStyle = 'white';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    
    // Word wrap for the thought with proper spacing (leading-relaxed equivalent)
    const words = thoughtData.thought.hi.split(' ');
    let line = '';
    let y = contentStartY + 120;
    const maxWidth = canvas.width - 80; // px-6 equivalent padding
    const lineHeight = 40; // leading-relaxed equivalent
    
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
    
    // Author name - matching HTML mt-4 text-base md:text-lg font-medium
    ctx.font = '20px serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`– ${thoughtData.author.hi}`, canvas.width / 2, y + 60);
    
    // Bottom branding section - matching HTML mt-auto mb-6 styling
    const brandingY = canvas.height - 80; // mb-6 equivalent
    
    // Yellow background box for logo - matching bg-[#FFD65A] text-[#6d0019] px-2 py-1 rounded-md
    ctx.fillStyle = '#FFD65A';
    const logoBoxWidth = 80;
    const logoBoxHeight = 50;
    const logoBoxX = (canvas.width / 2) - 100;
    const logoBoxY = brandingY;
    
    // Rounded rectangle for logo background (rounded-md equivalent)
    const borderRadius = 8;
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
    
    // Logo text inside yellow box - matching text-[#6d0019] font-semibold
    ctx.fillStyle = '#6d0019';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति', logoBoxX + (logoBoxWidth / 2), logoBoxY + 20);
    ctx.fillText('भाव', logoBoxX + (logoBoxWidth / 2), logoBoxY + 38);
    
    // Branding text next to logo - matching text-[#6d0019]/90
    ctx.fillStyle = 'rgba(109, 0, 25, 0.9)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Shared from', logoBoxX + logoBoxWidth + 15, brandingY + 20);
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Bhakti Bhav App', logoBoxX + logoBoxWidth + 15, brandingY + 38);
    
    // Add decorative elements matching the spiritual theme
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    // Decorative corners with more spiritual design
    const cornerSize = 25;
    
    // Top left corner decoration
    ctx.beginPath();
    ctx.moveTo(15, cornerSize + 15);
    ctx.lineTo(cornerSize + 15, 15);
    ctx.moveTo(15, 15);
    ctx.lineTo(cornerSize + 15, cornerSize + 15);
    ctx.stroke();
    
    // Top right corner decoration
    ctx.beginPath();
    ctx.moveTo(canvas.width - 15, cornerSize + 15);
    ctx.lineTo(canvas.width - cornerSize - 15, 15);
    ctx.moveTo(canvas.width - 15, 15);
    ctx.lineTo(canvas.width - cornerSize - 15, cornerSize + 15);
    ctx.stroke();
    
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
