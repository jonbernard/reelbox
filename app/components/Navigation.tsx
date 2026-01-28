'use client';

import type { Author, FeedType } from '@/app/lib/types';

interface NavigationProps {
  currentType: FeedType;
  onTypeChange: (type: FeedType) => void;
  selectedAuthor: Author | null;
  onAuthorSelect: (author: Author | null) => void;
  onOpenAuthorList: () => void;
}

const tabs: { type: FeedType; label: string }[] = [
  { type: 'following', label: 'Following' },
  { type: 'liked', label: 'Liked' },
  { type: 'favorite', label: 'Favorites' },
  { type: 'all', label: 'All' },
];

export function Navigation({
  currentType,
  onTypeChange,
  selectedAuthor,
  onAuthorSelect,
  onOpenAuthorList,
}: NavigationProps) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 safe-area-top">
      {/* TikTok-like top gradient overlay */}
      <div className="bg-linear-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[6px]">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-3 py-2">
          {/* Center: text tabs with active underline */}
          <div className="relative flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive = currentType === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => {
                    onTypeChange(tab.type);
                    if (tab.type !== 'following') {
                      onAuthorSelect(null);
                    }
                  }}
                  className={`relative px-1 py-2 text-[13px] font-semibold tracking-wide transition ${
                    isActive ? 'text-white' : 'text-white/65 hover:text-white'
                  }`}>
                  {tab.label}
                  <span
                    className={`absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-white transition-all ${
                      isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Following: creator chip row */}
        {currentType === 'following' && (
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-3 pb-2">
            <button
              type="button"
              onClick={() => onAuthorSelect(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedAuthor
                  ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  : 'bg-white/20 text-white'
              }`}>
              All Creators
            </button>

            {selectedAuthor && (
              <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                @{selectedAuthor.uniqueId}
                <button
                  type="button"
                  onClick={() => onAuthorSelect(null)}
                  className="text-white/80 transition hover:text-white"
                  aria-label="Clear filter">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenAuthorList}
              className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
              Browse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
