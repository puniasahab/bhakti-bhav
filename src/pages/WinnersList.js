import React, { useRef, useState } from "react";
import Header from "../components/Header";
import winnersCelebrationImage from "../assets/img/winnersCelebrationImage.png";
import silverCoinImage from "../assets/img/winners/silver-coin.webp";
import giftHamperImage from "../assets/img/winners/gift-hamper.webp";
import subscriptionImage from "../assets/img/winners/subscription.webp";
import { giftHamperWinners, silverCoinWinners, subscriptionWinners } from "./winnersData";
import "./WinnersList.css";

const categories = [
  { id: "silver-coin", label: "Silver Coin", shortLabel: "Silver Coin", title: "Silver Coin Winners", image: silverCoinImage, winners: silverCoinWinners },
  { id: "gift-hamper", label: "Diwali Gift Hamper", shortLabel: "Gift Hamper", title: "70 Diwali Gift Hamper Winners", image: giftHamperImage, winners: giftHamperWinners },
  { id: "subscription", label: "Free Subscription", shortLabel: "Subscription", title: "One Month Free Subscription Winners", image: subscriptionImage, winners: subscriptionWinners },
];

export default function WinnersList() {
  const [activeTab, setActiveTab] = useState("silver-coin");
  const tabRefs = useRef([]);

  const handleTabKeyDown = (event, index) => {
    let nextIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % categories.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + categories.length) % categories.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = categories.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveTab(categories[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 pb-10">

        {/* Banner Image */}
        <div className="rounded-2xl overflow-hidden shadow-md mb-5 mt-5">
          <img
            src={winnersCelebrationImage}
            alt="Vaishno Devi Temple"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Section Title */}
        <div className="font-devanagari theme_text text-center mb-5">
          <h2 className="text-2xl font-bold mb-2">
            शुभ दीपावली! बधाई हो हमारे विजेताओं को
          </h2>
          <p className="text-base italic">आपकी भक्ति, आपका इनाम</p>
        </div>

        <div className="winners-tabs font-eng" role="tablist" aria-label="Winner categories">
          {categories.map(({ id, label, shortLabel, image, winners }, index) => (
            <button
              key={id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`winners-tab-${id}`}
              type="button"
              role="tab"
              aria-label={`${label}, ${winners.length} winners`}
              aria-selected={activeTab === id}
              aria-controls={`winners-panel-${id}`}
              tabIndex={activeTab === id ? 0 : -1}
              className="winners-tab"
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <img className="winners-tab-image" src={image} alt="" width="80" height="80" />
              <span className="winners-tab-label">
                <span className="winners-tab-label-full">{label}</span>
                <span className="winners-tab-label-short" aria-hidden="true">{shortLabel}</span>
              </span>
              <span className="winners-tab-count" aria-hidden="true">{winners.length}</span>
            </button>
          ))}
        </div>

        {categories.map(({ id, title, winners }) => (
          <section
            key={id}
            id={`winners-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`winners-tab-${id}`}
            hidden={activeTab !== id}
            tabIndex={0}
            className="winners-panel font-eng"
          >
            {activeTab === id && (
              <>
                <h3 className="winners-list-title">{title}</h3>
                <ol className="winners-list" aria-label={title}>
                  {winners.map((winner, index) => (
                    <li key={`${winner.name}-${winner.state}`} className="winner-card shadow-sm">
                      <span className="winner-number" aria-hidden="true">{index + 1}.</span>
                      <div className="winner-details">
                        <span className="winner-name">{winner.name}</span>
                        {winner.gender && <span className="winner-gender">{winner.gender}</span>}
                      </div>
                      <span className="winner-location">{winner.state}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
