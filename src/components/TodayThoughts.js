import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function TodayThoughts() {
  const [thoughtData, setThoughtData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-center mt-4">Loading Thought...</p>;
  }

  if (!thoughtData) {
    return <p className="text-center mt-4 text-red-500">No thought available.</p>;
  }


  const shareText = `🌸 Today's Thought 🌸\n\n"${thoughtData.thought.en}"\n– ${thoughtData.author.en}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Today's Thought",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([shareText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "thought_of_the_day.txt"; // you can later use jsPDF for PDF
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="basis-[60%] md:basis-[70%] bg-[#FFD35A] theme_text rounded-xl p-3 text-center text-sm shadow-md relative">
      <div className="text-center custom_bg mb-6 flex flex-col md:space-y-6">
        <h2 className="mb-2 text-lg mt-[30px]">vkt dk lqfopkj</h2>

        <p className="md:text-3xl font-bold text-md mt-[30px]">
          ^^{thoughtData.thought.hi}**
        </p>
        {/* <p className="mt-1 text-lg font-eng italic">
          “{thoughtData.thought.en}”
        </p> */}

        <p className="mt-5 text-sm">
          &ndash; {thoughtData.author.hi} 
          {/* <br/><span className="font-eng text-sm" >({thoughtData.author.en})</span> */}
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
