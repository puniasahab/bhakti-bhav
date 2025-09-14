import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div 
      className="bg-cover bg-top bg-no-repeat min-h-screen w-full text-white"
      style={{ 
        backgroundImage: "url('/img/page_bg.jpg')",
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
              <h1 className="text-lg font-bold theme_text" style={{fontSize: '20px'}}>Terms & Conditions</h1>
            </div>
            {/* <Link to="/" className="rupees_icon"> */}
              <img 
                src="/img/logo.png" 
                alt="Logo" 
                style={{width: '100px', height: '22px'}}
                className="max-w-full h-auto" 
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
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Terms & Conditions</h1>
              
              <div className="space-y-6 text-sm md:text-base leading-relaxed">
                <section>
                  <h2 className="text-xl md:text-2xl font-bold mb-4 theme_text">TERMS SPECIFIC TO THE APP</h2>
                  
                  <h3 className="text-lg md:text-xl font-semibold mb-3 theme_text">Fees & Subscriptions</h3>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Bhakti Bhav may charge a subscription fee to Users in consideration for the use of certain aspects of the Bhakti Bhav App. Bhakti Bhav reserves the right to revisit and revise its subscription fees and amounts at its sole discretion. The Services shall be available to users with different modes of subscription. Bhakti Bhav reserves its right to modify the different modes of subscription at its sole discretion. Bhakti Bhav shall advise users of any changes to any modes of subscription thereon after.
                    </p>
                    
                    <p>
                      The subscription period for the Services you purchase shall commence on the date on which the Services are made available to you (the "Subscription Term").
                    </p>
                    
                    <p>
                      Notwithstanding anything in these Terms of Service, upon a termination of this Agreement or a cancellation of any Service on the App, including any subscription, the Services shall only be cancelled at the end of the duration for which the Service has been paid for.
                    </p>
                    
                    <p>
                      If the Services are terminated prior to the end of a duration that has been paid, the Services, including any Bhakti Bhav features, shall remain available until the end of the duration paid for. You will have the right to access and use the Services for the remaining period of the duration in which you cancel your Account. A user can still access Bhakti Bhav App for the duration of the remaining period.
                    </p>
                    
                    <p>
                      Upon the expiration of the Subscription Term or earlier cancellation of your Account as described in these Terms, your rights to access and use the Services shall terminate and your Account shall be deactivated, except to the extent expressly provided otherwise in these Terms.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-semibold mb-4 theme_text">Penalties</h3>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>
                      A user is liable for no penalty post the cancellation of subscription. If the application cancels a subscription of a user due to a suspicious activity, the user would get an email to showcase the reasons for the same.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-semibold mb-4 theme_text">Contact Us</h3>
                  
                  <div className="space-y-2 text-gray-700">
                    <p>
                      If you have any questions about this Terms & Conditions, You can contact us:
                    </p>
                    <p>
                      <strong>By email:</strong> bhaktibhav.app@gmail.com
                    </p>
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
            <Link to="/termsAndConditions" className="theme-text text-lg text-white hover:underline"  style={{ fontFamily: 'Calibri, sans-serif' }}>
              Terms & Conditions
            </Link>
            <Link to="/privacyPolicy" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }} >
              Privacy Policy
            </Link>
            <Link to="/aboutUs" className="theme-text text-lg text-white hover:underline" style={{ fontFamily: 'Calibri, sans-serif' }}>
              About us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;