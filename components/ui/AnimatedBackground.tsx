import React from "react";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        style={{ top: "20%", left: "10%", animationDelay: "0s" }}
      ></div>
      <div
        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        style={{ top: "40%", left: "80%", animationDelay: "1s" }}
      ></div>
      <div
        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        style={{ top: "60%", left: "30%", animationDelay: "2s" }}
      ></div>
      <div
        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        style={{ top: "80%", left: "70%", animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
        style={{ top: "30%", left: "50%", animationDelay: "0.5s" }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
