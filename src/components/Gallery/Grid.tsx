import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { useUnsplash } from '../../hooks/useUnsplash';
import { Card } from './Card';
import { Search, Info, Compass, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Nature', 'Architecture', 'Minimal', 'Technology'];

export const Grid: React.FC = () => {
  const store = useStore();
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isUsingFallback,
  } = useUnsplash();

  const [searchVal, setSearchVal] = useState(store.searchQuery);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Sync internal search state with global store
  useEffect(() => {
    setSearchVal(store.searchQuery);
  }, [store.searchQuery]);

  // Infinite scroll intersection observer setup
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.setSearchQuery(searchVal);
  };

  const handleCategorySelect = (cat: string) => {
    store.setCategory(cat);
  };

  const photos = data?.pages.flatMap((page) => page) || [];

  return (
    <div className="space-y-brand-4 flex flex-col h-full">
      {/* Search & Category Filter Ribbon */}
      <div className="flex flex-col gap-brand-3 md:flex-row md:items-center justify-center">
        {/* Categories */}
        <div className="flex items-center justify-center gap-brand-2 overflow-x-auto pb-1 scrollbar-none mx-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`text-brand-xs px-brand-3 py-brand-2 rounded-brand-md border transition-all duration-brand-instant flex-shrink-0 focus-visible-ring ${store.category === cat
                ? 'bg-white text-brand-text-primary border-white'
                : 'bg-brand-surface-base hover:bg-neutral-800 text-brand-text-tertiary hover:text-white border-neutral-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input (Mobile Only) */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full md:hidden">
          <input
            type="text"
            placeholder="Search high-res photos..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-brand-surface-base border border-neutral-800 hover:border-neutral-700 text-white rounded-brand-xs p-brand-2 pl-9 pr-16 text-brand-sm focus:outline-none focus:border-white focus:ring-0 transition-colors"
          />
          <Search className="w-4 h-4 text-brand-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white hover:bg-neutral-200 text-brand-text-primary px-brand-2 py-1 rounded-[6px] text-[10px] font-extrabold transition-colors uppercase"
          >
            Find
          </button>
        </form>
      </div>

      {/* Fallback Photo Banner Notification */}
      {isUsingFallback && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-brand-3 rounded-brand-xs text-[11px] flex items-start gap-brand-2 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Using Fallback Gallery Mode:</span> Displaying a hand-curated selection of 24 minimal, nature, architecture, and technology images. To search and paginate all 5M+ Unsplash photos in real-time, configure your own free <span className="font-bold underline">Unsplash Access Key</span> in settings (gear icon at bottom right).
          </div>
        </div>
      )}

      {/* Main Photo Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Double outer ring pulsing */}
            <span className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping"></span>
            <span className="w-8 h-8 rounded-full border-t-2 border-r-2 border-white animate-spin"></span>
          </div>
          <p className="text-xs text-neutral-400 font-medium tracking-widest uppercase animate-pulse select-none">
            Fetching visuals...
          </p>
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-brand-4 rounded-brand-xs text-brand-sm flex items-start gap-brand-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white mb-1">Failed to fetch images</h4>
            <p className="text-brand-xs text-brand-text-secondary leading-relaxed">
              {(error as Error)?.message || 'Please check your internet connection or verify your Unsplash Access Key.'}
            </p>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-neutral-900 border-dashed rounded-brand-sm">
          <Compass className="w-10 h-10 text-brand-text-secondary mb-brand-2" />
          <p className="text-brand-sm text-white font-bold">No photos found</p>
          <p className="text-brand-xs text-brand-text-secondary mt-1">Try searching for other terms like &quot;minimal&quot;, &quot;forest&quot; or &quot;workspace&quot;.</p>
        </div>
      ) : (
        <div className="space-y-brand-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-brand-3">
            {photos.map((photo) => (
              <Card key={photo.id} photo={photo} />
            ))}
          </div>

          {/* Observer target element for infinite scroll */}
          {hasNextPage && (
            <div ref={observerTarget} className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="flex gap-1.5 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 animate-bounce"></span>
              </div>
              <p className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase font-bold select-none animate-pulse">
                Loading more inspirations
              </p>
            </div>
          )}

          {!hasNextPage && photos.length > 0 && (
            <p className="text-center text-[10px] text-brand-text-secondary py-brand-4">
              You&apos;ve reached the end of the collection.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
