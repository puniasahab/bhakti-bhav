// import React from "react";

// function BhaktiLoader({ message = "भक्ति भाव", size = 160 }) {
//   return React.createElement(
//     "div",
//     { className: "fixed inset-0 flex items-center justify-center bg-transparent z-50" },
//     [
//       // 🔥 Keyframes
//       React.createElement("style", { key: "style" }, `
//         @keyframes bh-flicker {
//           0% { transform: scaleY(0.98) translateY(0); opacity: 0.95; }
//           30% { transform: scaleY(1.06) translateY(-2%); opacity: 1; }
//           60% { transform: scaleY(0.98) translateY(0); opacity: 0.95; }
//           100% { transform: scaleY(1.00) translateY(-1%); opacity: 0.98; }
//         }
//         @keyframes bh-rotate {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `),
 
//       React.createElement(
//         "div",
//         { key: "wrapper", className: "flex flex-col items-center gap-3 relative" },
//         [ 
//           React.createElement("div", {
//             key: "halo",
//             className: "absolute rounded-full blur-md",
//             style: {
//               width: size,
//               height: size,
//               background:
//                 "radial-gradient(circle at 30% 30%, rgba(250,200,120,0.25), transparent 20%), radial-gradient(circle at 70% 70%, rgba(154,40,61,0.06), transparent 35%)",
//               animation: "bh-rotate 6s linear infinite",
//             },
//           }),
 
//           React.createElement(
//             "div",
//             {
//               key: "diya",
//               className: "relative flex flex-col items-center justify-end",
//               style: { width: size * 0.6, height: size * 0.45 },
//             },
//             [ 
//               React.createElement("div", {
//                 key: "flame",
//                 className: "relative z-10",
//                 style: {
//                   width: "18%",
//                   height: "40%",
//                   background:
//                     "radial-gradient(circle at 50% 35%, #fff3b8 0%, #ffd36b 18%, #ff8f3b 55%, #9a1c2d 100%)",
//                   borderRadius: "55% 45% 40% 60% / 30% 30% 70% 70%",
//                   transformOrigin: "bottom center",
//                   animation: "bh-flicker 1100ms infinite ease-in-out",
//                   boxShadow:
//                     "0 6px 18px rgba(255,140,50,0.18), inset 0 -8px 18px rgba(255,200,100,0.12)",
//                   marginBottom: "6%",
//                 },
//               }),
 
//               React.createElement("div", {
//                 key: "bowl",
//                 className: "relative z-0",
//                 style: {
//                   width: "100%",
//                   height: "18%",
//                   background: "linear-gradient(180deg, #ffd9a8, #9a283d)",
//                   borderRadius: "8px 8px 40% 40% / 50% 50% 55% 55%",
//                   transform: "translateY(28%)",
//                   boxShadow:
//                     "0 10px 24px rgba(0,0,0,0.12), inset 0 -6px 12px rgba(0,0,0,0.06)",
//                 },
//               }),
//             ]
//           ),
 
//           React.createElement(
//             "div",
//             {
//               key: "text",
//               className:
//                 "text-[#7a2232] font-bold text-lg text-center font-[Hind]",
//             },
//             message
//           ),
//         ]
//       ),
//     ]
//   );
// }

// export default BhaktiLoader;


import React from "react";

function Loader({ message = "भक्ति भाव", size = 200, logo = "./img/logo_splash.png" }) {
  return React.createElement(
    "div",
    { className: "fixed inset-0 flex items-center justify-center bg-transparent z-50" },
    [
      // 🔥 Keyframes
      React.createElement("style", { key: "style" }, `
        @keyframes bh-flicker {
          0% { transform: scaleY(0.98) translateY(0); opacity: 0.95; }
          30% { transform: scaleY(1.06) translateY(-2%); opacity: 1; }
          60% { transform: scaleY(0.98) translateY(0); opacity: 0.95; }
          100% { transform: scaleY(1.00) translateY(-1%); opacity: 0.98; }
        }
        @keyframes bh-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `),

      React.createElement(
        "div",
        { key: "wrapper", className: "flex flex-col items-center gap-3 relative" },
        
        [
          React.createElement("div", {
            key: "halo",
            className: "absolute rounded-full blur-md",
            style: {
              width: size,
              height: size,
              background:
                "radial-gradient(circle at 30% 30%, rgba(250,200,120,0.25), transparent 20%), radial-gradient(circle at 70% 70%, rgba(154,40,61,0.06), transparent 35%)",
              animation: "bh-rotate 6s linear infinite",
            },
          }),

          
          // 🪔 Diya with Flame & Bowl
          React.createElement(
            "div",
            {
              key: "diya",
              className: "relative flex flex-col items-center justify-end",
              style: { width: size * 0.6, height: size * 0.45 },
            },
            
            [
              // 🔥 Flame
              React.createElement("div", {
                key: "flame",
                className: "relative z-10",
                style: {
                  width: "18%",
                  height: "40%",
                  background:
                    "radial-gradient(circle at 50% 35%, #fff3b8 0%, #ffd36b 18%, #ff8f3b 55%, #9a1c2d 100%)",
                  borderRadius: "55% 45% 40% 60% / 30% 30% 70% 70%",
                  transformOrigin: "bottom center",
                  animation: "bh-flicker 1100ms infinite ease-in-out",
                  boxShadow:
                    "0 6px 18px rgba(255,140,50,0.18), inset 0 -8px 18px rgba(255,200,100,0.12)",
                  marginBottom: "6%",
                },
              }),

              

              // 🪔 Bowl + Logo
              React.createElement(
                "div",
                {
                  key: "bowl",
                  className: "relative z-0 flex items-center justify-center",
                  style: {
                    width: "100%",
                    height: "30%",
                    background: "linear-gradient(180deg, #ffd9a8, #9a283d)",
                    borderRadius: "8px 8px 50% 50% / 50% 50% 60% 60%",
                    transform: "translateY(28%)",
                    boxShadow:
                      "0 10px 24px rgba(0,0,0,0.12), inset 0 -6px 12px rgba(0,0,0,0.06)",
                  },
                },
               
              ),
            ]
          ),

          //  [
          //         React.createElement("img", {
          //           key: "logo",
          //           src: logo,
          //           alt: "Logo",
          //           className: " object-contain",
          //         }),
          //       ],
 
          React.createElement(
            "div",
            {
              key: "text",
              className:
                "text-[#7a2232] font-bold text-2xl text-center font-[Hind] animate-pulse mt-6",
            },
            message
          ),
        ]
      ),
    ]
  );
}

export default Loader;
