"use client";

import type { Video } from "@/app/lib/types";
import { formatCount, formatRelativeDate, getAvatarUrl } from "@/app/lib/utils";
import { useState } from "react";

interface VideoOverlayProps {
  video: Video;
}

export function VideoOverlay({ video }: VideoOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avatarUrl = getAvatarUrl(video.author.avatarPath);

  const description = video.description || "";
  const shouldTruncate = description.length > 100;
  const displayDescription =
    shouldTruncate && !isExpanded ? `${description.slice(0, 100)}...` : description;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-8">
      {/* Author info */}
      <div className="mb-2 flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={video.author.nickname}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white">
            {video.author.nickname.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-white">{video.author.nickname}</p>
          <p className="text-sm text-gray-300">@{video.author.uniqueId}</p>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mb-3">
          <p className="text-sm text-white">
            {displayDescription}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 font-semibold text-gray-300 hover:text-white"
              >
                {isExpanded ? "less" : "more"}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-300">
        {video.diggCount != null && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {formatCount(video.diggCount)}
          </span>
        )}
        {video.playCount != null && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            {formatCount(video.playCount)}
          </span>
        )}
        <span>{formatRelativeDate(new Date(video.createTime))}</span>
      </div>
    </div>
  );
}
