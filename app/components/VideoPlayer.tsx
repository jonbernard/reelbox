"use client";

import type { Video } from "@/app/lib/types";
import { getCoverUrl, getVideoUrl } from "@/app/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoOverlay } from "./VideoOverlay";

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export function VideoPlayer({ video, isActive, isMuted, onMuteToggle }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoUrl = getVideoUrl(video.videoPath);
  const coverUrl = getCoverUrl(video.coverPath);

  // Play/pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.play().catch(() => {
        // Autoplay might be blocked
      });
    } else {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  }, [isActive]);

  // Handle mute state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = isMuted;
    }
  }, [isMuted]);

  // Update progress
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      setProgress(videoEl.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoEl.duration);
      setIsLoaded(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", handlePause);

    return () => {
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleVideoToggle = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }

    // Show controls briefly
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  const handleVideoKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleVideoToggle();
      }
    },
    [handleVideoToggle]
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const videoEl = videoRef.current;
      if (!videoEl || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      videoEl.currentTime = percentage * duration;
    },
    [duration]
  );

  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const videoEl = videoRef.current;
      if (!videoEl || !duration) return;

      const step = duration * 0.05; // 5% of duration
      if (e.key === "ArrowRight") {
        e.preventDefault();
        videoEl.currentTime = Math.min(videoEl.currentTime + step, duration);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        videoEl.currentTime = Math.max(videoEl.currentTime - step, 0);
      }
    },
    [duration]
  );

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="relative h-full w-full bg-black">
      {/* Cover image (shows before video loads) */}
      {coverUrl && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
      )}

      {/* Video - wrapped in button for accessibility */}
      <button
        type="button"
        className="h-full w-full border-0 bg-transparent p-0"
        onClick={handleVideoToggle}
        onKeyDown={handleVideoKeyDown}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          loop
          playsInline
          muted={isMuted}
          poster={coverUrl || undefined}
          preload="metadata"
        />
      </button>

      {/* Play/Pause indicator */}
      {showControls && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-4">
            {isPlaying ? (
              <svg
                className="h-12 w-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="h-12 w-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Mute button */}
      <button
        type="button"
        onClick={onMuteToggle}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 cursor-pointer bg-white/30"
        onClick={handleProgressClick}
        onKeyDown={handleProgressKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Video progress"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-white transition-[width] duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Video overlay */}
      <VideoOverlay video={video} />
    </div>
  );
}
