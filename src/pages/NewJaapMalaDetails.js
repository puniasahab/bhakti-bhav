import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CheckCircle, Hand, Info, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Loader from "../components/Loader";
import PageTitleCard from "../components/PageTitleCard";
import SEO from "../components/SEO";
import { categoryContentApis, newJaapMalaApis } from "../api";
import { replaceSpecialChars } from "../commonFunctions";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";
import "./NewJaapMalaDetails.css";

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

const stripHtmlTags = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getHinglishTitleParts = (title) => {
  const normalizedTitle = String(title || "")
    .replace(/<\/?p[^>]*>/gi, "")
    .trim();
  const [hindiText = "", englishText = ""] = normalizedTitle.split(/<\/?br\s*\/?>/i);
  const cleanHindiText = stripHtmlTags(hindiText);
  const cleanEnglishText = stripHtmlTags(englishText);

  if (!cleanEnglishText) {
    const titleWithoutTags = stripHtmlTags(normalizedTitle);
    const parenthesizedEnglish = titleWithoutTags.match(/^(.*?)\s*(\([^()]*[A-Za-z][^()]*\))\s*$/);

    if (parenthesizedEnglish) {
      return {
        hindiText: parenthesizedEnglish[1].trim(),
        englishText: parenthesizedEnglish[2].trim()
      };
    }
  }

  return {
    hindiText: cleanHindiText,
    englishText: cleanEnglishText
  };
};

const renderHinglishTitle = (title, variant = "default") => {
  const { hindiText, englishText } = getHinglishTitleParts(title);

  if (!englishText) {
    return <span className="font-eng">{stripHtmlTags(title)}</span>;
  }

  const hindiClassName = variant === "page"
    ? "new-jaap-hinglish-title-hi new-jaap-hinglish-title-hi-page"
    : "new-jaap-hinglish-title-hi";
  const englishClassName = variant === "page"
    ? "new-jaap-hinglish-title-en new-jaap-hinglish-title-en-page"
    : "new-jaap-hinglish-title-en";

  return (
    <span className={`new-jaap-hinglish-title new-jaap-hinglish-title-${variant}`}>
      <span className={hindiClassName}>{hindiText}</span>
      <span className={englishClassName}>{englishText}</span>
    </span>
  );
};

const renderTitle = (title, language, variant = "default") => {
  if (language === "hi") return replaceSpecialChars(title);
  if (language === "hinglish") return renderHinglishTitle(title, variant);
  return title;
};

const JAAP_PER_MALA = 108;
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, index) => index);

export default function NewJaapMalaDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { language, fontSize } = useContext(LanguageContext);
  const malaVideoRef = useRef(null);
  const titleScrollRef = useRef(null);
  const mantraDialogRef = useRef(null);
  const completionTimerRef = useRef(null);
  const countRef = useRef(0);
  const [detail, setDetail] = useState(() => location.state?.item || null);
  const [loading, setLoading] = useState(true);
  const [jaapCount, setJaapCount] = useState(0);
  const [malaCount, setMalaCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [jaapStats, setJaapStats] = useState(null);
  const [customMantra, setCustomMantra] = useState("");
  const [mantraDraft, setMantraDraft] = useState("");
  const [streakDays, setStreakDays] = useState(null);
  const [showStreakInfo, setShowStreakInfo] = useState(false);

  useEffect(() => () => window.clearTimeout(completionTimerRef.current), []);

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
  const cleanTitle = useMemo(() => stripHtmlTags(title), [title]);
  const pageTitle = useMemo(() => renderTitle(title, language, "page"), [title, language]);
  const imageUrl = normalizeAssetUrl(detail?.imageUrl);
  const displayImageUrl = imageUrl || "/img/shreeHanuman.png";

  const mantra = customMantra || getHinglishTitleParts(title).hindiText || cleanTitle;
  const todayMala = jaapStats?.todayMala ?? jaapStats?.currentMalaCounter ?? malaCount;
  const totalJaap = (jaapStats
    ? (jaapStats.malaSize ?? JAAP_PER_MALA) * (jaapStats.totalMala ?? 0)
    : malaCount * JAAP_PER_MALA) + (jaapCount === JAAP_PER_MALA ? 0 : jaapCount);

  const fetchStreak = useCallback(async () => {
    try {
      const response = await newJaapMalaApis.getJaapStreak();
      const data = response?.data || response;
      const days = data?.currentStreak ?? data?.streak;
      setStreakDays(typeof days === "number" ? days : null);
    } catch (error) {
      console.error("Error fetching Jaap streak:", error);
    }
  }, []);

  // Keep the existing saved-count API and completion flow.
  const fetchJaapStats = useCallback(async () => {
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
  }, [id]);

  // Fetch saved mala count from API on page load
  useEffect(() => {
    fetchJaapStats();
    fetchStreak();
  }, [fetchJaapStats, fetchStreak]);

  useEffect(() => {
    const titleScroll = titleScrollRef.current;
    if (!titleScroll) return;
    if (jaapCount === 0) {
      titleScroll.scrollTop = 0;
      return;
    }
    const activeName = titleScroll.children[jaapCount - 1];
    if (!activeName) return;
    const top = activeName.offsetTop;
    if (top < titleScroll.scrollTop || top + activeName.offsetHeight > titleScroll.scrollTop + titleScroll.clientHeight) {
      titleScroll.scrollTop = Math.max(0, top + activeName.offsetHeight - titleScroll.clientHeight);
    }
  }, [jaapCount, fontSize]);

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
        .then(() => { fetchJaapStats(); fetchStreak(); })
        .catch((error) => {
          console.error("Error updating Jaap Mala count:", error);
        });
    }

    completionTimerRef.current = window.setTimeout(() => {
      setShowConfetti(false);
    }, 3600);
  };

  const handleJaapTap = () => {
    if (showCompletionModal || countRef.current >= JAAP_PER_MALA) return;

    playMalaAnimation();
    const nextCount = countRef.current + 1;
    countRef.current = nextCount;

    if (nextCount >= JAAP_PER_MALA) {
      completeOneMala();
      return;
    }

    setJaapCount(nextCount);
  };

  const handleStartNextMala = () => {
    window.clearTimeout(completionTimerRef.current);
    countRef.current = 0;
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
        title={`${cleanTitle} | भक्ति भाव`}
        description={cleanTitle}
        canonical={`https://bhaktibhav.app/newJaapMaala-details/${id}`}
        schema={homeSchema}
      />
      <div className="new-jaap-details-header">
        <Header pageName={{ hi: "जाप माला", en: "Jaap Mala" }} fontSizeOption />
      </div>
      <div className={`new-jaap-screen new-jaap-details font-eng ${fontSize === "text-xl" ? "new-jaap-large-text" : ""}`} >
        <div className="new-jaap-fixed-content">
          <PageTitleCard
            titleHi={language === "hi" ? replaceSpecialChars(title) : ""}
            titleEn={language === "hi" ? "" : pageTitle}
            customFontSize="18px"
            isFromJaapMala
          />

          <main className="new-jaap-main">
            <div className="new-jaap-image-frame">
              <img
                crossOrigin="anonymous"
                src={displayImageUrl}
                alt={cleanTitle}
                className="new-jaap-devta-image"
                loading="lazy"
                decoding="async"
              />
            </div>
            <button
              type="button"
              className="new-jaap-change-mantra font-devanagari"
              onClick={() => {
                setMantraDraft(mantra);
                mantraDialogRef.current?.showModal();
              }}
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
              {language === "en" ? "Change mantra" : "मंत्र बदलें"}
            </button>
            <div
              ref={titleScrollRef}
              className={`new-jaap-title-scroll ${language === "hi" && !customMantra ? "font-hindi" : "font-devanagari"}`}
              role="group"
              aria-label="108 mantra repetitions"
            >
              {Array.from({ length: JAAP_PER_MALA }, (_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`new-jaap-name ${index < jaapCount ? "is-complete" : ""}`}
                  onClick={handleJaapTap}
                  aria-label={`Chant ${index + 1}: ${mantra}`}
                  aria-pressed={index < jaapCount}
                  aria-current={index === jaapCount - 1 ? "step" : undefined}
                  disabled={showCompletionModal}
                >
                  {language === "hi" && !customMantra ? replaceSpecialChars(mantra) : mantra}
                </button>
              ))}
            </div>
            <span className="sr-only" role="status">{jaapCount} of {JAAP_PER_MALA} chants completed</span>
          </main>
        </div>

        <section className="new-jaap-bottom-panel" aria-label="Jaap mala counter">
          <div className="new-jaap-totals">
            <div className="new-jaap-stat">
              <img src="/img/jaap_mala.svg" alt="" />
              <div><p>Total<br />Mala</p><strong>{jaapStats?.totalMala ?? malaCount}</strong></div>
            </div>
            <div className="new-jaap-stat">
              <Hand size={36} strokeWidth={1.2} aria-hidden="true" />
              <div><p>Total<br />Jaap</p><strong>{totalJaap}</strong></div>
            </div>
          </div>
          <div className="new-jaap-summary">
            <h2>Stats Summary</h2>
            <div className="new-jaap-summary-item">
              <span className="new-jaap-summary-icon" aria-hidden="true">🔥</span>
              <div><p>Streak</p><strong>{streakDays === null ? "—" : `${streakDays} ${streakDays === 1 ? "Day" : "Days"}`}</strong></div>
              <button type="button" className="new-jaap-streak-info" aria-label="About your streak" onClick={() => setShowStreakInfo((value) => !value)} aria-expanded={showStreakInfo}><Info size={15} /></button>
            </div>
            {showStreakInfo && <p className="new-jaap-streak-copy">Your streak is the number of consecutive days you complete a mala.</p>}
            <div className="new-jaap-summary-item">
              <img src="/img/jaap_mala.svg" alt="" />
              <div><p>Today Mala</p><strong>{todayMala}</strong></div>
            </div>
          </div>

          <button
            type="button"
            className="new-jaap-mala-button"
            onClick={handleJaapTap}
            aria-label="Tap here to start jaap"
            disabled={showCompletionModal}
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
            <span className="new-jaap-mala-text">
              {jaapCount === 0 ? (
                <>
                  <Hand size={24} strokeWidth={2.6} />
                  <span>Tap Here To</span>
                  <span>Start Jaap</span>
                </>
              ) : (
                <>
                  <small>Today's</small>
                  <b style={{fontSize: '20px'}}>{jaapCount} / {JAAP_PER_MALA}</b>
                  <span className={`new-jaap-mala-title ${language === "hinglish" ? "new-jaap-mala-title-hinglish" : ""} ${language === "hi" ? "font-devanagari" : "font-eng"}`}>
                    {language === "hi" && !customMantra ? replaceSpecialChars(mantra) : mantra}
                  </span>
                </>
              )}
            </span>
          </button>

        </section>

        <dialog ref={mantraDialogRef} className="new-jaap-mantra-dialog" aria-labelledby="change-mantra-title" onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}>
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!mantraDraft.trim()) return;
            setCustomMantra(mantraDraft.trim());
            mantraDialogRef.current.close();
          }}>
            <div className="new-jaap-dialog-heading">
              <h2 id="change-mantra-title">{language === "en" ? "Change mantra" : "मंत्र बदलें"}</h2>
              <button type="button" aria-label="Close" onClick={() => mantraDialogRef.current.close()}><X size={22} /></button>
            </div>
            <label htmlFor="jaap-mantra">God name or mantra</label>
            <input id="jaap-mantra" value={mantraDraft} onChange={(event) => setMantraDraft(event.target.value)} maxLength={120} required autoFocus />
            <p>Your current count will be kept.</p>
            <button type="submit" className="new-jaap-next-button" disabled={!mantraDraft.trim()}>Apply</button>
          </form>
        </dialog>

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
