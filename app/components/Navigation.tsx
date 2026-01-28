"use client";

import type { Author, FeedType } from "@/app/lib/types";

interface NavigationProps {
  currentType: FeedType;
  onTypeChange: (type: FeedType) => void;
  selectedAuthor: Author | null;
  onAuthorSelect: (author: Author | null) => void;
  onOpenAuthorList: () => void;
}

const tabs: { type: FeedType; label: string }[] = [
  { type: "liked", label: "Liked" },
  { type: "favorite", label: "Favorites" },
  { type: "following", label: "Following" },
  { type: "all", label: "All" },
];

export function Navigation({
  currentType,
  onTypeChange,
  selectedAuthor,
  onAuthorSelect,
  onOpenAuthorList,
}: NavigationProps) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-20 bg-black/80 backdrop-blur-sm safe-area-top">
      <div className="flex items-center justify-center gap-1 px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => {
              onTypeChange(tab.type);
              if (tab.type !== "following") {
                onAuthorSelect(null);
              }
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              currentType === tab.type
                ? "bg-white text-black"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Author filter for Following tab */}
      {currentType === "following" && (
        <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-2">
          <button
            type="button"
            onClick={() => onAuthorSelect(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !selectedAuthor
                ? "bg-white/20 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            All Creators
          </button>

          {selectedAuthor && (
            <span className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
              @{selectedAuthor.uniqueId}
              <button
                type="button"
                onClick={() => onAuthorSelect(null)}
                className="hover:text-gray-300"
                aria-label="Clear filter"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
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
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
          >
            Browse Creators
          </button>
        </div>
      )}
    </nav>
  );
}
