import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import { usePujaKare } from "../contexts/PujaKareContext";
import { pujaKareApis } from "../api";
import "./style.css";

export default function PujaKareDetail() {
  const { id } = useParams();
  const { getPujaKareItemById, selectPujaKareItem } = usePujaKare();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchItemDetail() {
      try {
        // First try to get from context
        let itemData = getPujaKareItemById(id);

        console.log("Fetching item detail for ID:", id);
        console.log("Item data from context:", itemData);

        if (itemData) {
          console.log("Item found in context:", itemData);
          setItem(itemData);
          selectPujaKareItem(id);
        }

        // else {
        //   // If not in context, fetch from API
        //   console.log("Item not in context, fetching from API for ID:", id);
        //   const res = await pujaKareApis.getPujaKareItemById(id);
        //   console.log("API Response for item detail:", res);

        //   if (res && res.data) {
        //     itemData = res.data;
        //     setItem(itemData);
        //   } else {
        //     console.error("No data found for this item");
        //     setItem(null);
        //   }
        // }
      } catch (error) {
        console.error("Error fetching item detail:", error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchItemDetail();
    }
  }, [id, getPujaKareItemById, selectPujaKareItem]);

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4 font-eng">❌ Item not found</p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#9A283D] text-white px-6 py-2 rounded-lg font-eng hover:bg-[#7A1C2B] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const flowerRain = () => {
    const container = containerRef.current;
    if (!container) return;

    const flowers = ["🌸", "🌼", "🌺", "🌻", "🌹", "💮"];
    for (let i = 0; i < 30; i++) {
      const flower = document.createElement('div');
      flower.classList.add('falling-flower');
      flower.innerText = flowers[Math.floor(Math.random() * flowers.length)];
      flower.style.left = Math.random() * 100 + '%';
      flower.style.animationDelay = (Math.random() * 3) + 's';
      flower.style.fontSize = (20 + Math.random() * 20) + 'px';
      container.appendChild(flower);
      setTimeout(() => flower.remove(), 10000);
    }
  };

  const diya = () => {
    const container = containerRef.current;
    if (!container) return;

    const diya = document.createElement("img");
    diya.src = "/img/diya.gif";
    diya.className = "absolute animate-fade puja-ring";
    diya.style.left = "5%";
    diya.style.top = "58%";
    diya.style.width = "80px";
    diya.style.zIndex = "50";
    container.appendChild(diya);
    setTimeout(() => diya.remove(), 20000);
  };

  const pujaThaali = () => {
    const container = containerRef.current;
    if (!container) return;

    const sound = document.getElementById('pujaAudio');
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.play()
        .then(() => console.log("Aarti sound playing 🎶"))
        .catch(err => console.log("Audio blocked:", err));
    }

    const thaali = document.createElement("img");
    thaali.src = "/img/puja_ki_thali.gif";
    thaali.className = "puja-thaali absolute";
    thaali.style.left = "25%";
    thaali.style.top = "25%";
    thaali.style.width = "250px";
    thaali.style.zIndex = "50";
    container.appendChild(thaali);
    setTimeout(() => thaali.classList.add("animate-thaali-move"), 100);
    setTimeout(() => thaali.remove(), 20000);
  };

  const bell = () => {
    const container = containerRef.current;
    if (!container) return;

    const sound = document.getElementById('pujaAudio');
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.play()
        .then(() => console.log("Bell sound playing"))
        .catch(err => console.log("Audio blocked:", err));
    }

    const ring = document.createElement("img");
    ring.src = "/img/bell_1.gif";
    ring.className = "absolute animate-fade puja-ring";
    ring.style.right = "-3%";
    ring.style.top = "5%";
    ring.style.width = "80px";
    ring.style.zIndex = "50";
    container.appendChild(ring);
    setTimeout(() => ring.remove(), 20000);
  };

  const mala = () => {
    const container = containerRef.current;
    if (!container) return;

    // Get container dimensions for responsive positioning
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const ring = document.createElement("img");
    ring.src = "/img/flower-mala.png";
    ring.className = "absolute animate-fade puja-ring";
    
    // Calculate responsive positioning for center-neck area
    // Position mala at center horizontally and around neck area (25-30% from top)
    const leftPercentage = 70; // Center horizontally
    const topPercentage = 10; // Neck area positioning
    const malaWidth = Math.min(150, containerWidth * 0.4); // Responsive width, max 150px
    
    // Center the mala by adjusting for its width
    const leftPosition = leftPercentage - (malaWidth / containerWidth * 100 / 2);
    console.log(leftPosition, topPercentage, malaWidth, "Something is useful");
    
    ring.style.left = `${leftPosition}%`;
    ring.style.top = `${topPercentage}%`;
    ring.style.width = `${malaWidth}px`;
    ring.style.transform = "translateX(-50%)"; // Additional centering
    ring.style.zIndex = "50";
    
    container.appendChild(ring);
    setTimeout(() => ring.remove(), 20000);
  };

  const nariyal = () => {
    const container = containerRef.current;
    if (!container) return;

    const nariyal = document.createElement("img");
    nariyal.src = "/img/nariyal.png";
    nariyal.className = "absolute animate-fade puja-nariyal";
    nariyal.style.right = "5%";
    nariyal.style.top = "55%";
    nariyal.style.width = "100px";
    nariyal.style.zIndex = "50";
    container.appendChild(nariyal);
    setTimeout(() => nariyal.remove(), 20000);
  };

  const kalash = () => {
    const container = containerRef.current;
    if (!container) return;

    const kalash = document.createElement("img");
    kalash.src = "/img/kalash.png";
    kalash.className = "absolute animate-fade puja-kalash";
    kalash.style.right = "36%";
    kalash.style.top = "55%";
    kalash.style.width = "125px";
    kalash.style.zIndex = "50";
    container.appendChild(kalash);
    setTimeout(() => kalash.remove(), 20000);
  };

  const shankhAnimation = () => {
    const container = containerRef.current;
    if (!container) return;

    const sound = document.getElementById('shankhSound');
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.play()
        .then(() => console.log("Shankh sound playing 🎶"))
        .catch(err => console.log("Audio blocked:", err));
    }

    const pulse = document.createElement('div');
    pulse.classList.add('pulse');
    container.appendChild(pulse);
    setTimeout(() => pulse.remove(), 10000);
  };

  return (
    <>
      <Header pageName={{ hi: "iwtk djs", en: "Puja kare" }} />

      <PageTitleCard
        titleHi={item.name?.hi || "पूजा करे"}
        titleEn={item.name?.en || "Puja kare"}
      />

      <div className="container mx-auto px-4 mt-6">

        <main className="px-4 relative">
          <div className="container mx-auto mt-4">
            <div className="image_wrapper mb-[150px]">
              <img src={item.imageUrl} alt="" width="350" height="420" className="max-w-full h-auto mx-auto mb-8" />
            </div>
            <div className="relative w-full justify-center">
              <div className="grid grid-cols-4 gap-6 p-3 mt-6 md:mt-3">
                <button onClick={mala}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/mala.png" alt="Mala" className="w-12 h-12" />
                </button>

                <button onClick={nariyal}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/nariyal.png" alt="Nariyal" className="w-12 h-12" />
                </button>

                <button onClick={kalash}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/kalash.png" alt="Kalash" className="w-8 h-8" />
                </button>

                <button onClick={bell}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/bell_icon.png" alt="Bell" className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-6 p-3 mt-6 md:mt-3">
                <button onClick={flowerRain}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/mandala.png" alt="Flower" className="w-12 h-12" />
                </button>

                <button onClick={pujaThaali}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/puja_thali.png" alt="Deep" className="w-12 h-12" />
                </button>

                <button onClick={shankhAnimation}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/sank.png" alt="Sankh" className="w-12 h-12" />
                </button>

                <button onClick={diya}
                  className="pooja-btn bg-gradient-to-b from-yellow-200 to-orange-300 rounded-full shadow-md flex justify-center items-center hover:scale-105 transition w-16 h-16">
                  <img src="/img/deep.png" alt="Deep" className="w-12 h-12" />
                </button>
              </div>
            </div>
            <audio id="pujaAudio" className="hidden">
              <source src="/img/aarti_music.mp3" type="audio/mpeg" />
            </audio>
            <audio id="shankhSound" className="hidden">
              <source src="/img/Shankh_music.mp3" type="audio/mpeg" />
            </audio>
          </div>

          <div id="animation-container" ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-10"></div>
        </main>

      </div>
    </>
  )
}


