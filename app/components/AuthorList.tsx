"use client";

import type { Author } from "@/app/lib/types";
import { formatCount, getAvatarUrl } from "@/app/lib/utils";

interface AuthorListProps {
  authors: Author[];
  isLoading: boolean;
  onSelect: (author: Author) => void;
  onClose: () => void;
}

export function AuthorList({ authors, isLoading, onSelect, onClose }: AuthorListProps) {
  return (
    <div className="fixed inset-0 z-30 bg-black/90">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white">Following</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white hover:bg-white/10"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
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
        </div>

        {/* Author list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : authors.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No creators found</div>
          ) : (
            <div className="divide-y divide-white/10">
              {authors.map((author) => {
                const avatarUrl = getAvatarUrl(author.avatarPath);
                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => onSelect(author)}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-white/5"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={author.nickname}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600 text-white">
                        {author.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold text-white">{author.nickname}</p>
                      <p className="truncate text-sm text-gray-400">@{author.uniqueId}</p>
                      {author._count && (
                        <p className="text-xs text-gray-500">
                          {author._count.videos} videos in library
                        </p>
                      )}
                    </div>
                    {author.followerCount && (
                      <div className="text-right text-sm text-gray-400">
                        {formatCount(author.followerCount)} followers
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
