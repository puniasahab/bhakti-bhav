import React from "react";

function Splash() {
  return (
   <div className="flex items-center justify-center h-screen relative">
      <div className="absolute inset-0 top-0 md:w-[15%] md:left-[35%]">
        <div className="w-[90%] h-[45%] md:w-[100%] md:h-[30%] 
        bg-[url('https://bhaktibhav.app/img/bell-img.png')]
         bg-contain bg-no-repeat"/>
      </div>

      <div className="flex flex-col items-center text-center  z-10">
        <img
          // src="./img/logo_splash.png"
          src="https://bhaktibhav.app/img/logo_splash.png"
          alt="Logo"
          className="w-[192px] h-[184px] mb-4"
        />
        <div className="flex justify-center items-center theme_text font-hindi bg-[url('./img/border_bg.png')] bg-no-repeat splash_bg pb-3">
          <p className="p-6 text-3xl ">fgUnh dySaMj] iapkax frfFk] <br/> R;ksgkj] ozr dFkk] pkyhlk]<br/> vkjrh laxzg] ea=] tkiekyk</p> 
        </div>
      </div>
    </div>
  );
}

export default Splash;
