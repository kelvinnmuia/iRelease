import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const platformVersion = "1.0.0";

  return (
    <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center px-4 md:px-6 py-7">
      <div className="text-center text-xs md:text-sm text-gray-600/90">
        © {currentYear} Kenya Revenue Authority • Powered by BooniSolutions 
      </div>
    </footer>
  );
}