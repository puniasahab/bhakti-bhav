import React from 'react';

/**
 * Page Loader Component - Lightweight loader for lazy-loaded pages
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A283D] mx-auto"></div>
      <p className="mt-4 text-[#9A283D] font-hindi text-lg">लोड हो रहा है</p>
      <p className="text-sm text-gray-500 font-eng mt-1">Loading...</p>
    </div>
  </div>
);

export default PageLoader;
