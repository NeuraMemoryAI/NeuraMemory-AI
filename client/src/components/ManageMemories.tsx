import React from 'react';

const ManageMemories = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <div className="w-[85vw] max-w-7xl h-[75vh] bg-neutral-900 rounded-3xl shadow-2xl border border-gray-800 p-16 flex flex-col gap-12 mx-auto justify-center items-center">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-4xl font-extrabold text-white">Manage Memories</h1>
          <p className="text-gray-300 text-lg md:text-base text-center md:text-left max-w-xl">
            Here you can view, edit, and organize your saved memories. More features coming soon!
          </p>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="bg-[#232b36] rounded-2xl p-14 w-full max-w-5xl min-h-[400px] flex flex-col justify-center relative shadow-lg border border-gray-700">
            <button className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-lg px-5 py-2 text-sm font-semibold transition shadow">
              Delete
            </button>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-200 text-lg">No memories to display yet.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageMemories;
