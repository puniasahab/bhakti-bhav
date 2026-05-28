import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CheckCircle, Hand } from "lucide-react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import SEO from "../components/SEO";
import { categoryContentApis, newJaapMalaApis } from "../api";
import { replaceSpecialChars } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";

const CACHE_TTL = 5 * 60 * 1000;
const detailCache = new Map();

const getCachedContent = async (cacheKey, fetcher) => {
  const cached = detailCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  detailCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
};

const normalizeAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  if (url.startsWith("https://")) return url;
  return `https://api.bhaktibhav.app${url.startsWith("/") ? url : `/${url}`}`;
};

const getContentDetail = (response) => response?.data || response || null;

const getTitle = (detail, language) => {
  if (typeof detail?.title === "string") return detail.title;
  return detail?.title?.[language] || detail?.title?.hi || detail?.title?.en || "Jaap Mala";
};

const JAAP_PER_MALA = 108;
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, index) => index);

export default function NewJaapMalaDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { language } = useContext(LanguageContext);
  const malaVideoRef = useRef(null);
  const titleScrollRef = useRef(null);
  const [detail, setDetail] = useState(() => location.state?.item || null);
  const [loading, setLoading] = useState(true);
  const [jaapCount, setJaapCount] = useState(0);
  const [malaCount, setMalaCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [jaapStats, setJaapStats] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function fetchDetails() {
      if (!id) {
        setDetail(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cacheKey = `new-jaap-mala-detail:${id}:${language}`;
        const response = await getCachedContent(cacheKey, () =>
          categoryContentApis.fetchContentDetailsByContentId(id, language)
        );
        const contentDetail = getContentDetail(response);

        if (isActive) {
          setDetail(contentDetail);
        }
      } catch (error) {
        if (isActive) {
          console.error("New Jaap Mala details API Error:", error);
          setDetail(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isActive = false;
    };
  }, [id, language]);

  const title = useMemo(() => getTitle(detail, language), [detail, language]);
  const imageUrl = normalizeAssetUrl(detail?.imageUrl);
  const displayImageUrl = imageUrl || "/img/shreeHanuman.png";

  // Reusable function to fetch and apply jaap stats from API
  const fetchJaapStats = async () => {
    if (!id) return;
    try {
      const response = await newJaapMalaApis.getJaapMalaCount(id);
      const jaap = response?.data?.jaap ?? null;
      if (jaap) {
        setJaapStats(jaap);
        setMalaCount(jaap.currentMalaCounter ?? 0);
      }
    } catch (error) {
      console.error("Error fetching Jaap Mala count:", error);
    }
  };

  // Fetch saved mala count from API on page load
  useEffect(() => {
    fetchJaapStats();
  }, [id]);

  useEffect(() => {
    const titleScroll = titleScrollRef.current;
    if (!titleScroll || jaapCount === 0) return;

    titleScroll.scrollTop = titleScroll.scrollHeight;
  }, [jaapCount]);

  const playMalaAnimation = () => {
    const video = malaVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const completeOneMala = () => {
    const newMalaCount = malaCount + 1;
    setMalaCount(newMalaCount);
    setJaapCount(JAAP_PER_MALA);
    setShowCompletionModal(true);
    setShowConfetti(true);

    // Persist updated mala count to the API, then re-fetch latest stats
    if (id) {
      newJaapMalaApis.updateJaapMalaCount(id, 108)
        .then(() => fetchJaapStats())
        .catch((error) => {
          console.error("Error updating Jaap Mala count:", error);
        });
    }

    window.setTimeout(() => {
      setShowConfetti(false);
    }, 3600);
  };

  const handleJaapTap = () => {
    if (showCompletionModal || jaapCount >= JAAP_PER_MALA) return;

    playMalaAnimation();
    const nextCount = jaapCount + 1;

    if (nextCount >= JAAP_PER_MALA) {
      completeOneMala();
      return;
    }

    setJaapCount(nextCount);
  };

  const handleStartNextMala = () => {
    setJaapCount(0);
    setShowCompletionModal(false);
    setShowConfetti(false);
  };

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} logo="/img/logo_splash.png" />;

  if (!detail) {
    return (
      <>
        <Header pageName={{ hi: "जाप माला", en: "Jaap Mala" }} hindiFontSize={language === "hi"} />
        <p className="text-center py-10 theme_text">❌ No data found!</p>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${title} | भक्ति भाव`}
        description={title}
        canonical={`https://bhaktibhav.app/newJaapMaala-details/${id}`}
        schema={homeSchema}
      />
      <Header pageName={{ hi: "जाप माला", en: "Jaap Mala" }} hindiFontSize={language === "hi"} />
      <div className="new-jaap-screen font-eng">
        <div className="new-jaap-fixed-content">
          <PageTitleCard
            titleHi={language === "hi" ? replaceSpecialChars(title) : ""}
            titleEn={language === "hi" ? "" : title}
            customFontSize="18px"
            isFromJaapMala
          />

          <main className="new-jaap-main">
            <div className="new-jaap-image-frame">
              <img
                crossOrigin="anonymous"
                src={displayImageUrl}
                alt={title}
                className="new-jaap-devta-image"
                loading="lazy"
                decoding="async"
              />
            </div>
            {jaapCount > 0 && (
              <div
                ref={titleScrollRef}
                className={`new-jaap-title-scroll ${language === "hi" ? "font-devanagari" : "font-eng"}`}
              >
                {Array.from({ length: jaapCount }, (_, index) => (
                  <span key={`${title}-${index}`}>{title}</span>
                ))}
              </div>
            )}
          </main>
        </div>

        <section className="new-jaap-bottom-panel" aria-label="Jaap mala counter">
          <div className="new-jaap-stat">
            <div className="new-jaap-temple-circle">
              <img src="/img/temple.png" alt="" />
            </div>
            <p>Mala</p>
            <strong>{jaapStats?.totalMala ?? malaCount}</strong>
          </div>

          <button
            type="button"
            className="new-jaap-mala-button"
            onClick={handleJaapTap}
            aria-label="Tap here to start jaap"
          >
            <video
              ref={malaVideoRef}
              className="new-jaap-mala-video"
              src="/img/maala.mp4"
              muted
              playsInline
              preload="auto"
              onEnded={(event) => {
                event.currentTarget.pause();
                event.currentTarget.currentTime = 0;
              }}
            />
            <span className="
            new-jaap-mala-text">
              {jaapCount === 0 ? (
                <>
                  <Hand size={24} strokeWidth={2.6} />
                  <span>Tap Here To</span>
                  <span>Start Jaap</span>
                </>
              ) : (
                <>
                  <small>Today's</small>
                  <b>{jaapCount} / {JAAP_PER_MALA}</b>
                  <span className={`new-jaap-mala-title ${language === "hi" ? "font-devanagari" : "font-eng"}`}>{title}</span>
                </>
              )}
            </span>
          </button>

          <div className="new-jaap-stat">
            <div className="new-jaap-temple-circle">
              <img src="/img/temple.png" alt="" />
            </div>
            <p>Jaap</p>
            <strong>{jaapStats ? (jaapStats.malaSize ?? JAAP_PER_MALA) * (jaapStats.totalMala ?? 0) : jaapCount}</strong>
          </div>
        </section>

        {showConfetti && (
          <div className="new-jaap-confetti" aria-hidden="true">
            {CONFETTI_PIECES.map((piece) => (
              <span
                key={piece}
                style={{
                  "--left": `${(piece * 37) % 100}%`,
                  "--delay": `${(piece % 9) * -0.18}s`,
                  "--duration": `${2.7 + (piece % 5) * 0.22}s`,
                  "--drift": `${((piece % 7) - 3) * 28}px`
                }}
              />
            ))}
          </div>
        )}

        {showCompletionModal && (
          <div className="new-jaap-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mala-complete-title">
            <div className="new-jaap-complete-modal">
              <h2 id="mala-complete-title">🙏 Congratulations! 🙏</h2>
              <p className="new-jaap-modal-copy">You completed one Mala!</p>
              <div className="new-jaap-total-pill">
                <CheckCircle size={34} fill="#fff" strokeWidth={3} />
                <span>Total Malas: {malaCount}</span>
              </div>
              <p className="new-jaap-blessing">May your devotion grow stronger! 🕉️</p>
              <button type="button" className="new-jaap-next-button" onClick={handleStartNextMala}>
                Start Next Mala
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
