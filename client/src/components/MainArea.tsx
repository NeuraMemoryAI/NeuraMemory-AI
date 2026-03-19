import { useState, useRef, useEffect } from 'react';






const infoCards = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="#e0e7ef"/><path d="M8 12h8M12 8v8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: 'Summarized project meeting notes',
    desc: 'Last updated by you',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="#e0e7ef"/><path d="M12 7v10M7 12h10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: 'Follow up on client email',
    desc: 'Assigned to you',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="#e0e7ef"/><path d="M16 8l-8 8M8 8l8 8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    title: 'Research on AI ethics organized',
    desc: 'Due today at 12:00 PM',
  },
];


const MainArea = () => (
  <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black">
    <section className="w-full mx-auto flex flex-col items-center px-4 py-20" style={{ maxWidth: '900px' }}>
      {/* Card Container */}
      <div className="w-full bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl shadow-2xl border border-gray-800 p-16 flex flex-col items-center gap-14">
        {/* Header Section */}
        <div className="w-full flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-blue-400 tracking-tight mb-1">Welcome to NeuraMemoryAI</h2>
          <p className="text-base text-gray-300 text-center max-w-lg mb-2">Your intelligent assistant for managing, searching, and exploring your knowledge and memories.</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center tracking-tight">How can I help you today?</h1>
        {/* Chat Input Area */}
        <div className="w-full flex items-end gap-2 bg-neutral-900 rounded-2xl border border-gray-800 px-4 py-3 shadow-lg">
          <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-lg w-10 h-10 mr-2 transition" title="Select folder">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
            </svg>
          </button>
          <textarea
            className="flex-1 bg-transparent text-white rounded-lg px-4 py-3 outline-none border-none focus:ring-2 focus:ring-blue-500 resize-none text-base min-h-[48px] max-h-32 transition-all duration-200"
            placeholder="Type your message..."
            rows={1}
            style={{minWidth: 0}}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-7 py-3 text-base font-bold transition shadow-lg ml-2">Send</button>
        </div>
        {/* Info Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {infoCards.map((card, i) => (
            <div key={i} className="flex flex-col items-start bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl border border-gray-800 shadow p-4 min-w-0 h-full">
              <div className="mb-2">{card.icon}</div>
              <div className="font-semibold text-white text-sm mb-1 line-clamp-2">{card.title}</div>
              <div className="text-xs text-gray-400">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default MainArea;
