'use client';

import Image from 'next/image';

import type { Author } from '@/app/lib/types';

import { formatCount, getAvatarUrl } from '@/app/lib/utils';

interface AuthorListProps {
  authors: Author[];
  isLoading: boolean;
  onSelect: (author: Author) => void;
  onClose: () => void;
}

export function AuthorList({ authors, isLoading, onSelect, onClose }: AuthorListProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 safe-area-top">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">Creators</h2>
            <p className="text-xs font-semibold text-white/60">Pick who to filter “Following” by</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/15 active:scale-95"
            aria-label="Close">
            <svg
              className="h-6 w-6"
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
                    className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/7 active:bg-white/10">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={author.nickname}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15">
                        {author.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-[15px] font-extrabold tracking-tight text-white">
                        {author.nickname}
                      </p>
                      <p className="truncate text-sm font-semibold text-white/65">
                        @{author.uniqueId}
                      </p>
                      {author._count && (
                        <p className="text-xs font-semibold text-white/45">
                          {author._count.videos} videos in library
                        </p>
                      )}
                    </div>
                    {author.followerCount && (
                      <div className="text-right text-sm font-semibold text-white/60">
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
