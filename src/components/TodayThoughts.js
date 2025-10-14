import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    
    // Set canvas size to match the reference image aspect ratio
    canvas.width = 400;
    canvas.height = 700;
    
    // Background - cream/white gradient like in the image
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFFEF7');
    gradient.addColorStop(0.5, '#FFF8F0');
    gradient.addColorStop(1, '#FFF5E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Light border frame
    ctx.strokeStyle = '#E8D5B7';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Decorative bell chain at top left (simplified representation)
    ctx.fillStyle = '#B8860B'; // Golden color for bells
    
    // Bell chain elements
    for (let i = 0; i < 4; i++) {
      const x = 30;
      const y = 30 + (i * 25);
      
      // Bell shape
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Bell connecting chain
      if (i < 3) {
        ctx.fillRect(x - 1, y + 8, 2, 15);
      }
    }
    
    // Main title "भक्ति भाव" - matching the image style
    ctx.fillStyle = '#8B4513'; // Brown color like in image
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति भाव', canvas.width / 2, 150);
    
    // Decorative line under title
    ctx.fillStyle = '#8B4513';
    ctx.font = '18px serif';
    ctx.fillText('~~~ आज का सुविचार ~~~', canvas.width / 2, 190);
    
    // Main thought text area - centered and properly formatted
    ctx.fillStyle = '#2C3E50'; // Dark text for readability
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    
    // Word wrap for the thought with proper spacing
    const words = thoughtData.thought.hi.split(' ');
    let line = '';
    let y = 280;
    const maxWidth = canvas.width - 80; // More padding for better appearance
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
    
    // Author name with proper styling
    ctx.font = 'italic 18px serif';
    ctx.fillStyle = '#5D4037';
    ctx.fillText(`– ${thoughtData.author.hi}`, canvas.width / 2, y + 60);
    
    // Bottom branding section - matching the yellow box in image
    const brandingY = canvas.height - 90;
    const brandingHeight = 60;
    
    // Yellow background for branding
    ctx.fillStyle = '#FFD54F';
    const borderRadius = 10;
    const rectX = 50;
    const rectY = brandingY;
    const rectWidth = canvas.width - 100;
    
    // Rounded rectangle for branding background
    ctx.beginPath();
    ctx.moveTo(rectX + borderRadius, rectY);
    ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
    ctx.lineTo(rectX + rectWidth, rectY + brandingHeight - borderRadius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + brandingHeight, rectX + rectWidth - borderRadius, rectY + brandingHeight);
    ctx.lineTo(rectX + borderRadius, rectY + brandingHeight);
    ctx.quadraticCurveTo(rectX, rectY + brandingHeight, rectX, rectY + brandingHeight - borderRadius);
    ctx.lineTo(rectX, rectY + borderRadius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
    ctx.closePath();
    ctx.fill();
    
    // Branding text
    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('भक्ति', canvas.width / 2 - 20, brandingY + 25);
    ctx.fillText('भाव', canvas.width / 2 + 20, brandingY + 25);
    
    ctx.font = '12px sans-serif';
    ctx.fillText('Shared from', canvas.width / 2, brandingY + 40);
    ctx.fillText('Bhakti Bhav App', canvas.width / 2, brandingY + 52);
    
    // Decorative corners (simple ornamental design)
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    
    // Top left corner decoration
    ctx.beginPath();
    ctx.moveTo(25, 40);
    ctx.lineTo(40, 25);
    ctx.moveTo(25, 25);
    ctx.lineTo(40, 40);
    ctx.stroke();
    
    // Top right corner decoration
    ctx.beginPath();
    ctx.moveTo(canvas.width - 25, 40);
    ctx.lineTo(canvas.width - 40, 25);
    ctx.moveTo(canvas.width - 25, 25);
    ctx.lineTo(canvas.width - 40, 40);
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
