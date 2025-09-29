import React from "react";

function Loader({ size = 200, logo = "./img/logo_splash.png" }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-50">
      <style>
        {`
          @keyframes bh-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="absolute rounded-full border-t-4 border-[#9a283d] border-opacity-60"
          style={{
            width: size,
            height: size,
            borderRight: "4px solid transparent",
            borderBottom: "4px solid transparent",
            animation: "bh-rotate 2s linear infinite",
          }}
        ></div>

        <img
          src={logo}
          alt="Logo"
          className="object-contain max-w-[100%]"
          style={{ width: size / 2 }}
        />
      </div>
 
    </div>
  );
}

export default Loader;
