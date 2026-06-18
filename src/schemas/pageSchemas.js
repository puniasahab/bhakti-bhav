// src/schemas/pageSchemas.js

export const rashifalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://bhaktibhav.app/Rashifal#webpage",
      "url": "https://bhaktibhav.app/Rashifal",
      "name": "दैनिक राशिफल - Daily Rashifal | Bhakti Bhav",
      "description": "जानिए अपना आज का राशिफल। दैनिक मेष से मीन राशि का फलादेश, ग्रह नक्षत्रों की चाल और ज्योतिषीय विश्लेषण।",
      "inLanguage": "hi"
    },
    {
      "@type": "Dataset",
      "@id": "https://bhaktibhav.app/Rashifal#dataset",
      "name": "Daily Rashifal and Astrological Predictions",
      "description": "Daily dynamic astrological updates for all 12 zodiac signs (Mesh to Meen).",
      "creator": {
        "@type": "Organization",
        "name": "Digifish Media Private Limited"
      },
      "variableMeasured": "Astrological Predictions and Horoscope",
      "temporalCoverage": "2026/2027"
    }
  ]
};

export const hindiCalendarSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://bhaktibhav.app/hindi-calendar#webpage",
      "url": "https://bhaktibhav.app/hindi-calendar",
      "name": "हिन्दू कैलेंडर और आज का पंचांग - Hindi Calendar | Bhakti Bhav",
      "description": "आज का पंचांग, तिथि, नक्षत्र, राहुकाल और हिन्दू पंचांग कैलेंडर विवरण हिन्दी में।",
      "inLanguage": "hi"
    },
    {
      "@type": "FAQPage",
      "@id": "https://bhaktibhav.app/hindi-calendar#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "आज का पंचांग और शुभ मुहूर्त क्या है?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "भक्ति भाव ऐप पर आज की तिथि, नक्षत्र, योग, करण और शुभ चौघड़िया मुहूर्त की सटीक गणना देख सकते हैं।"
          }
        }
      ]
    }
  ]
};

export const vratKathaSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://bhaktibhav.app/vrat-katha#collection",
      "url": "https://bhaktibhav.app/vrat-katha",
      "name": "व्रत कथा संग्रह - Vrat Kathas | Bhakti Bhav",
      "description": "सभी प्रमुख देवी-देवताओं के व्रतों की कथाएँ, विधि और महत्व का संपूर्ण संग्रह।",
      "inLanguage": "hi",
      "about": {
        "@type": "Thing",
        "name": "Vrat Katha"
      }
    }
  ]
};

export const jaapMalaSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://bhaktibhav.app/jaap-mala#webapp",
  "url": "https://bhaktibhav.app/jaap-mala",
  "name": "डिजिटल जाप माला काउंटर - Digital Jaap Mala Counter",
  "description": "108 मनकों की डिजिटल जाप माला। अपने मंत्रों का जाप गिनें और आत्मिक शांति पाएं।",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. For full experience install mobile app.",
  "potentialAction": {
    "@type": "InstallAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://bhaktibhav.app/",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    }
  }
};

export const newJaapMalaSchema = (id) => (  {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": `https://bhaktibhav.app/newjaapMaala/${id}`,
  "name": "Custom Dynamic Jaap Mala Counter Session",
  "description": "A dynamic virtual mantra chanting counter screen configured on Bhakti Bhav.",
  "isPartOf": {
    "@type": "WebApplication",
    "name": "Bhakti Bhav Digital Tools"
  }
});

// For dynamic article pages — pass datePublished and id dynamically
export const getKahaniyaSchema = (articleId, datePublished = "2026-01-01T08:00:00+05:30") => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://bhaktibhav.app/kahaniya/${articleId}`
  },
  "headline": "धार्मिक और पौराणिक कहानियाँ - Devotional Story",
  "description": "भक्ति भाव पर पढ़ें सनातन धर्म की प्रेरणादायक और पौराणिक कहानियाँ एवं कथाएँ।",
  "inLanguage": "hi",
  "author": {
    "@type": "Organization",
    "name": "Digifish Media"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Digifish Media Private Limited",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bhaktibhav.app/logo.png"
    }
  },
  "datePublished": datePublished
});

export const wallpaperSchema = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "url": "https://bhaktibhav.app/wallpaper",
  "name": "गॉड वॉलपेपर संग्रह - HD Hindu God Wallpapers",
  "description": "देवी-देवताओं के सुंदर वॉलपेपर, एचडी फोटोज और धार्मिक इमेजेस मुफ्त डाउनलोड करें।",
  "inLanguage": "hi",
  "provider": {
    "@type": "Organization",
    "name": "Bhakti Bhav"
  }
};

export const pujaKareSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": "https://bhaktibhav.app/puja-kare#howto",
      "name": "घर पर पूजा करने की सही विधि - Step-by-Step Puja Vidhi",
      "description": "दैनिक देव पूजन, सामग्री और आरती करने का शुद्ध एवं शास्त्रीय विधान।",
      "inLanguage": "hi",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "आचमन और पवित्रीकरण",
          "text": "शुद्ध जल से स्वयं पर छिड़काव करें और मंत्रोच्चार के साथ पवित्र हों।"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "दीपक प्रज्वलन",
          "text": "पूजन स्थल पर घी या तिल के तेल का दीपक प्रज्वलित करें।"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://bhaktibhav.app/puja-kare#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "आरती संग्रह और सही विधि क्या है?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "पूजा के समापन पर शांत मन से धूप-दीप जलाकर देवी-देवताओं की आरती प्रेमपूर्वक गानी चाहिए।"
          }
        }
      ]
    }
  ]
};