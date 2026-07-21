import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Avatar } from './Shared/Avatar';
import { Zap, Search, Layers } from 'lucide-react';
import { getInstantAppId } from '../db/client';

interface LayoutProps {
  galleryComponent: React.ReactNode;
  feedComponent: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ galleryComponent, feedComponent }) => {
  const store = useStore();
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(store.searchQuery);

  // Sync header search input state with global store
  useEffect(() => {
    setSearchVal(store.searchQuery);
  }, [store.searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.setSearchQuery(searchVal);
  };

  const hasCustomDB = !!getInstantAppId();

  return (
    <div className="min-h-screen bg-brand-surface-muted flex flex-col font-saans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-brand-surface-muted/95 backdrop-blur sticky top-0 z-30 px-brand-4 py-3.5">
        <div className="max-w-[1440px] mx-auto flex justify-between md:grid md:grid-cols-3 items-center w-full">
          {/* Logo */}
          <div className="flex items-center gap-brand-2 justify-start select-none">
            {/* Styled Layers Icon */}
            <div className="bg-gradient-to-tr from-neutral-900 to-neutral-800 p-2 rounded-brand-xs border border-neutral-800 text-white shrink-0 shadow-lg flex items-center justify-center transition-transform hover:scale-105 duration-brand-fast">
              <Layers className="w-4 h-4 text-white" />
            </div>
            
            <div className="hidden sm:flex flex-col justify-center">
              <h1 className="text-brand-sm font-extrabold tracking-[0.15em] text-white uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-neutral-400">
                Stacksy
              </h1>
            </div>
          </div>

          {/* Search bar in the center */}
          <div className="hidden md:flex justify-center w-full">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative">
              <div className="relative flex items-center bg-neutral-900/40 hover:bg-neutral-900/60 border border-neutral-850/60 hover:border-neutral-800 rounded-full pl-4 pr-1 focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-800/85 transition-all duration-300">
                <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search high-res photos..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-transparent border-0 text-xs focus:ring-0 focus:outline-none py-2 px-3 text-white placeholder-neutral-500"
                />
                {searchVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchVal('');
                      store.setSearchQuery('');
                    }}
                    className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 transition-colors font-bold uppercase tracking-wider shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4 justify-end shrink-0">
            {/* Status & Identity info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-brand-xs font-bold text-white leading-none">{store.username}</span>
              <span className="text-[9px] text-neutral-500 font-bold mt-0.5 flex items-center gap-1 select-none">
                <span className={`w-1.5 h-1.5 rounded-full ${hasCustomDB ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]'}`}></span>
                {hasCustomDB ? 'Production Sync' : 'Sandbox DB'}
              </span>
            </div>

            {/* Profile Avatar */}
            <Avatar username={store.username} color={store.userColor} size="md" />

            {/* Live Feed Drawer Toggle */}
            <button
              onClick={() => setIsFeedOpen(!isFeedOpen)}
              className={`text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/40 border border-neutral-900/40 hover:border-neutral-800/60 transition-all duration-300 focus-visible-ring relative shrink-0 ${isFeedOpen ? 'text-white bg-neutral-800/40 border-neutral-800/60' : ''
                }`}
              title="Live Activity Feed"
            >
              <Zap className="w-4 h-4" />
              {/* Glowing notification green dot */}
              <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-brand-4 py-brand-4 flex gap-brand-4 relative overflow-hidden">
        {/* Gallery Pane (Left/Center) */}
        <section className="flex-1 flex flex-col min-w-0">
          {galleryComponent}
        </section>

        {/* Live Feed Drawer overlay (Unified for Mobile & Desktop) */}
        {isFeedOpen && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsFeedOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] h-full bg-brand-surface-muted border-l border-neutral-900/80 shadow-2xl flex flex-col z-50 animate-slide-in">
              <div className="p-4 border-b border-neutral-900 flex items-center justify-between bg-neutral-950 shrink-0">
                <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 select-none">
                  <Zap className="w-4 h-4 text-emerald-500 shadow-[0_0_8px_#10b981]" /> Live Activity Feed
                </h2>
                <button
                  onClick={() => setIsFeedOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-850 transition-colors"
                  aria-label="Close activity feed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 bg-neutral-950/10">
                {feedComponent}
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

// Helper for close button in Mobile drawer
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
