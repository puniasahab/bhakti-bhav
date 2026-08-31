import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppEvents = () => {
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // 'quarterly' | 'yearly'

  return (
    <div className="bg-[#fff8f0] min-h-screen font-sans text-gray-800 pb-16">
      
      {/* 1. Navbar */}
      <nav className="flex justify-between items-center px-4 py-2 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[#9A283D] font-bold text-lg leading-tight">भक्ति भाव</span>
            <span className="text-[10px] text-gray-500 leading-none mt-1">हर दिन भक्ति, हर कदम शांति</span>
          </div>
        </div>
        <a href="#download" className="bg-[#9A283D] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-1 transition-transform active:scale-95">
          ऐप डाउनलोड करें
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </a>
      </nav>

      {/* 2. Hero Section (Compressed) */}
      <section className="px-4 pt-6 pb-0 relative bg-gradient-to-b from-white to-[#fff8f0] overflow-hidden border-b border-gray-200">
        <div className="max-w-md mx-auto z-10 relative flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[9px] px-2 py-1 rounded-full mb-3 font-semibold">
            <span className="text-yellow-500">❖</span> आपकी आध्यात्मिक यात्रा का साथी
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">
            हर व्रत, पूजा और त्योहार की <br/>
            <span className="text-[#9A283D]">पूरी जानकारी</span> एक ही जगह
          </h1>
          <p className="text-xs text-gray-600 mb-5 font-medium leading-relaxed">
            सही समय, सही विधि, मंत्र, कथा और आरती के साथ अपनी आध्यात्मिक यात्रा को बनाएं सरल।
          </p>
          
          <div className="flex w-full px-2 mb-6">
            <a href="#plans" className="w-full bg-[#9A283D] text-white text-center text-sm font-bold py-3 rounded-lg shadow-md flex justify-center items-center gap-2 active:scale-95 transition-transform">
              शुरू करें <span className="text-md">→</span>
            </a>
          </div>

          <div className="flex justify-around items-center w-full bg-white py-2 px-3 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-[#9A283D] font-bold text-sm">👥 50K+</span>
              <span className="text-[9px] text-gray-500">भक्तों का विश्वास</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-green-600 font-bold text-sm">🛡️ 100%</span>
              <span className="text-[9px] text-gray-500">सुरक्षित</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-yellow-500 font-bold text-sm">⭐ 4.8</span>
              <span className="text-[9px] text-gray-500">Play Store</span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative mx-auto w-52 mt-6 shadow-2xl rounded-[2rem] border-[6px] border-gray-900 bg-white overflow-hidden z-20 aspect-[9/19.5]">
            <img src="/app-mockup.png" alt="App Screen" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 3. Features (Horizontal Scroll) */}
      <section className="py-6 bg-white relative border-b border-gray-100">
        <h2 className="text-sm font-bold text-center text-gray-400 mb-3 uppercase tracking-wider">प्रमुख सुविधाएं</h2>
        <div className="flex overflow-x-auto gap-3 px-4 pb-2 snap-x scrollbar-hide max-w-md mx-auto">
          {[
            { icon: "📅", name: "पंचांग" },
            { icon: "🏺", name: "व्रत-त्योहार" },
            { icon: "📿", name: "नाम जाप" },
            { icon: "🪔", name: "आरती" },
            { icon: "📖", name: "कथा" },
            { icon: "🕉️", name: "मंत्र" },
          ].map((feature, i) => (
            <div key={i} className="min-w-[70px] shrink-0 flex flex-col items-center justify-center py-2 px-1 border border-gray-100 rounded-xl shadow-sm bg-gray-50 snap-center">
              <span className="text-xl mb-1">{feature.icon}</span>
              <span className="text-[10px] font-bold text-gray-800 text-center leading-tight">{feature.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Plans (Toggle Based) */}
      <section id="plans" className="py-8 px-4 bg-[#fff8f0]">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center text-[#9A283D] mb-5">अपने लिए सही प्लान चुनें</h2>
          
          {/* Toggle Switch */}
          <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm mx-auto w-3/4 mb-6">
            <button 
              onClick={() => setSelectedPlan('quarterly')}
              className={`flex-1 text-xs font-bold py-2 rounded-full transition-colors ${selectedPlan === 'quarterly' ? 'bg-[#9A283D] text-white shadow-md' : 'text-gray-500'}`}
            >
              3 महीने
            </button>
            <button 
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 text-xs font-bold py-2 rounded-full transition-colors relative ${selectedPlan === 'yearly' ? 'bg-[#9A283D] text-white shadow-md' : 'text-gray-500'}`}
            >
              1 साल
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-[8px] text-white px-1.5 py-0.5 rounded-full">POPULAR</span>
            </button>
          </div>
          
          {/* Render Active Plan Only */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#9A283D] shadow-lg relative pt-8">
            <div className="absolute -top-3 right-4 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-orange-200">
              {selectedPlan === 'yearly' ? '28% बचत' : '16% बचत'}
            </div>
            
            <h3 className="text-sm font-bold text-gray-500 mb-1 text-center">
              {selectedPlan === 'yearly' ? '1 साल का प्रीमियम प्लान' : '3 महीने का प्रीमियम प्लान'}
            </h3>
            
            <div className="flex justify-center items-end gap-2 mb-4">
              <span className="text-4xl font-extrabold text-[#9A283D]">
                {selectedPlan === 'yearly' ? '₹501' : '₹251'}
              </span>
              <span className="text-xs text-gray-400 line-through mb-1">
                {selectedPlan === 'yearly' ? '₹699' : '₹299'}
              </span>
            </div>
            
            <ul className="text-xs text-gray-700 space-y-2 mb-6 px-2">
              <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">✓</span> सभी प्रीमियम कंटेंट</li>
              <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">✓</span> स्मार्ट रिमाइंडर</li>
              <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">✓</span> व्रत और पूजा गाइड</li>
              <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">✓</span> 108 नाम जप काउंटर</li>
              {selectedPlan === 'yearly' && (
                <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">✓</span> जाप माला फ्री (30 दिन)</li>
              )}
            </ul>
            
            <button className="w-full bg-[#9A283D] text-white text-sm font-bold py-2.5 rounded-lg shadow-md active:bg-[#7a1f30] transition-colors">
              प्लान चुनें
            </button>
          </div>

          {/* Compact Guarantees */}
          <div className="mt-5 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600"><span className="text-[#9A283D]">🛡️</span> 7 दिन मनी बैक</div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600"><span className="text-[#9A283D]">🔒</span> 100% सुरक्षित</div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600"><span className="text-[#9A283D]">🔓</span> कभी भी रद्द करें</div>
          </div>
        </div>
      </section>

      {/* 5. How it Works (2x2 Grid) */}
      <section className="py-8 px-4 bg-white border-t border-gray-100">
        <h2 className="text-xl font-bold text-center text-[#9A283D] mb-6">कैसे काम करता है?</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-10 h-10 mb-2 rounded-full bg-orange-50 text-[#9A283D] flex items-center justify-center text-xl">💳</div>
            <h4 className="font-bold text-[#9A283D] text-xs">1. चुनें</h4>
            <p className="text-[10px] text-gray-500 mt-1">अपना पसंदीदा प्लान चुनें</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-10 h-10 mb-2 rounded-full bg-orange-50 text-[#9A283D] flex items-center justify-center text-xl">🛡️</div>
            <h4 className="font-bold text-[#9A283D] text-xs">2. भुगतान करें</h4>
            <p className="text-[10px] text-gray-500 mt-1">सुरक्षित तरीके से भुगतान करें</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-10 h-10 mb-2 rounded-full bg-orange-50 text-[#9A283D] flex items-center justify-center text-xl">⬇️</div>
            <h4 className="font-bold text-[#9A283D] text-xs">3. डाउनलोड करें</h4>
            <p className="text-[10px] text-gray-500 mt-1">ऐप स्टोर से डाउनलोड करें</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-10 h-10 mb-2 rounded-full bg-orange-50 text-[#9A283D] flex items-center justify-center text-xl">👤</div>
            <h4 className="font-bold text-[#9A283D] text-xs">4. लॉगिन करें</h4>
            <p className="text-[10px] text-gray-500 mt-1">और अपनी यात्रा शुरू करें</p>
          </div>
          
        </div>
      </section>

      {/* 6. Testimonials (Tighter) */}
      <section className="py-8 bg-[#fff8f0]">
        <h2 className="text-xl font-bold text-center text-[#9A283D] mb-5">भक्तों के अनुभव</h2>
        
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x max-w-md mx-auto scrollbar-hide">
          <div className="min-w-[240px] w-[240px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 snap-center">
            <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
            <p className="text-xs text-gray-700 italic mb-4">"भक्ति भाव ने मेरी रोजमर्रा की भक्ति को बहुत आसान बना दिया है।"</p>
            <div className="flex items-center gap-2">
              <img src="https://ui-avatars.com/api/?name=Neha+Sharma" alt="User" className="w-8 h-8 rounded-full" />
              <div>
                <h5 className="text-[11px] font-bold text-[#9A283D]">नेहा शर्मा</h5>
                <p className="text-[9px] text-gray-500">दिल्ली</p>
              </div>
            </div>
          </div>
          
          <div className="min-w-[240px] w-[240px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 snap-center">
            <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
            <p className="text-xs text-gray-700 italic mb-4">"नाम जाप फीचर बहुत ही अद्भुत है। 108 नाम करने की आदत बन गई है।"</p>
            <div className="flex items-center gap-2">
              <img src="https://ui-avatars.com/api/?name=Rohit+Verma" alt="User" className="w-8 h-8 rounded-full" />
              <div>
                <h5 className="text-[11px] font-bold text-[#9A283D]">रोहित वर्मा</h5>
                <p className="text-[9px] text-gray-500">जयपुर</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer / Final CTA */}
      <section id="download" className="bg-[#590f1d] text-white py-10 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-5 leading-tight">आज ही जुड़ें और अपनी <br/>आध्यात्मिक यात्रा को बनाएं खास</h2>
          
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-2.5 px-6 rounded-full shadow-lg mb-6 mx-auto flex items-center gap-2 text-xs active:scale-95">
            ऐप डाउनलोड करें <span className="text-sm">→</span>
          </button>
          
          <div className="flex justify-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
          </div>
        </div>
      </section>

      {/* Bottom Legal */}
      <footer className="bg-[#360810] text-gray-400 text-[9px] py-4 px-4 text-center">
        <div className="flex justify-center gap-3 mb-2 font-medium">
          <Link to="/privacyPolicy">गोपनीयता नीति</Link>
          <span>|</span>
          <Link to="/termsAndConditions">नियम और शर्तें</Link>
          <span>|</span>
          <Link to="/contact-us">संपर्क करें</Link>
        </div>
        <span>© 2026 भक्ति भाव. सर्वाधिकार सुरक्षित.</span>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

    </div>
  );
};

export default AppEvents;
