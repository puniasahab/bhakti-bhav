import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AppEvents1 = () => {
  const [selectedPlan, setSelectedPlan] = useState(2);
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalContent = '';
    
    if (viewportMeta) {
      originalContent = viewportMeta.getAttribute('content');
      // Force mobile browser to treat page as 1024px wide and auto-zoom out
      viewportMeta.setAttribute('content', 'width=1024');
    }

    return () => {
      if (viewportMeta && originalContent) {
        viewportMeta.setAttribute('content', originalContent);
      }
    };
  }, []);

  return (
    <div className="bg-[#fff8f0] min-h-screen font-sans text-gray-800 min-w-[1024px]">
      
      {/* 1. Navbar */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[#9A283D] font-bold text-4xl leading-tight">भक्ति भाव</span>
            <span className="text-base text-gray-500 leading-none mt-1">हर दिन भक्ति, हर कदम शांति</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-xl font-bold text-gray-600">
          <a href="#" className="text-[#9A283D] border-b-2 border-[#9A283D] pb-1">होम</a>
          <a href="#plans" className="hover:text-[#9A283D] transition-colors">प्लान</a>
          <a href="#download" className="hover:text-[#9A283D] transition-colors">डाउनलोड</a>
          <a href="#" className="hover:text-[#9A283D] transition-colors">सहायता</a>
        </div>

        <a href="#download" className="bg-[#590f1d] text-white text-xl font-bold px-8 py-3 rounded-lg shadow-md flex items-center gap-2 hover:bg-[#360810] transition-colors whitespace-nowrap">
          ऐप डाउनलोड करें
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </a>
      </nav>

      {/* 2. Hero Section (Two Columns, Tight Spacing) */}
      <section className="px-12 pt-16 pb-10 relative overflow-hidden bg-gradient-to-br from-white via-[#fff8f0] to-[#f9ede1]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 bg-cover bg-center pointer-events-none" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kashi_Vishwanath_Temple_Varanasi.jpg/800px-Kashi_Vishwanath_Temple_Varanasi.jpg)' }}></div>
        
        <div className="max-w-[1100px] mx-auto flex flex-row items-center justify-center gap-10 relative z-10">
          
          {/* Left Column (Text & Buttons) */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-base px-4 py-2 rounded-md mb-6 font-bold border border-yellow-200">
              <span className="text-yellow-500 text-2xl leading-none">❖</span> आपकी आध्यात्मिक यात्रा का साथी
            </div>
            
            <h1 className="text-6xl font-extrabold text-gray-900 leading-[1.1] mb-10">
              हर व्रत, पूजा और त्योहार की <br/>
              <span className="text-[#9A283D]">पूरी जानकारी</span> <br/>
              एक ही जगह
            </h1>
            
            <div className="flex gap-4 mb-12">
              <a href="#plans" className="bg-[#7a1f30] hover:bg-[#590f1d] text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-colors text-2xl whitespace-nowrap">
                अपनी यात्रा शुरू करें <span className="text-3xl leading-none">→</span>
              </a>
              <button className="bg-white hover:bg-gray-50 text-[#7a1f30] border-2 border-[#7a1f30] font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-colors text-2xl whitespace-nowrap">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                वीडियो देखें
              </button>
            </div>

            <div className="flex items-center gap-6 text-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 max-w-max">
              <div className="flex flex-col items-center">
                <span className="text-[#9A283D] font-bold text-3xl flex items-center gap-2"><span className="text-3xl">👥</span> 50K+</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">भक्तों का विश्वास</span>
              </div>
              <div className="w-[1px] h-12 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500 font-bold text-3xl flex items-center gap-2"><span className="text-3xl">🛡️</span> 100%</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">सुरक्षित भुगतान</span>
              </div>
              <div className="w-[1px] h-12 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500 font-bold text-3xl flex items-center gap-2"><span className="text-3xl">⭐</span> 4.8/5</span>
                <span className="text-base text-gray-500 font-bold whitespace-nowrap">Play Store</span>
              </div>
            </div>
          </div>

          {/* Right Column (Phone Mockup) */}
          <div className="flex-none w-[280px]">
            <div className="relative w-full shadow-2xl rounded-[3rem] border-[10px] border-gray-900 bg-white overflow-hidden aspect-[9/19.5]">
              <img src="/app-mockup.png" alt="App Screen" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features (5 Columns, Large Text) */}
      <section className="py-8 px-12 bg-white relative border-y border-gray-200 shadow-sm">
        <div className="max-w-[1100px] mx-auto flex flex-row justify-between gap-6">
          {[
            { icon: "📅", name: "पंचांग" },
            { icon: "🏺", name: "व्रत और त्योहार" },
            { icon: "📿", name: "नाम जाप" },
            { icon: "🪔", name: "आरती" },
            { icon: "📖", name: "कथा" },
          ].map((feature, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
              <span className="text-7xl mb-4">{feature.icon}</span>
              <span className="text-2xl font-extrabold text-gray-800 text-center whitespace-nowrap">{feature.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Plans (Side by Side) */}
      <section id="plans" className="py-20 px-12 bg-[#fff8f0]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-5xl font-extrabold text-center text-[#9A283D] mb-16 relative flex items-center justify-center">
            <span className="bg-[#fff8f0] px-8 z-10">अपने लिए सही प्लान चुनें</span>
            <div className="absolute left-0 right-0 h-[2px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="flex flex-row justify-center gap-12">
            
            {/* Plan 1 */}
            <div 
              onClick={() => setSelectedPlan(1)}
              className={`flex-1 max-w-[420px] bg-white rounded-[2rem] p-10 shadow-sm relative pt-16 cursor-pointer transition-all ${selectedPlan === 1 ? 'border-[4px] border-[#7a1f30] transform -translate-y-4 shadow-xl' : 'border-2 border-gray-200'}`}
            >
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-xl font-bold px-4 py-2 rounded">16% बचत</div>
              
              <h3 className="text-3xl font-bold text-[#9A283D] mb-4 text-center">3 महीने का प्लान</h3>
              
              <div className="flex justify-center items-end gap-3 mb-6">
                <span className={`text-7xl font-extrabold ${selectedPlan === 1 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹251</span>
                <span className="text-3xl text-gray-400 line-through mb-2">₹299</span>
              </div>
              
              <button className={`w-full font-bold py-5 rounded-xl transition-colors text-3xl mt-4 ${selectedPlan === 1 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-2 border-[#7a1f30]'}`}>
                {selectedPlan === 1 ? 'चयनित प्लान' : 'प्लान चुनें'}
              </button>
            </div>

            {/* Plan 2 (Popular) */}
            <div 
              onClick={() => setSelectedPlan(2)}
              className={`flex-1 max-w-[420px] bg-white rounded-[2rem] p-10 relative pt-16 cursor-pointer transition-all ${selectedPlan === 2 ? 'border-[4px] border-[#7a1f30] transform -translate-y-4 shadow-xl' : 'border-2 border-gray-200 shadow-sm'}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xl font-bold px-8 py-3 rounded-full shadow-md uppercase tracking-wide whitespace-nowrap">सबसे लोकप्रिय</div>
              <div className="absolute top-6 right-6 bg-orange-100 text-orange-800 text-xl font-bold px-4 py-2 rounded">28% बचत</div>
              
              <h3 className="text-3xl font-bold text-[#9A283D] mb-4 text-center mt-2">1 साल का प्लान</h3>
              
              <div className="flex justify-center items-end gap-3 mb-6">
                <span className={`text-7xl font-extrabold ${selectedPlan === 2 ? 'text-[#9A283D]' : 'text-gray-900'}`}>₹501</span>
                <span className="text-3xl text-gray-400 line-through mb-2">₹699</span>
              </div>
              
              <button className={`w-full font-bold py-5 rounded-xl transition-colors text-3xl mt-4 ${selectedPlan === 2 ? 'bg-[#590f1d] hover:bg-[#360810] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-[#7a1f30] border-2 border-[#7a1f30]'}`}>
                {selectedPlan === 2 ? 'चयनित प्लान' : 'प्लान चुनें'}
              </button>
            </div>

          </div>

          {/* Guarantees */}
          <div className="mt-16 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-row justify-center gap-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🛡️</span> 7 दिन की मनी बैक</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔒</span> 100% सुरक्षित भुगतान</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🔓</span> कभी भी रद्द करें</div>
            <div className="w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-3 text-xl font-bold text-gray-700 whitespace-nowrap"><span className="text-orange-500 text-3xl">🎧</span> त्वरित सहायता</div>
          </div>
        </div>
      </section>

      {/* 5. How it Works (Horizontal Steps) */}
      <section className="py-20 px-12 bg-white border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-5xl font-extrabold text-center text-[#9A283D] mb-20 relative flex items-center justify-center">
            <span className="bg-white px-8 z-10">कैसे काम करता है?</span>
            <div className="absolute left-0 right-0 h-[2px] bg-red-200 z-0"></div>
          </h2>
          
          <div className="flex flex-row items-start justify-between relative max-w-5xl mx-auto">
            {/* Dashed line connecting steps */}
            <div className="absolute top-12 left-20 right-20 h-1 border-t-4 border-dashed border-gray-300 z-0"></div>

            <div className="flex flex-col items-center text-center relative z-10 w-48">
              <div className="w-24 h-24 bg-white rounded-full border-[4px] border-[#9A283D] flex items-center justify-center text-4xl mb-6 shadow-md">💳</div>
              <h4 className="font-extrabold text-[#9A283D] text-3xl">चुनें</h4>
              <p className="text-xl text-gray-500 mt-2 font-bold whitespace-nowrap">प्लान चुनें</p>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10 w-48">
              <div className="w-24 h-24 bg-white rounded-full border-[4px] border-[#9A283D] flex items-center justify-center text-4xl mb-6 shadow-md">🛡️</div>
              <h4 className="font-extrabold text-[#9A283D] text-3xl whitespace-nowrap">भुगतान करें</h4>
              <p className="text-xl text-gray-500 mt-2 font-bold whitespace-nowrap">सुरक्षित भुगतान करें</p>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10 w-48">
              <div className="w-24 h-24 bg-white rounded-full border-[4px] border-[#9A283D] flex items-center justify-center text-4xl mb-6 shadow-md">⬇️</div>
              <h4 className="font-extrabold text-[#9A283D] text-3xl whitespace-nowrap">डाउनलोड करें</h4>
              <p className="text-xl text-gray-500 mt-2 font-bold whitespace-nowrap">ऐप डाउनलोड करें</p>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10 w-48">
              <div className="w-24 h-24 bg-white rounded-full border-[4px] border-[#9A283D] flex items-center justify-center text-4xl mb-6 shadow-md">👤</div>
              <h4 className="font-extrabold text-[#9A283D] text-3xl whitespace-nowrap">लॉगिन करें</h4>
              <p className="text-xl text-gray-500 mt-2 font-bold whitespace-nowrap">और शुरू करें भक्ति</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (3 Cards Horizontal) */}
      <section className="py-20 px-12 bg-[#fff8f0]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-5xl font-extrabold text-center text-[#9A283D] mb-16">भक्तों के अनुभव</h2>
          
          <div className="flex flex-row justify-center gap-8">
            
            {/* Card 1 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"भक्ति भाव ने मेरी रोजमर्रा की भक्ति को बहुत आसान बना दिया है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Neha+Sharma&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">नेहा शर्मा</h5>
                  <p className="text-lg text-gray-500 font-bold">दिल्ली</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"नाम जाप फीचर बहुत ही अद्भुत है। 108 नाम करने की आदत बन गई है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Rohit+Verma&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">रोहित वर्मा</h5>
                  <p className="text-lg text-gray-500 font-bold">जयपुर</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="text-yellow-400 text-3xl mb-6">★★★★★</div>
              <p className="text-2xl text-gray-700 italic mb-8 font-medium leading-relaxed">"बहुत उपयोगी ऐप है। आरती, मंत्र और कथा सब कुछ एक ही जगह पर मिलता है।"</p>
              <div className="flex items-center gap-4">
                <img src="https://ui-avatars.com/api/?name=Anjali+Patel&background=random" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h5 className="text-xl font-bold text-[#9A283D]">अंजलि पटेल</h5>
                  <p className="text-lg text-gray-500 font-bold">अहमदाबाद</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer / Final CTA */}
      <section id="download" className="bg-[#590f1d] text-white py-20 px-12 relative overflow-hidden">
        <div className="max-w-[1100px] mx-auto flex flex-row items-center justify-between relative z-10 gap-10">
          
          <div className="flex items-center gap-8">
            <div className="text-[100px] drop-shadow-[0_0_20px_rgba(252,211,77,0.8)] leading-none">🪔</div>
            <h2 className="text-5xl font-extrabold leading-tight">आज ही जुड़ें और अपनी <br/>आध्यात्मिक यात्रा को बनाएं <br/>और भी खास</h2>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="text-2xl text-gray-300 mb-4 font-bold">ऐप डाउनलोड करें</p>
            <div className="flex gap-6">
              <a href="#" className="hover:-translate-y-1 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-16" />
              </a>
              <a href="#" className="hover:-translate-y-1 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-16" />
              </a>
            </div>
            <button className="mt-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-5 px-12 rounded-full shadow-lg shadow-yellow-500/30 flex items-center gap-3 hover:scale-105 transition-transform text-3xl whitespace-nowrap">
              ऐप डाउनलोड करें <span className="text-4xl leading-none">→</span>
            </button>
          </div>
          
        </div>
      </section>

      {/* Bottom Legal */}
      <footer className="bg-white text-gray-500 text-xl py-8 px-12 flex flex-row items-center justify-between border-t border-gray-200">
        <span className="font-bold">© 2026 भक्ति भाव. सर्वाधिकार सुरक्षित.</span>
        <div className="flex gap-8 font-bold">
          <Link to="/privacyPolicy" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">गोपनीयता नीति</Link>
          <span className="text-gray-300">|</span>
          <Link to="/termsAndConditions" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">नियम और शर्तें</Link>
          <span className="text-gray-300">|</span>
          <Link to="/contact-us" className="hover:text-[#9A283D] transition-colors whitespace-nowrap">संपर्क करें</Link>
        </div>
      </footer>
      
    </div>
  );
};

export default AppEvents1;
