"use client";

import { useInfiniteScroll } from "@/app/hooks/useIntersectionObserver";
import type { Video } from "@/app/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoFeedProps {
  videos: Video[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function VideoFeed({
  videos,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: VideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useInfiniteScroll(onLoadMore, hasMore, isLoadingMore);

  // Handle scroll to determine active video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const newIndex = Math.round(scrollTop / height);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, videos.length - 1);
        container.scrollTo({
          top: nextIndex * container.clientHeight,
          behavior: "smooth",
        });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prevIndex = Math.max(activeIndex - 1, 0);
        container.scrollTo({
          top: prevIndex * container.clientHeight,
          behavior: "smooth",
        });
      } else if (e.key === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, videos.length]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
        <svg
          className="mb-4 h-16 w-16 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium">No videos found</p>
        <p className="mt-1 text-sm text-gray-400">Try changing the filter or import some videos</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen snap-y snap-mandatory overflow-y-scroll bg-black"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-screen w-full snap-start snap-always">
          <VideoPlayer
            video={video}
            isActive={index === activeIndex}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
          />
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex h-20 items-center justify-center">
        {isLoadingMore && (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
      </div>
    </div>
  );
}
