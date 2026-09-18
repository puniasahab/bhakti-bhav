import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";

// 25 Questions divided into 5 Fixed Sets (5 questions each)
const QUESTION_SETS = {
  1: [
    {
      id: 1,
      qNumber: 1,
      question: "Bhagwan Shri Krishna ka janm kis nagari mein hua tha?",
      hindiQuestion: "भगवान श्री कृष्ण का जन्म किस नगरी में हुआ था?",
      options: [
        { label: "A", text: "Ayodhya", hindi: "अयोध्या" },
        { label: "B", text: "Mathura", hindi: "मथुरा" },
        { label: "C", text: "Vrindavan", hindi: "वृन्दावन" },
        { label: "D", text: "Dwarka", hindi: "द्वारका" },
      ],
      answer: 1, // Mathura
    },
    {
      id: 2,
      qNumber: 2,
      question: "Hanuman Ji ko kis Bhagwan ka sabse bada bhakt mana jata hai?",
      hindiQuestion: "हनुमान जी को किस भगवान का सबसे बड़ा भक्त माना जाता है?",
      options: [
        { label: "A", text: "Krishna Ji", hindi: "श्री कृष्ण जी" },
        { label: "B", text: "Vishnu Ji", hindi: "श्री विष्णु जी" },
        { label: "C", text: "Shri Ram Ji", hindi: "श्री राम जी" },
        { label: "D", text: "Shiv Ji", hindi: "भगवान शिव" },
      ],
      answer: 2, // Shri Ram Ji
    },
    {
      id: 3,
      qNumber: 3,
      question: "Ramayan kisne likhi thi?",
      hindiQuestion: "रामायण की रचना किसने की थी?",
      options: [
        { label: "A", text: "Ved Vyas", hindi: "महर्षि वेद व्यास" },
        { label: "B", text: "Tulsidas", hindi: "गोस्वामी तुलसीदास" },
        { label: "C", text: "Valmiki Ji", hindi: "महर्षि वाल्मीकि जी" },
        { label: "D", text: "Narad Muni", hindi: "देवर्षि नारद मुनि" },
      ],
      answer: 2, // Valmiki Ji
    },
    {
      id: 4,
      qNumber: 4,
      question: "Bhagavad Gita ka updesh kisne diya tha?",
      hindiQuestion: "श्रीमद्भगवद्गीता का दिव्य उपदेश किसने दिया था?",
      options: [
        { label: "A", text: "Shri Ram", hindi: "भगवान श्री राम" },
        { label: "B", text: "Hanuman Ji", hindi: "श्री हनुमान जी" },
        { label: "C", text: "Shri Krishna", hindi: "भगवान श्री कृष्ण" },
        { label: "D", text: "Ved Vyas", hindi: "महर्षि वेद व्यास" },
      ],
      answer: 2, // Shri Krishna
    },
    {
      id: 5,
      qNumber: 5,
      question: "Mata Lakshmi ko kis cheez ki devi mana jata hai?",
      hindiQuestion: "माता लक्ष्मी को किस चीज़ की देवी माना जाता है?",
      options: [
        { label: "A", text: "Shakti", hindi: "शक्ति" },
        { label: "B", text: "Vidya", hindi: "विद्या" },
        { label: "C", text: "Dhan aur Samriddhi", hindi: "धन और समृद्धि" },
        { label: "D", text: "Bhakti", hindi: "भक्ति" },
      ],
      answer: 2, // Dhan aur Samriddhi
    },
  ],
  2: [
    {
      id: 6,
      qNumber: 6,
      question: "Ganesh Ji ka vahan kya hai?",
      hindiQuestion: "भगवान श्री गणेश जी का वाहन क्या है?",
      options: [
        { label: "A", text: "Mor", hindi: "मोर (मयूर)" },
        { label: "B", text: "Hathi", hindi: "हाथी (गज)" },
        { label: "C", text: "Mushak (Chuha)", hindi: "मूषक (चूहा)" },
        { label: "D", text: "Nandi", hindi: "नंदी बैल" },
      ],
      answer: 2, // Mushak (Chuha)
    },
    {
      id: 7,
      qNumber: 7,
      question: "Mahadev ke gale mein kya hota hai?",
      hindiQuestion: "भगवान महादेव के गले में क्या सुशोभित होता है?",
      options: [
        { label: "A", text: "Kamal", hindi: "कमल का पुष्प" },
        { label: "B", text: "Naag", hindi: "नाग (वासुकी सर्प)" },
        { label: "C", text: "Chakra", hindi: "सुदर्शन चक्र" },
        { label: "D", text: "Gada", hindi: "कौमोदकी गदा" },
      ],
      answer: 1, // Naag
    },
    {
      id: 8,
      qNumber: 8,
      question: "Hanuman Chalisa kisne likhi thi?",
      hindiQuestion: "पवित्र हनुमान चालीसा की रचना किसने की थी?",
      options: [
        { label: "A", text: "Valmiki", hindi: "महर्षि वाल्मीकि" },
        { label: "B", text: "Ved Vyas", hindi: "महर्षि वेद व्यास" },
        { label: "C", text: "Tulsidas Ji", hindi: "गोस्वामी तुलसीदास जी" },
        { label: "D", text: "Kabir Das", hindi: "संत कबीर दास" },
      ],
      answer: 2, // Tulsidas Ji
    },
    {
      id: 9,
      qNumber: 9,
      question: "Shri Ram ke pita ka kya naam tha?",
      hindiQuestion: "भगवान श्री राम के पिता का क्या नाम था?",
      options: [
        { label: "A", text: "Janak", hindi: "महाराज जनक" },
        { label: "B", text: "Dashrath", hindi: "महाराज दशरथ" },
        { label: "C", text: "Bharat", hindi: "भरत" },
        { label: "D", text: "Vishwamitra", hindi: "महर्षि विश्वामित्र" },
      ],
      answer: 1, // Dashrath
    },
    {
      id: 10,
      qNumber: 10,
      question: "Krishna Ji ne Arjun ko Gita ka gyan kahan diya tha?",
      hindiQuestion: "श्री कृष्ण ने अर्जुन को गीता का ज्ञान कहाँ दिया था?",
      options: [
        { label: "A", text: "Mathura", hindi: "मथुरा" },
        { label: "B", text: "Kurukshetra", hindi: "कुरुक्षेत्र" },
        { label: "C", text: "Ayodhya", hindi: "अयोध्या" },
        { label: "D", text: "Dwarka", hindi: "द्वारका" },
      ],
      answer: 1, // Kurukshetra
    },
  ],
  3: [
    {
      id: 11,
      qNumber: 11,
      question: "Janmashtami kis Bhagwan ka janmotsav hai?",
      hindiQuestion: "जन्माष्टमी किस भगवान का पावन जन्मोत्सव है?",
      options: [
        { label: "A", text: "Shri Ram", hindi: "भगवान श्री राम" },
        { label: "B", text: "Ganesh Ji", hindi: "भगवान श्री गणेश" },
        { label: "C", text: "Shri Krishna", hindi: "भगवान श्री कृष्ण" },
        { label: "D", text: "Vishnu Ji", hindi: "भगवान श्री विष्णु" },
      ],
      answer: 2, // Shri Krishna
    },
    {
      id: 12,
      qNumber: 12,
      question: "Mahashivratri kis Bhagwan ko samarpit hai?",
      hindiQuestion: "महाशिवरात्रि पर्व किस भगवान को समर्पित है?",
      options: [
        { label: "A", text: "Hanuman Ji", hindi: "श्री हनुमान जी" },
        { label: "B", text: "Shiv Ji", hindi: "भगवान शिव (महादेव)" },
        { label: "C", text: "Vishnu Ji", hindi: "भगवान श्री विष्णु" },
        { label: "D", text: "Surya Dev", hindi: "भगवान सूर्य देव" },
      ],
      answer: 1, // Shiv Ji
    },
    {
      id: 13,
      qNumber: 13,
      question: "Ganesh Chaturthi kis Bhagwan ka tyohar hai?",
      hindiQuestion: "गणेश चतुर्थी किस भगवान का प्रमुख उत्सव है?",
      options: [
        { label: "A", text: "Kartikeya", hindi: "भगवान कार्तिकेय" },
        { label: "B", text: "Shiv Ji", hindi: "भगवान शिव" },
        { label: "C", text: "Ganesh Ji", hindi: "भगवान श्री गणेश" },
        { label: "D", text: "Krishna Ji", hindi: "भगवान श्री कृष्ण" },
      ],
      answer: 2, // Ganesh Ji
    },
    {
      id: 14,
      qNumber: 14,
      question: "Navratri mein kis Devi ki puja ki jati hai?",
      hindiQuestion: "नवरात्रि में मुख्य रूप से किस देवी की पूजा की जाती है?",
      options: [
        { label: "A", text: "Lakshmi Ji", hindi: "माता लक्ष्मी" },
        { label: "B", text: "Saraswati Ji", hindi: "माता सरस्वती" },
        { label: "C", text: "Durga Mata", hindi: "माँ दुर्गा (आदिशक्ति)" },
        { label: "D", text: "Sita Mata", hindi: "माता सीता" },
      ],
      answer: 2, // Durga Mata
    },
    {
      id: 15,
      qNumber: 15,
      question: "Shri Ram ke kitne bhai the?",
      hindiQuestion: "भगवान श्री राम के कुल कितने भाई थे?",
      options: [
        { label: "A", text: "2", hindi: "2 भाई" },
        { label: "B", text: "3", hindi: "3 भाई (लक्ष्मण, भरत, शत्रुघ्न)" },
        { label: "C", text: "4", hindi: "4 भाई" },
        { label: "D", text: "5", hindi: "5 भाई" },
      ],
      answer: 1, // 3 brothers
    },
  ],
  4: [
    {
      id: 16,
      qNumber: 16,
      question: "Hanuman Ji ke pita ka naam kya tha?",
      hindiQuestion: "श्री हनुमान जी के पिता का क्या नाम था?",
      options: [
        { label: "A", text: "Kesari", hindi: "वानरराज केसरी" },
        { label: "B", text: "Dashrath", hindi: "महाराज दशरथ" },
        { label: "C", text: "Sugriv", hindi: "वानरराज सुग्रीव" },
        { label: "D", text: "Vibhishan", hindi: "विभीषण" },
      ],
      answer: 0, // Kesari
    },
    {
      id: 17,
      qNumber: 17,
      question: "Shri Krishna ka bachpan ka naam kya tha?",
      hindiQuestion: "भगवान श्री कृष्ण का बचपन का प्रिय नाम क्या था?",
      options: [
        { label: "A", text: "Kanha", hindi: "कान्हा (कन्हैया)" },
        { label: "B", text: "Mohan", hindi: "मोहन" },
        { label: "C", text: "Gopal", hindi: "गोपाल" },
        { label: "D", text: "Madhav", hindi: "माधव" },
      ],
      answer: 0, // Kanha
    },
    {
      id: 18,
      qNumber: 18,
      question: "Mahadev ka sabse priya mahina kaunsa mana jata hai?",
      hindiQuestion: "भगवान महादेव का सबसे प्रिय महीना कौनसा माना जाता है?",
      options: [
        { label: "A", text: "Kartik", hindi: "कार्तिक मास" },
        { label: "B", text: "Chaitra", hindi: "चैत्र मास" },
        { label: "C", text: "Sawan", hindi: "सावन (श्रावण मास)" },
        { label: "D", text: "Magh", hindi: "माघ मास" },
      ],
      answer: 2, // Sawan
    },
    {
      id: 19,
      qNumber: 19,
      question: "Mata Saraswati kis cheez ki Devi hain?",
      hindiQuestion: "माता सरस्वती किस चीज़ की अधिष्ठात्री देवी हैं?",
      options: [
        { label: "A", text: "Dhan", hindi: "धन और वैभव" },
        { label: "B", text: "Shakti", hindi: "शक्ति और पराक्रम" },
        { label: "C", text: "Vidya aur Gyan", hindi: "विद्या और ज्ञान" },
        { label: "D", text: "Kripa", hindi: "कृपा" },
      ],
      answer: 2, // Vidya aur Gyan
    },
    {
      id: 20,
      qNumber: 20,
      question: "Vishnu Ji ka vahan kya hai?",
      hindiQuestion: "भगवान श्री विष्णु का दिव्य वाहन क्या है?",
      options: [
        { label: "A", text: "Garud", hindi: "गरुड़ देव" },
        { label: "B", text: "Nandi", hindi: "नंदी बैल" },
        { label: "C", text: "Mushak", hindi: "मूषक (चूहा)" },
        { label: "D", text: "Mor", hindi: "मोर (मयूर)" },
      ],
      answer: 0, // Garud
    },
  ],
  5: [
    {
      id: 21,
      qNumber: 21,
      question: "Hanuman Ji ko aur kis naam se jana jata hai?",
      hindiQuestion: "हनुमान जी को और किस लोकप्रिय नाम से जाना जाता है?",
      options: [
        { label: "A", text: "Bajrangbali", hindi: "बजरंगबली" },
        { label: "B", text: "Madhav", hindi: "माधव" },
        { label: "C", text: "Narayan", hindi: "नारायण" },
        { label: "D", text: "Vasudev", hindi: "वासुदेव" },
      ],
      answer: 0, // Bajrangbali
    },
    {
      id: 22,
      qNumber: 22,
      question: "Shri Ram ki patni ka naam kya tha?",
      hindiQuestion: "भगवान श्री राम की धर्मपत्नी का क्या नाम था?",
      options: [
        { label: "A", text: "Radha", hindi: "राधा रानी" },
        { label: "B", text: "Sita", hindi: "माता सीता" },
        { label: "C", text: "Rukmini", hindi: "माता रुक्मिणी" },
        { label: "D", text: "Parvati", hindi: "माता पार्वती" },
      ],
      answer: 1, // Sita
    },
    {
      id: 23,
      qNumber: 23,
      question: "Dwarka kis Bhagwan se judi hui hai?",
      hindiQuestion: "पवित्र द्वारका नगरी किस भगवान से जुड़ी हुई है?",
      options: [
        { label: "A", text: "Shri Ram", hindi: "भगवान श्री राम" },
        { label: "B", text: "Hanuman Ji", hindi: "श्री हनुमान जी" },
        { label: "C", text: "Shri Krishna", hindi: "भगवान श्री कृष्ण" },
        { label: "D", text: "Shiv Ji", hindi: "भगवान शिव" },
      ],
      answer: 2, // Shri Krishna
    },
    {
      id: 24,
      qNumber: 24,
      question: "Shiv Ji ke vahan ka naam kya hai?",
      hindiQuestion: "भगवान शिव के परम प्रिय वाहन का क्या नाम है?",
      options: [
        { label: "A", text: "Garud", hindi: "गरुड़ देव" },
        { label: "B", text: "Mushak", hindi: "मूषक" },
        { label: "C", text: "Nandi", hindi: "नंदी बैल" },
        { label: "D", text: "Mor", hindi: "मोर" },
      ],
      answer: 2, // Nandi
    },
    {
      id: 25,
      qNumber: 25,
      question: '"Om Namah Shivaya" mantra kis Bhagwan ko samarpit hai?',
      hindiQuestion: '"ॐ नमः शिवाय" महामंत्र किस भगवान को समर्पित है?',
      options: [
        { label: "A", text: "Vishnu Ji", hindi: "भगवान श्री विष्णु" },
        { label: "B", text: "Ganesh Ji", hindi: "भगवान श्री गणेश" },
        { label: "C", text: "Shiv Ji", hindi: "भगवान महादेव (शिव जी)" },
        { label: "D", text: "Surya Dev", hindi: "भगवान सूर्य देव" },
      ],
      answer: 2, // Shiv Ji
    },
  ],
};

function GameEvents() {
  const [searchParams] = useSearchParams();
  const { redirectToStore, storeUrls, deviceType } = useAppStoreRedirect();

  // AppsFlyer OneLink (auto-routes iOS -> App Store, Android -> Play Store)
  const ONELINK_URL = "https://bhakti-bhav-referral.onelink.me/VOv8/vc1rvamj";

  const handleDownloadApp = () => {
    if (ONELINK_URL) {
      window.location.href = ONELINK_URL;
      return;
    }
    if (deviceType === "ios") {
      window.location.href = storeUrls.ios;
    } else {
      window.location.href = storeUrls.android;
    }
  };

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Set number determination (1 to 5)
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [questions, setQuestions] = useState([]);

  // Quiz progression state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // index 0..3
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Warning toast if user presses back
  const [showBackWarning, setShowBackWarning] = useState(false);
  const warningTimerRef = useRef(null);

  // Question transition animation state
  const [slideDirection, setSlideDirection] = useState("enter"); // 'enter' | 'exit'

  // 1. Initial Set Determination & Anti-Cheat Initialization
  useEffect(() => {
    // Check if user already finished quiz previously in this browser session
    const savedResult = sessionStorage.getItem("bb_quiz_result");
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setScore(parsed.score || 0);
        setCurrentSetNumber(parsed.setNumber || 1);
        setQuestions(QUESTION_SETS[parsed.setNumber || 1] || QUESTION_SETS[1]);
        setIsFinished(true);
        setShowSplash(false);
        return;
      } catch (e) {
        // Continue normally if parse fails
      }
    }

    // Check if user was mid-quiz (refresh during a question)
    const savedProgress = sessionStorage.getItem("bb_quiz_progress");
    if (savedProgress) {
      try {
        const prog = JSON.parse(savedProgress);
        const setNum = prog.setNumber || 1;
        setCurrentSetNumber(setNum);
        setQuestions(QUESTION_SETS[setNum] || QUESTION_SETS[1]);
        setCurrentIndex(prog.currentIndex || 0);
        setScore(prog.score || 0);
        setShowSplash(false);
        return;
      } catch (e) {
        // Continue normally if parse fails
      }
    }

    // Determine Set Number:
    // If URL contains `?set=1..5`, use it. Otherwise, generate a random set 1..5
    const urlSet = parseInt(searchParams.get("set"), 10);
    let chosenSet;
    if (urlSet && urlSet >= 1 && urlSet <= 5) {
      chosenSet = urlSet;
    } else {
      // Random set from 1 to 5 for new scans
      chosenSet = Math.floor(Math.random() * 5) + 1;
    }

    setCurrentSetNumber(chosenSet);
    setQuestions(QUESTION_SETS[chosenSet] || QUESTION_SETS[1]);

    // Save the chosen set immediately so refresh restores same set
    sessionStorage.setItem(
      "bb_quiz_progress",
      JSON.stringify({ setNumber: chosenSet, currentIndex: 0, score: 0 })
    );

    // Splash auto-dismiss after 1.8 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Remove global body padding-bottom (100px from index.css) while on this page
  useEffect(() => {
    const originalPadding = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "0px";
    return () => {
      document.body.style.paddingBottom = originalPadding;
    };
  }, []);

  // 2. Anti-Cheat: Prevent User from Pressing Browser / Android Back Button
  useEffect(() => {
    window.history.pushState({ page: "game_events_quiz" }, "");

    const handlePopState = () => {
      window.history.pushState({ page: "game_events_quiz" }, "");
      setShowBackWarning(true);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(() => {
        setShowBackWarning(false);
      }, 2500);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  // 3. Option Selection Handler with smooth transition
  const handleSelectOption = (optionIndex) => {
    if (isAnswerLocked) return;

    setIsAnswerLocked(true);
    setSelectedOption(optionIndex);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.answer;

    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    // After 850ms, start slide exit animation
    setTimeout(() => {
      setSlideDirection("exit");

      // After slide-out completes (220ms), change question and slide in
      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setSelectedOption(null);
          setIsAnswerLocked(false);
          setSlideDirection("enter");
          // Save progress so refresh stays on this question
          sessionStorage.setItem(
            "bb_quiz_progress",
            JSON.stringify({
              setNumber: currentSetNumber,
              currentIndex: nextIndex,
              score: newScore,
            })
          );
        } else {
          // Finished all questions — clear progress, save result
          sessionStorage.removeItem("bb_quiz_progress");
          setIsFinished(true);
          sessionStorage.setItem(
            "bb_quiz_result",
            JSON.stringify({
              score: newScore,
              total: questions.length,
              setNumber: currentSetNumber,
              timestamp: Date.now(),
            })
          );
        }
      }, 220);
    }, 850);
  };

  // ── Render 1: Splash Screen ──────────────────────────────────────────────
  if (showSplash) {
    return (
      <div className="game-events-wrapper flex items-center justify-center min-h-screen bg-[#FFF8F0] relative overflow-hidden font-sans select-none">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
          
          body {
            padding-bottom: 0px !important;
            margin: 0 !important;
            background-color: #FFF8F0 !important;
          }
          body::before {
            display: none !important;
          }

          .game-events-wrapper, .game-events-wrapper * {
            font-family: 'Outfit', 'Mukta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            letter-spacing: normal !important;
          }
        `}</style>
        {/* Top Decorative Bell */}
        <div className="absolute inset-0 top-0 w-full flex justify-center pointer-events-none">
          <div
            className="w-44 h-48 bg-contain bg-no-repeat bg-center transition-transform animate-bounce duration-1000"
            style={{
              backgroundImage:
                "url('https://bhaktibhav.app/img/bell-img.png')",
            }}
          />
        </div>

        {/* Ambient Warm Golden Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-orange-300/30 blur-3xl -z-10 animate-pulse" />

        {/* Centered Logo & Devotional Tagline */}
        <div className="flex flex-col items-center text-center z-10 px-6 mt-16 animate-fade-in">
          <img
            src="https://bhaktibhav.app/img/logo_splash.png"
            alt="Bhakti Bhav Logo"
            className="w-48 h-48 object-contain mb-4 drop-shadow-xl animate-pulse"
          />

          <div className="flex justify-center items-center px-8 py-3 bg-amber-100/80 rounded-2xl border border-amber-300 shadow-sm">
            <p className="text-2xl text-[#9A283D] font-black tracking-wide">
              धर्म एवं पौराणिक प्रश्नोत्तरी
            </p>
          </div>

          <p className="text-sm font-bold text-gray-500 mt-4 tracking-wider">
            हर दिन भक्ति • हर कदम शांति
          </p>

          <div className="mt-8 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#9A283D] rounded-full animate-ping" />
            <span className="text-sm text-[#9A283D] font-black">प्रश्नोत्तरी लोड हो रही है...</span>
          </div>
        </div>
      </div>
    );
  }

  // Current active question
  const currentQuestion = questions[currentIndex] || {};
  const progressPercent = questions.length
    ? ((currentIndex + (isAnswerLocked ? 1 : 0)) / questions.length) * 100
    : 0;

  // ── Render 2: Main Mobile Quiz View & Score View ────────────────────────
  return (
    <div className="game-events-wrapper" style={{ position: 'fixed', inset: 0, background: '#1F1113', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
      {/* Global style overrides + Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

        html, body {
          height: 100% !important;
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
          background: #1F1113 !important;
        }
        body::before {
          display: none !important;
        }

        .game-events-wrapper, .game-events-wrapper * {
          font-family: 'Outfit', 'Mukta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          letter-spacing: normal !important;
        }

        .font-devanagari-clean {
          font-family: 'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif !important;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(-35px) scale(0.95);
          }
        }
        @keyframes popCorrect {
          0% { transform: scale(1); }
          40% { transform: scale(1.035); }
          100% { transform: scale(1); }
        }
        @keyframes shakeWrong {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes shimmerGlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .anim-slide-enter {
          animation: slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-exit {
          animation: slideOutLeft 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .anim-pop {
          animation: popCorrect 0.4s ease-out forwards;
        }
        .anim-shake {
          animation: shakeWrong 0.42s ease-in-out forwards;
        }
        .anim-float {
          animation: floatGentle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile Container — fixed height, scrollable inner content */}
      <div style={{ width: '100%', maxWidth: '440px', height: '100%', background: 'linear-gradient(to bottom, #FFFDF9, #FFF9F2, #FFF4E6)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Anti-Cheat Back Warning Toast */}
        {showBackWarning && (
          <div className="fixed sm:absolute top-5 left-6 right-6 z-50 bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-3 rounded-2xl text-sm font-black text-center shadow-2xl border border-red-300/40 backdrop-blur-md anim-shake">
            ⚠️ पीछे जाना मना है! उत्तर बदला नहीं जा सकता।
          </div>
        )}

        {/* Ambient Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/50 to-orange-300/30 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-tr from-rose-200/40 to-amber-200/30 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* ── Top Header ────────────────────────────────────────────── */}
        <header className="px-4 pt-3 pb-2.5 bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-orange-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] via-[#b32b44] to-[#7a1f30] font-black text-xl leading-none tracking-tight">
                  भक्ति भाव
                </span>
                <span className="text-amber-500 text-xs">🕉️</span>
              </div>
              <span className="text-[11px] text-amber-900/70 font-bold tracking-wide mt-0.5">
                पौराणिक प्रश्नोत्तरी
              </span>
            </div>
          </div>

          {/* Dynamic Glowing Progress Tracker */}
          {!isFinished && questions.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
                  <span className="text-xs">🎯</span>
                  <span className="font-black text-amber-950 text-xs">
                    प्रश्न {currentIndex + 1} <span className="text-amber-600 font-bold">/ {questions.length}</span>
                  </span>
                </div>
                
                {/* Score Pill */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#9A283D] to-[#b32b44] text-white px-3 py-0.5 rounded-full shadow-sm text-xs font-black">
                  <span>🏆 अंक:</span>
                  <span className="text-amber-200 font-black text-xs">{score}</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden shadow-inner p-0.5 border border-orange-200 relative">
                <div
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-[#9A283D] h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Shimmer light effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full -translate-x-full animate-[shimmerGlow_2s_infinite]" />
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ── Center Content: Quiz or Result ────────────────────────── */}
        <main className="flex-1 px-3.5 sm:px-5 py-3 flex flex-col justify-between relative z-10 pb-6">
          {!isFinished ? (
            /* Active Question Card Container with Slide Animation */
            <div
              key={currentIndex}
              className={`flex flex-col justify-between flex-1 gap-3 sm:gap-4 ${
                slideDirection === "enter" ? "anim-slide-enter" : "anim-slide-exit"
              }`}
            >
              
              {/* Ultra-Modern Glassmorphic Question Box with High Legibility */}
              <div className="bg-white/95 backdrop-blur-xl rounded-[20px] p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(154,40,61,0.06)] border border-orange-100/90 relative overflow-hidden shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    <span>प्रश्न {currentIndex + 1}</span>
                  </span>
                  <span className="text-[11px] font-black text-amber-800/80 flex items-center gap-1">
                    <span>👇</span> सही उत्तर चुनें
                  </span>
                </div>

                {/* Primary Hinglish Question */}
                <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug tracking-tight mb-1">
                  {currentQuestion.question}
                </h2>

                {/* Devanagari Question Subtitle */}
                <div className="pt-1.5 border-t border-orange-100/80">
                  <p className="text-base sm:text-lg font-bold text-[#9A283D] font-devanagari-clean leading-relaxed">
                    {currentQuestion.hindiQuestion}
                  </p>
                </div>
              </div>

              {/* 3D Tactile Interactive Options */}
              <div className="flex flex-col gap-2.5 sm:gap-3 my-auto">
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.answer;

                  // Dynamic modern button state styles
                  let btnStyle = "bg-white text-gray-800 border-2 border-orange-100 shadow-[0_4px_0_#e5d7c8] hover:border-amber-400 active:border-b-2 active:translate-y-1";
                  let badgeStyle = "bg-gradient-to-br from-amber-100 to-orange-50 text-amber-950 border-amber-300 shadow-xs";
                  let animationClass = "";

                  if (isAnswerLocked) {
                    if (isCorrect) {
                      // Correct Pop
                      btnStyle = "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-950 border-2 border-emerald-500 shadow-[0_4px_0_#059669] ring-2 ring-emerald-400/30";
                      badgeStyle = "bg-emerald-600 text-white border-emerald-600 shadow-md";
                      animationClass = "anim-pop";
                    } else if (isSelected && !isCorrect) {
                      // Wrong Shake
                      btnStyle = "bg-gradient-to-r from-rose-50 to-red-50 text-rose-950 border-2 border-rose-500 shadow-[0_4px_0_#e11d48] ring-2 ring-rose-400/30";
                      badgeStyle = "bg-rose-600 text-white border-rose-600 shadow-md";
                      animationClass = "anim-shake";
                    } else {
                      // Unselected Options when locked
                      btnStyle = "bg-gray-50/60 text-gray-400 border-2 border-gray-200/60 opacity-40 shadow-none";
                      badgeStyle = "bg-gray-100 text-gray-400 border-gray-200";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerLocked}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left py-2.5 px-3.5 sm:py-3.5 sm:px-4 rounded-xl flex items-center justify-between transition-all duration-200 select-none cursor-pointer ${btnStyle} ${animationClass}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Option Letter Pill */}
                        <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm sm:text-base transition-transform duration-200 shrink-0 ${badgeStyle}`}>
                          {opt.label}
                        </span>

                        {/* Option Labels */}
                        <div className="flex flex-col">
                          <span className="text-base font-black leading-tight tracking-tight">
                            {opt.text}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 font-devanagari-clean font-bold mt-0.5">
                            {opt.hindi}
                          </span>
                        </div>
                      </div>

                      {/* Right Feedback Indicator Icon */}
                      {isAnswerLocked && (
                        <div className="shrink-0 ml-2">
                          {isCorrect && (
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-base shadow-md animate-bounce">
                              ✓
                            </div>
                          )}
                          {isSelected && !isCorrect && (
                            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-md">
                              ✕
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Guidance & Micro-interaction info */}
              <div className="text-center py-1 shrink-0">
                {isAnswerLocked ? (
                  <div className="inline-flex items-center gap-2 bg-white/95 border border-orange-200 px-4 py-1.5 rounded-full shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#9A283D] animate-ping" />
                    <span className="text-xs sm:text-sm text-[#9A283D] font-black tracking-wide">
                      अगला प्रश्न आ रहा है...
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] sm:text-xs text-gray-400 font-bold tracking-wide">
                    🔒 उत्तर चुनने के बाद पुनः बदला नहीं जा सकता
                  </p>
                )}
              </div>

            </div>
          ) : (
            /* ── Render 3: Result Screen (Hinglish) ─────────────────── */
            <div className="flex flex-col items-center text-center py-6 pb-10 anim-slide-enter">

              {/* Trophy with glow */}
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl animate-pulse" />
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 p-1.5 shadow-[0_10px_30px_rgba(245,158,11,0.3)] relative anim-float">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl shadow-inner">
                    {score >= 4 ? "🏆" : score >= 3 ? "🌟" : "📿"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-2xl drop-shadow">
                    {score === 5 ? "✨" : "🚩"}
                  </span>
                </div>
              </div>

              {/* Title Badge — Hinglish */}
              <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300/80 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full mb-3 shadow-xs">
                {score === 5
                  ? "🌟 Perfect Score — Sab Sahi!"
                  : score >= 4
                  ? "📿 Bahut Accha — Almost Perfect!"
                  : score >= 3
                  ? "🕉️ Theek Hai — Aur Seekhein!"
                  : "🌺 Keep Trying — Bhakti Karo!"}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">
                Quiz Khatam! 🎉
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mb-5 font-semibold">
                Aapka Result — Dekho kitna score mila:
              </p>

              {/* Score Card */}
              <div className="w-full bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_16px_40px_rgba(154,40,61,0.1)] border-2 border-[#9A283D]/20 mb-5 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#9A283D]/5 rounded-full blur-xl" />
                <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-xl" />

                <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest block mb-1">
                  Aapka Total Score
                </span>

                <div className="flex items-baseline justify-center gap-1.5 my-2">
                  <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9A283D] to-[#d63854] tracking-tight">
                    {score}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-gray-300">
                    / {questions.length}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-600 text-xl font-black">{score}</span>
                    <span className="text-xs text-gray-400 font-bold">Sahi ✅</span>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-rose-500 text-xl font-black">{questions.length - score}</span>
                    <span className="text-xs text-gray-400 font-bold">Galat ❌</span>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600 text-xl font-black">{Math.round((score / questions.length) * 100)}%</span>
                    <span className="text-xs text-gray-400 font-bold">Accuracy</span>
                  </div>
                </div>
              </div>

              {/* Feedback Message — Hinglish */}
              <div className="bg-gradient-to-r from-amber-50/95 to-orange-50/95 border border-amber-200/90 rounded-2xl p-4 mb-5 text-sm text-amber-950 font-bold leading-relaxed w-full shadow-xs text-left">
                {score === 5 && (
                  <span>🚩 <strong>Waah! Kamaal!</strong> Aapne saare 5 sawaal sahi kiye! Bhagwan ki kripa aap par bani rahe. 🙏</span>
                )}
                {score === 4 && (
                  <span>👏 <strong>Bahut Badhiya!</strong> 5 mein se 4 sahi — aapka dharm gyan kaafi accha hai! Keep it up!</span>
                )}
                {score === 3 && (
                  <span>👍 <strong>Accha Kiya!</strong> 5 mein se 3 sahi. Thoda aur seekhein — Bhakti Bhav app par katha aur mantra padhe!</span>
                )}
                {score <= 2 && (
                  <span>🙏 <strong>Koi baat nahi!</strong> Aaj se roz thoda seekho. Bhakti Bhav app par panchang, mantra aur kathayen padho!</span>
                )}
              </div>

              {/* Download CTA */}
              <button
                type="button"
                onClick={handleDownloadApp}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9A283D] via-[#b32b44] to-[#7a1f30] text-white font-black text-base sm:text-lg shadow-[0_8px_25px_rgba(154,40,61,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2.5 mb-3 cursor-pointer"
              >
                <span>📲</span>
                <span>Bhakti Bhav App Download Karo</span>
                <span className="text-xl">→</span>
              </button>

              <p className="text-xs text-gray-400 font-bold">
                Panchang • Aarti • Vrat Katha • Naam Jaap • Kundli
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default GameEvents;
