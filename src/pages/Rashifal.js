import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Rashifal() {
  const [rashis, setRashis] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState(null);
  const [loading, setLoading] = useState(true);

  const rashiImages = {
    mesh: "/img/aries.png",
    vrishabh: "/img/taurus.png",
    mithun: "/img/gemini.png",
    kark: "/img/cancer.png",
    singh: "/img/leo.png",
    kanya: "/img/virgo.png",
    tula: "/img/libra.png",
    vrishchik: "/img/scorpio.png",
    dhanu: "/img/sagittarius.png",
    makar: "/img/capricorn.png",
    kumbh: "/img/aquarius.png",
    meen: "/img/pisces.png",
  };

  useEffect(() => {
    fetch("https://api.bhaktibhav.app/frontend/all-rashis")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.status === "success" && Array.isArray(resJson.data)) {
          setRashis(resJson.data);
          console.log("Fetched rashis:", resJson.data);
        } else {
          setRashis([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setRashis([]);
        setLoading(false);
      });
  }, []);

  const openModal = async (rashi) => {
    console.log("Opening modal for rashi:", rashi._id);

    try {
      const res = await fetch(
        `https://api.bhaktibhav.app/frontend/today/${rashi._id}`
      );
      const data = await res.json();
      console.log("API response:", data);

      const todayData = Array.isArray(data) ? data[0] : null;
      let content = todayData?.points?.[0];

      if (!content || typeof content !== "object") {
        content = {
          hi: ["आज का राशिफ़ल उपलब्ध नहीं है।"],
          en: ["Rashifal not available."],
        };
      }

      setSelectedRashi({
        ...rashi,
        content,
        image: rashiImages[rashi.key] || "/img/default.png",
      });

      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching rashifal details:", err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRashi(null);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-white text-lg">
        ⏳ Loading Rashifals...
      </p>
    );

  return (
    <>
      <Header />

      <div className="flex justify-center items-center mb-4">
        <p className="text-2xl py-1 px-4 bg-[rgba(255,250,244,0.6)] rounded-b-xl font-bold shadow-md theme_text">
          vkt dk jkf'kQy
          <span className="font-eng text-sm ml-2">(Aaj Ka Rashifal)</span>
        </p>
      </div>

      <main className="px-4">
        <div className="container mx-auto mt-4">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:py-6 py-3 text-center">
            {rashis.map((item) => (
              <li key={item._id}>
                <button
                  onClick={() => openModal(item)}
                  className="block bg-[#9A283D] shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl hover:rounded-[10px] hover:scale-105 transition-all duration-300 ease-in-out w-full"
                >
                  <div className="w-full h-24 flex items-center justify-center">
                    <img
                      src={rashiImages[item.key] || "/img/default.png"}
                      alt={item.name.en}
                      className="w-auto rounded-md max-h-[100%]"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white font-eng">
                      {item.name.en}
                    </h2>
                    <p className="text-2xl rashi">{item.name.hi}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        {modalOpen && selectedRashi && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full relative p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center flex flex-col items-center">
                <div className="bg-[#9A283D] rounded-lg flex items-center justify-center  mb-4">
                  <img
                    src={selectedRashi.image}
                    alt={selectedRashi.name?.en}
                    className="h-32 w-auto rounded-md mx-auto"
                  />

                </div>
                <h2 className="text-2xl theme_text mb-1 font-eng">
                  {selectedRashi.name?.hi} <span className="ml-2 text-lg">({selectedRashi.name?.en})</span>
                </h2>
                
              </div>

              <div className="text-center theme_text">
                {selectedRashi.content?.hi?.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRashi.content.hi.map((line, idx) => (
                      <li key={idx} className="text-lg leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}

                {selectedRashi.content?.en?.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 mt-4">
                    {selectedRashi.content.en.map((line, idx) => (
                      <li key={idx} className="text-lg leading-relaxed font-eng">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mx-auto text-center mt-6">
                <button
                  onClick={closeModal}
                  className="text-white text-md font-eng bg-[#9A283D] rounded-full px-6 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Rashifal;
