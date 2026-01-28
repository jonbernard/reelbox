/**
 * Format a number with K/M suffix
 */
export function formatCount(count: number | null | undefined): string {
  if (count == null) return "";

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate video URL from path
 */
export function getVideoUrl(videoPath: string): string {
  return `/api/media/${encodeURIComponent(videoPath)}`;
}

/**
 * Generate cover URL from path
 */
export function getCoverUrl(coverPath: string | null): string | null {
  if (!coverPath) return null;
  return `/api/media/${encodeURIComponent(coverPath)}`;
}

/**
 * Generate avatar URL from path
 */
export function getAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null;
  return `/api/media/${encodeURIComponent(avatarPath)}`;
}
