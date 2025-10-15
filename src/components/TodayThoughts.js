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
    
    // Add decorative bell elements at top left (simplified)
    ctx.fillStyle = '#FFD700'; // Golden color for bells
    
    // Bell chain decoration at top left
    for (let i = 0; i < 3; i++) {
      const x = 30 + (i * 15);
      const y = 30 + (i * 10);
      
      // Small bell shapes
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Small connecting elements
      if (i < 2) {
        ctx.fillRect(x + 6, y - 1, 10, 2);
      }
    }
    
    // Logo area - using text since we can't load images in canvas easily
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति भाव', canvas.width / 2, 150);
    
    // Decorative subtitle
    ctx.fillStyle = 'white';
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('~~~ आज का सुविचार ~~~', canvas.width / 2, 320);
    
    // Main thought text area
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    
    // Word wrap for the thought with proper spacing
    const words = thoughtData.thought.hi.split(' ');
    let line = '';
    let y = 380;
    const maxWidth = canvas.width - 60; // Padding for better appearance
    const lineHeight = 35;
    
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
    
    // Author name
    ctx.font = '18px serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`– ${thoughtData.author.hi}`, canvas.width / 2, y + 50);
    
    // Bottom branding section - matching the HTML design
    const brandingY = canvas.height - 80;
    
    // Yellow background box for logo
    ctx.fillStyle = '#FFD65A';
    const logoBoxWidth = 60;
    const logoBoxHeight = 40;
    const logoBoxX = (canvas.width / 2) - 80;
    const logoBoxY = brandingY;
    
    // Rounded rectangle for logo background
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
    
    // Logo text inside yellow box
    ctx.fillStyle = '#6d0019';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति', logoBoxX + (logoBoxWidth / 2), logoBoxY + 16);
    ctx.fillText('भाव', logoBoxX + (logoBoxWidth / 2), logoBoxY + 30);
    
    // Branding text next to logo
    ctx.fillStyle = '#6d0019';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Shared from', logoBoxX + logoBoxWidth + 10, brandingY + 15);
    
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Bhakti Bhav App', logoBoxX + logoBoxWidth + 10, brandingY + 32);
    
    // Add some decorative elements at corners
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    // Top decorative corners
    ctx.beginPath();
    ctx.moveTo(15, 35);
    ctx.lineTo(35, 15);
    ctx.moveTo(15, 15);
    ctx.lineTo(35, 35);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - 15, 35);
    ctx.lineTo(canvas.width - 35, 15);
    ctx.moveTo(canvas.width - 15, 15);
    ctx.lineTo(canvas.width - 35, 35);
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
