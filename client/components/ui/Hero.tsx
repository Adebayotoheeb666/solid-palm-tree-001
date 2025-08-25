import React from "react";

/**
 * Hero section that takes up 100% of the viewport height, centers content, and is responsive.
 */
const Hero: React.FC = () => {
  return (
    <section className="flex items-center justify-center min-h-screen w-full bg-gradient-to-b from-white to-gray-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Pocket Calculyst</h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">
          Your all-in-one solution for quick, powerful calculations and analytics.
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;
