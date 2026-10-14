import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Loader from "../components/Loader";
import SEO from "../components/SEO";
import { teachingApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { homeSchema } from "../seo/schemas";
import { GuruJiHeader, getTitleParts, getImageUrl, DEVANAGARI_FONT, ENGLISH_FONT } from "./GuruJi";

export default function GuruJiCategory() {
  const { categoryId } = useParams();
  const { state } = useLocation();
  const { language } = useContext(LanguageContext);
  const [searchParams] = useSearchParams();
  const queryLang = searchParams.get("lang");
  const effectiveLang = (queryLang || language || "").toLowerCase();
  const isEnglish = effectiveLang === "english" || effectiveLang === "en";

  const [category, setCategory] = useState(state?.category || null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCategoryAndContent() {
      setLoading(true);
      try {
        let contentData = null;
        let catData = state?.category || null;

        // 1. Try fetching category items
        try {
          const res = await teachingApis.getTeachingCategoryItems(categoryId);
          if (res?.category) catData = res.category;
          const items = Array.isArray(res?.items) ? res.items : [];
          if (items.length > 0 && items[0]?._id) {
            // 2. Fetch the teaching content for this item
            const contentRes = await teachingApis.getTeachingContentV3(items[0]._id);
            if (contentRes?.data) contentData = contentRes.data;
          }
        } catch (e) {
          // If categoryId was actually a contentId directly
          console.warn("Category items error, trying content directly:", e);
        }

        // If not loaded via category items, try categoryId as contentId directly
        if (!contentData) {
          try {
            const directContentRes = await teachingApis.getTeachingContentV3(categoryId);
            if (directContentRes?.data) {
              contentData = directContentRes.data;
            }
          } catch (e2) {
            console.error("Direct content fetch error:", e2);
          }
        }

        if (isMounted) {
          if (catData) setCategory(catData);
          if (contentData) setContent(contentData);
        }
      } catch (err) {
        console.error("Error loading Guru Ji category content:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (categoryId) fetchCategoryAndContent();

    return () => {
      isMounted = false;
    };
  }, [categoryId, state?.category]);


  const rawName = content?.name2 || content?.name || category?.name2 || category?.name || "";
  const titleParts = getTitleParts(rawName);
  const headerTitle = isEnglish
    ? (titleParts.english || titleParts.hindi || "Guru Ji")
    : (titleParts.hindi || titleParts.english || "गुरु जी");

  if (loading) return <Loader message="🙏 Loading भक्ति भाव 🙏" size={200} />;

  // Section banners matching Screenshot 2:
  // 1. महाराज श्री का परिचय (aboutUs)
  // 2. उपदेश (teaching)
  // 3. कार्यक्रम (events)
  const sections = [
    {
      key: "aboutUs",
      titleHi: content?.sectionTitles?.aboutUs?.hi || "महाराज श्री का परिचय",
      titleEn: content?.sectionTitles?.aboutUs?.en || "About Us",
      imageUrl: content?.aboutUs?.imageUrl || content?.aboutUs?.image1url || content?.aboutUs?.image1Url || content?.imageUrl || category?.imagethumb,
      hasAudio: Boolean(content?.aboutUs?.audioUrl),
    },
    {
      key: "teaching",
      titleHi: content?.sectionTitles?.teaching?.hi || "उपदेश",
      titleEn: content?.sectionTitles?.teaching?.en || "Teachings",
      imageUrl: content?.teaching?.imageUrl || content?.teaching?.image1url || content?.teaching?.image1Url || content?.imageUrl || category?.imagethumb,
      hasAudio: Boolean(content?.teaching?.audioUrl),
    },
    {
      key: "events",
      titleHi: content?.sectionTitles?.events?.hi || "कार्यक्रम",
      titleEn: content?.sectionTitles?.events?.en || "Events",
      imageUrl: content?.events?.[0]?.imageUrl || content?.events?.[0]?.image1url || content?.events?.[0]?.image1Url || content?.imageUrl || category?.imagethumb,
      hasAudio: false,
    },
  ];

  return (
    <>
      <SEO
        title={`${headerTitle} | ${isEnglish ? "Bhakti Bhav" : "भक्ति भाव"}`}
        description={`Explore ${headerTitle} teachings and events on Bhakti Bhav.`}
        canonical={`https://bhaktibhav.app/guru-ji/${categoryId}`}
        schema={homeSchema}
      />
      <div
        className="min-h-screen w-full text-[#9A283D]"
        style={{
          backgroundImage: "url('/img/repeat_bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
          backgroundColor: "#FAF9F5",
          fontFamily: isEnglish ? ENGLISH_FONT : DEVANAGARI_FONT,
        }}
      >
        <main className="container mx-auto flex max-w-md flex-col px-4 pb-12 pt-5 md:max-w-xl">
          {/* Header & Sub-badge */}
          <GuruJiHeader title={headerTitle} backRoute="/guru-ji" />

          {/* 3 Horizontal Section Banner Cards (Screenshot 2) */}
          <div className="flex flex-col gap-4 mt-2">
            {sections.map((sec) => {
              const bannerImg = getImageUrl(sec.imageUrl);
              const targetRoute = `/guru-ji/${categoryId}/${sec.key}`;

              return (
                <Link
                  key={sec.key}
                  to={targetRoute}
                  state={{ content, category, section: sec.key }}
                  className="group relative block overflow-hidden rounded-[22px] border border-[#E9DED8] bg-[#FFF5E5] shadow-[0_8px_20px_rgba(154,40,61,0.12)] transition-all hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(154,40,61,0.18)] active:scale-[0.99]"
                >
                  {bannerImg && bannerImg !== "/img/default.png" ? (
                    <div className="relative h-[180px] w-full sm:h-[210px]">
                      <img
                        src={bannerImg}
                        alt={sec.titleHi}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Chevron > on the right */}
                      <span className="absolute bottom-5 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:translate-x-1 sm:bottom-6 sm:right-6">
                        <ChevronRight size={36} strokeWidth={2.8} />
                      </span>
                    </div>
                  ) : (
                    /* Elegant fallback if banner image is missing */
                    <div className="flex h-[180px] w-full items-center justify-between bg-gradient-to-r from-[#FFF0D4] to-[#FFE0B2] px-6 sm:h-[200px]">
                      <div className="flex items-center gap-4">
                        {content?.imagethumb && (
                          <img
                            src={getImageUrl(content.imagethumb)}
                            alt={headerTitle}
                            className="h-28 w-28 object-contain"
                          />
                        )}
                        <div>
                          <h3
                            style={{ fontFamily: DEVANAGARI_FONT }}
                            className="text-2xl font-bold text-[#800000]"
                          >
                            {sec.titleHi}
                          </h3>
                          <p className="font-eng text-sm text-[#800000]/70 mt-1">{sec.titleEn}</p>
                        </div>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#800000] text-white">
                        <ChevronRight size={28} strokeWidth={2.8} />
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
