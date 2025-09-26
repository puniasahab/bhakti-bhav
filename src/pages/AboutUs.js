import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div 
      className="bg-cover bg-top bg-no-repeat min-h-screen w-full text-white"
      style={{ 
        backgroundImage: "url('/img/home_bg.png')",
        fontFamily: "'KrutiDev', sans-serif"
      }}
    >
      {/* Header with Back Button */}
      <header className="p-4">
        <div className="container mx-auto hd_bg rounded-xl">
          <div className="flex justify-between items-center px-4 py-6">
            <div className="flex items-center">
              <button 
                onClick={handleBack}
                className="mr-4 p-2 rounded-full bg-[#610419] text-white hover:bg-[#7a0028] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-eng font-bold theme_text" style={{fontSize: '20px'}}>About Us</h1>
            </div>
            {/* <Link to="/" className="rupees_icon"> */}
              <img 
                src="/img/logo.png" 
                alt="Logo" 
                className="max-w-full h-auto" 
                style={{width: '100px', height: '22px'}} 
              />
            {/* </Link> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="container mx-auto">
          <div className="bg-[#FFFAF4] rounded-xl p-6 md:p-8 shadow-md">
            <div className="text-[#610419] font-eng">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">About Us</h1>
              
              <div className="space-y-6 text-sm md:text-base leading-relaxed">
                <section className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold mb-6 theme_text">Hindu Devotionals</h2>
                  
                  <div className="space-y-6 text-gray-700 max-w-4xl mx-auto">
                    <p className="text-lg md:text-xl leading-relaxed">
                      Discover the ultimate devotional companion with the <span className="font-semibold theme_text">Bhakti Bhav app</span>. Immerse yourself in a rich collection of prayers, bhajans, and spiritual content tailored for devotees of Hinduism.
                    </p>
                    
                    <p className="text-lg md:text-xl leading-relaxed">
                      Stay connected with your faith, access daily prayers, and find peace and tranquility with our user-friendly mobile app.
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="mt-8 flex justify-center">
                    <div className="w-24 h-1 bg-gradient-to-r from-[#610419] to-[#F5A418] rounded-full"></div>
                  </div>

                  {/* Features Section */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="theme_bg text-white rounded-xl p-6 shadow-lg">
                      <div className="text-3xl mb-3">🙏</div>
                      <h3 className="text-lg font-semibold mb-2">Daily Prayers</h3>
                      <p className="text-sm opacity-90">Access a comprehensive collection of daily prayers and mantras</p>
                    </div>
                    
                    <div className="theme_bg text-white rounded-xl p-6 shadow-lg">
                      <div className="text-3xl mb-3">🎵</div>
                      <h3 className="text-lg font-semibold mb-2">Bhajans</h3>
                      <p className="text-sm opacity-90">Listen to beautiful devotional songs and bhajans</p>
                    </div>
                    
                    <div className="theme_bg text-white rounded-xl p-6 shadow-lg">
                      <div className="text-3xl mb-3">📿</div>
                      <h3 className="text-lg font-semibold mb-2">Spiritual Content</h3>
                      <p className="text-sm opacity-90">Explore rich spiritual content and teachings</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Back to Home Button */}
              <div className="mt-8 text-center">
                <button 
                  onClick={handleBack}
                  className="bg-[#610419] text-white px-8 py-3 rounded-[10px] font-eng text-lg hover:bg-[#7a0028] transition-colors flex items-center mx-auto"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-2xl px-4">
          <div className="flex flex-col md:flex-row md:space-x-6 theme_text text-center font-eng mb-3 md:mb-0 space-y-2 md:space-y-0">
            <Link to="/termsAndConditions" className="theme-text text-lg text-[#610419] hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              Terms & Conditions
            </Link>
            <Link to="/privacyPolicy" className="theme-text text-lg text-[#610419] hover:underline"   style={{ fontFamily: 'Calibri, sans-serif' }}>
              Privacy Policy
            </Link>
            <Link to="/aboutUs" className="theme-text text-lg text-[#610419] hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              About us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;