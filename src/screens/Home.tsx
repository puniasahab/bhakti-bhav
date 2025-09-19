import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../components/firebase";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
// import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
// @ts-ignore
import { CalendarFold, BookOpenText, Facebook, Instagram } from 'lucide-react';
import { 
  logo, 
  rupeesIcon, 
  bell, 
  hdUserIcon, 
  hdShareIcon, 
  hdWhatsappIcon, 
  hdAdobeIcon, 
  icon1, 
  icon2, 
  icon3, 
  icon4, 
  icon5, 
  pujaBgs, 
  whatssappIcon 
} from '../assets/images';

// Import Swiper styles
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';
import { setAuthour, setThoughts, setTodayThought } from './homeSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { todayThought, authour } = useAppSelector(state => state.home);
  useEffect(() => {
    // Load external scripts if needed
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lucide@latest';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchThought = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "thought"));
        // console.log("Fetched thoughts:", querySnapshot);
        const thoughts = querySnapshot.docs.map(doc => doc.data());
        // console.log("Fetched thoughts:", thoughts);
        dispatch(setThoughts(thoughts));
        const today = new Date().toISOString().split("T")[0];
        const index = thoughts.findIndex((thought: any) => thought.date === today);
        if(index >= 0) {
          console.log("Today's thought found:", thoughts[index]);
          dispatch(setTodayThought(thoughts[index].thought));
          dispatch(setAuthour(thoughts[index].author));
        }
        else {
          console.log("No thought found for today, setting default.");
          dispatch(setTodayThought("उपदेश देना सरल है] पर उपाय बताना कठिनA"));
          dispatch(setAuthour("~ रवीन्द्रनाथ टैगोर"));
        }
      }
      catch (error) {
        console.error("Error fetching thought:", error);
      }
    }

    fetchThought();
  }, [])

  // const navigate = useNavigate();

  return (
    <div 
      className="bg-[url('../img/home_bg.png')] bg-cover bg-top bg-no-repeat min-h-screen w-full font-kruti text-white"
    >
      {/* Header */}
      <header className="p-4">
  <div className="container mx-auto hd_bg rounded-xl">
    <div className="flex justify-between items-center px-4 py-6">
      <h1 className="text-lg font-bold">
        <Link to="/" className="rupees_icon">
          <img src={logo} alt="Logo" width="108" height="27" className="max-w-full h-auto" />
        </Link>
      </h1>
      <div className="flex items-center md:space-x-6 space-x-4 text-xl">
        <Link to="#" className="rupees_icon">
          <img src={rupeesIcon} alt="Rupees" width="22" height="20" className="max-w-full h-auto" />
        </Link>
        <Link to="#" className="notification_icon">
          <img src={bell} alt="Notifications" width="24" height="21" className="max-w-full h-auto" />
        </Link>
        <Link to="#" className="icon_24">
          <img src={hdUserIcon} alt="User" width="22" height="21" className="max-w-full h-auto" />
        </Link>
      </div>
    </div>
  </div>
</header>
<main className="px-4">
  <div className="container mx-auto ">
    <section className="bg-[#FFFAF4] rounded-xl text-sm space-y-1 shadow-md">
      <div className="relative w-full h-[30vh] md:h-[60vh] overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={false}
          className="w-full h-full"
        >
          <SwiperSlide className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/img/slide-1.jpg')" }}>
            {/* <h1 className="theme-text text-3xl font-kruti">vk'kk cgqr egku gS</h1> */}
          </SwiperSlide>
          <SwiperSlide className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/img/slide-2.jpg')" }}>
            {/* <h1 className="text-white text-2xl font-kruti">ekuoh; thou esa vfHkHkkouk gS</h1> */}
          </SwiperSlide>
          {/* <SwiperSlide className="h-[30vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/img/slide-3.jpg')" }}>
            <h1 className="theme-text text-2xl font-kruti">izse ,oa Hkkouk thou ds pkjks dh nkfguh gS</h1>
          </SwiperSlide> */}
        </Swiper>
      </div>
    </section>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Link to="/rashifal" className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
          <img src={icon1} alt="" width="36" height="36" className="md:mr-3" />
          <p className="md:text-2xl text-lg font-normal">आज का राशिफल</p>
        </div>
      </Link>
      <Link to="#" className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
        <div className="mx-auto flex md:flex-row flex-col items-center space-y-3 md:space-y-0">
          <img src={icon5} alt="" width="36" height="36" className="md:mr-3" />
          <p className="md:text-2xl text-lg font-normal">पंचांग</p>
        </div>
      </Link>
    </div>
    <div className="grid grid-cols-3 md:gap-4 gap-2 mt-6 text-center font-medium">
      <Link to="/hindiCalendar" className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
          <img src={icon2} alt="" width="36" height="36" className="md:mr-3" />
          <p className="md:text-2xl text-lg font-normal">हिंदी कैलेंडर</p>
        </div>
      </Link>
      <Link to="/katha" className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
          <img src={icon3} alt="" width="36" height="36" className="md:mr-3" />
          <p className="md:text-2xl text-lg font-normal">व्रत कथा</p>
        </div>
      </Link>
      <Link to="/jaapMala" className="theme_bg bg-white rounded-xl shadow md:p-6 p-3 text-center hover:bg-yellow-50 transition w-auto flex">
        <div className="mx-auto flex flex-col items-center space-y-3 md:space-y-0">
          <img src={icon4} alt="" width="36" height="36" className="md:mr-3" />
          <p className="md:text-2xl text-lg font-normal"> जापमाला </p>
        </div>
      </Link>
    </div>
    <div className="mt-6">
      <Link to="#" className="relative theme_bg hd_bg rounded-xl flex items-center justify-center rounded-xl font-semibold overflow-hidden px-12 py-6 hover:scale-105 transition-all duration-300 ease-in-out">
        <span className="absolute left-[30px] top-[50%] -translate-y-1/2 bg-[url('/img/icon_7.png')] bg-no-repeat bg-cover w-[70px] h-[70px]"></span>
        <span className="absolute right-[30px] top-[45%] -translate-y-1/2 bg-[url('/img/icon_8.png')] bg-no-repeat bg-cover w-[46px] h-[46px]"></span>
        <span className="relative z-10 flex items-center">
          <span className="text-3xl font-normal">वॉलपेपर</span>
        </span>
      </Link>
    </div>
    <div className="mt-6 flex gap-4 flex-row">
      <div className="basis-[60%] md:basis-[70%] bg-[#FFD35A] theme_text rounded-xl p-3 text-center text-sm shadow-md relative">
        <div className="text-center custom_bg mb-6 flex flex-col md:space-y-6">
          <h2 className="mb-2 text-2xl">आज का सुविचार</h2>
          <p className="md:text-3xl font-bold font-kruti text-lg ">{todayThought}</p>
          <p className="mt-1 text-lg">{authour}</p>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Link to="#"><img src={hdShareIcon} alt="Share" width="24" height="24" className="max-w-full h-auto mx-auto" /></Link>
          <Link to="#"><img src={hdWhatsappIcon} alt="WhatsApp" width="24" height="24" className="max-w-full h-auto mx-auto" /></Link>
          <Link to="#"><img src={hdAdobeIcon} alt="Adobe" width="24" height="24" className="max-w-full h-auto mx-auto" /></Link>
        </div>
      </div>
      <div className="md:basis-[40%] basis-[40%] flex flex-col justify-between items-center md:p-4 theme_text">
        <span className="font-semibold md:text-3xl text-2xl">पूजा करें!</span>
        <div className="my-4"><img src={pujaBgs} alt="Puja" width="150" height="120" className="max-w-full h-auto" /></div>
        <Link to="/pooja" className="relative bg-[#6d001f] bg-[url('/img/btn_icon_1.png'), url('/img/btn_icon_1.png')] text-white text-center px-4 py-2 rounded-full font-eng md:text-lg text-sm md:w-[70%] w-full hover:scale-105 transition-all duration-300 ease-in-out">
          {/* <span className="absolute left-2 top-1/2 -translate-y-1/2 bg-[url('/img/btn_icon_1.png')] bg-no-repeat bg-contain w-[14px] h-[14px]"></span> */}
          {/* <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[url('/img/btn_icon_2.png')] bg-no-repeat bg-contain w-[14px] h-[14px]"></span> */}
          Click here
        </Link>
      </div>
    </div>
  </div>
</main>
<footer className="mt-6 py-4">
  <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
    <div className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
      <Link to="/termsAndConditions" className="theme-text text-lg hover:underline">Terms & Conditions</Link>
      <Link to="/privacyPolicy" className="theme-text text-lg hover:underline">Privacy Policy</Link>
      <Link to="/aboutUs" className="theme-text text-lg hover:underline">About us</Link>
    </div>
    <div className="flex space-x-3">
      <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
        <Facebook className="w-5 h-5" />
      </Link>
      <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
        <Instagram className="w-5 h-5" />
      </Link>
      <Link to="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5a001d] text-white text-lg hover:bg-[#7a0028]">
        <img src={whatssappIcon} alt="WhatsApp" width="20" height="20" className="max-w-full h-auto" />
      </Link>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;
