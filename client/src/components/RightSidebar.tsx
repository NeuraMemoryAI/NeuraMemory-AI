import React from 'react';
import styles from './Sidebar.module.css';


const RightSidebar = () => (
  <aside className="w-full h-full bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-800" style={{ maxWidth: '460px', minWidth: '340px', marginLeft: '20px' }}>
    {/* Professional Heading */}
    <div className="w-full flex flex-col items-start mb-8">
      <h2 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2">
        <span className="inline-block w-2 h-6 rounded bg-blue-500"></span>
        Gemini 2.5 Pro
      </h2>
      <p className="text-base text-gray-400 font-medium">Your AI workspace assistant</p>
    </div>
    {/* Feature Chips - Responsive Grid Layout */}
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Create image</button>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Explore cricket</button>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Create music</button>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Help me learn</button>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Write anything</button>
      <button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-medium border border-gray-800 transition text-left">Boost my day</button>
    </div>
    {/* Elegant Input Area at the bottom */}
    <div className="w-full bg-neutral-900 rounded-2xl flex items-center gap-2 px-2 py-2 mt-auto shadow border border-gray-800">
      <textarea
        className="flex-1 bg-transparent text-white rounded-lg px-5 py-2 text-base outline-none border-none focus:ring-2 focus:ring-blue-500 transition min-w-0 min-h-[32px] max-h-32 resize-y placeholder:text-xs placeholder:leading-4"
        placeholder="Enter a prompt for Gemini"
        rows={1}
        style={{lineHeight: '1.5', overflowY: 'auto'}}
      />
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 flex items-center justify-center transition shadow" style={{width: '36px', height: '36px', minWidth: '36px'}} aria-label="Send">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M12 5l-6 6M12 5l6 6" />
        </svg>
      </button>
    </div>
  </aside>
);

export default RightSidebar;