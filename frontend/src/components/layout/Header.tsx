import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 border-b border-slate-100">
      
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input 
          type="text" 
          placeholder="Tìm kiếm đơn hàng, thiết bị..." 
          className="w-full pl-10 pr-4 py-2 bg-surface-container-highest/50 border-none focus:ring-2 focus:ring-primary rounded-full text-sm outline-none" 
        />
      </div>
      
      {/* Icons & Avatar */}
      <div className="flex items-center gap-6">
        <button className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3MmsL31_8m9jxfGVLVdwmkp__GfzUOxEbgmBUTemI3R2T6uTjwQ4pk0kzjb2Tk_wLcu_U4cYY4KWRE1mj4pPtVRqSpM7aqVKlOWYj-u89Ej0yxmGG8wAILQvW5kIux7sRwhgxBoM7LPSQas1eDIOAmik-EuMX29f4Cs8CcHCWhbDcKda5X_jUFij69A7yAE5d_BZssM9NBmZ9hVnR9OyIjSpkRSb7n3lkOcvPhnMcWum4zdt1AL0ALEArzaIHzFCY91yFWgjpdvQ" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
      
    </header>
  );
}