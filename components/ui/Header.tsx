"use client";

export function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-2 border-purple-600 px-6 py-3 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Farstate Logo" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Farstate Ai</h1>
            <p className="text-slate-400 text-xs">
              Activity Tracker & Ai Cast Generator
            </p>
          </div>
        </div>
        <div className="bg-purple-600 w-2 h-2 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
