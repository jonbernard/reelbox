import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Parse myfaveTT database files
 * These files contain JavaScript that assigns JSON to window variables
 * Format: window.varName=String.raw`{...json...}`;
 */

export interface VideoData {
  authorId: string;
  createTime: number;
  diggCount?: number;
  playCount?: number;
  audioId?: string;
  size?: string;
}

export interface AuthorData {
  uniqueIds?: string[];
  nicknames?: string[];
  followerCount?: number;
  heartCount?: number;
  videoCount?: number;
  signature?: string;
  privateAccount?: boolean;
}

export interface LikesData {
  schemaVersion: number;
  user: {
    uid: string;
    id: string;
    uniqueId: string;
    nickname: string;
  };
  likes: {
    downloadStatus: string;
    officialList: string[];
    downloaded: string[];
    total: number;
    numDisappeared: number;
  };
}

export interface BookmarkedData {
  officialList: string[];
  downloaded: string[];
  total: number;
  numDisappeared: number;
}

export interface FollowingData {
  officialAuthorList: string[];
  started: string[];
  notInterested: string[];
}

export interface FactsData {
  schemaVersion: number;
  user: {
    id: string;
    uniqueId: string;
    nickname: string;
  };
  likes: {
    downloadStatus: string;
    officialList: string[];
    downloaded: string[];
    total: number;
    numDisappeared: number;
  };
  // Additional fields may exist
}

/**
 * Extract JSON from myfaveTT JS file format
 * Handles: window.varName=String.raw`{...}`;
 */
function extractJsonFromJsFile(content: string): string {
  // Match the pattern: window.varName=String.raw`{...}`
  const match = content.match(/String\.raw`([\s\S]+)`/);
  if (match?.[1]) {
    return match[1];
  }

  // Also try direct JSON (for facts.json)
  if (content.trim().startsWith('{')) {
    return content;
  }

  throw new Error('Could not extract JSON from file content');
}

/**
 * Parse a myfaveTT database file
 */
export function parseDbFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  const jsonStr = extractJsonFromJsFile(content);
  return JSON.parse(jsonStr) as T;
}

/**
 * Parse all myfaveTT database files from an export directory
 */
export function parseMyfaveTTExport(exportPath: string) {
  const appdataPath = path.join(exportPath, 'data', '.appdata');

  // Parse each database file
  const videos = parseDbFile<Record<string, VideoData>>(path.join(appdataPath, 'db_videos.js'));
  const authors = parseDbFile<Record<string, AuthorData>>(path.join(appdataPath, 'db_authors.js'));
  const texts = parseDbFile<Record<string, string>>(path.join(appdataPath, 'db_texts.js'));
  const likes = parseDbFile<LikesData>(path.join(appdataPath, 'db_likes.js'));
  const bookmarked = parseDbFile<BookmarkedData>(path.join(appdataPath, 'db_bookmarked.js'));
  const following = parseDbFile<FollowingData>(path.join(appdataPath, 'db_following.js'));

  // Parse facts.json (plain JSON, not JS)
  const factsPath = path.join(appdataPath, 'facts.json');
  const facts = JSON.parse(fs.readFileSync(factsPath, 'utf-8')) as FactsData;

  return {
    videos,
    authors,
    texts,
    likes,
    bookmarked,
    following,
    facts,
    exportPath,
  };
}

/**
 * Find video file path for a given video ID
 */
export function findVideoPath(
  exportPath: string,
  videoId: string,
  isLiked: boolean,
  isFavorite: boolean,
  authorId?: string,
): string | null {
  const dataPath = path.join(exportPath, 'data');

  // Check Likes folder
  if (isLiked) {
    const likePath = path.join(dataPath, 'Likes', 'videos', `${videoId}.mp4`);
    if (fs.existsSync(likePath)) return likePath;
  }

  // Check Favorites folder
  if (isFavorite) {
    const favPath = path.join(dataPath, 'Favorites', 'videos', `${videoId}.mp4`);
    if (fs.existsSync(favPath)) return favPath;
  }

  // Check Following folder (requires authorId)
  if (authorId) {
    const followPath = path.join(dataPath, 'Following', authorId, 'videos', `${videoId}.mp4`);
    if (fs.existsSync(followPath)) return followPath;
  }

  // Fallback: search all Following folders
  const followingPath = path.join(dataPath, 'Following');
  if (fs.existsSync(followingPath)) {
    const authorDirs = fs.readdirSync(followingPath).filter((d) => d !== 'Avatars');
    for (const dir of authorDirs) {
      const videoPath = path.join(followingPath, dir, 'videos', `${videoId}.mp4`);
      if (fs.existsSync(videoPath)) return videoPath;
    }
  }

  return null;
}

/**
 * Find cover image path for a given video ID
 */
export function findCoverPath(
  exportPath: string,
  videoId: string,
  isLiked: boolean,
  isFavorite: boolean,
  authorId?: string,
): string | null {
  const dataPath = path.join(exportPath, 'data');
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const candidatesFor = (baseDir: string) =>
    exts.map((ext) => path.join(baseDir, `${videoId}${ext}`));

  // Check Likes folder
  if (isLiked) {
    const likeDir = path.join(dataPath, 'Likes', 'covers');
    for (const p of candidatesFor(likeDir)) {
      if (fs.existsSync(p)) return p;
    }
  }

  // Check Favorites folder
  if (isFavorite) {
    const favDir = path.join(dataPath, 'Favorites', 'covers');
    for (const p of candidatesFor(favDir)) {
      if (fs.existsSync(p)) return p;
    }
  }

  // Check Following folder
  if (authorId) {
    const followDir = path.join(dataPath, 'Following', authorId, 'covers');
    for (const p of candidatesFor(followDir)) {
      if (fs.existsSync(p)) return p;
    }
  }

  // Fallback: search all Following folders
  const followingPath = path.join(dataPath, 'Following');
  if (fs.existsSync(followingPath)) {
    const authorDirs = fs.readdirSync(followingPath).filter((d) => d !== 'Avatars');
    for (const dir of authorDirs) {
      const coverDir = path.join(followingPath, dir, 'covers');
      for (const p of candidatesFor(coverDir)) {
        if (fs.existsSync(p)) return p;
      }
    }
  }

  return null;
}

/**
 * Find avatar path for a given author ID
 */
export function findAvatarPath(exportPath: string, authorId: string): string | null {
  const avatarsDir = path.join(exportPath, 'data', 'Following', 'Avatars');
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const prefixes = ['large_', 'small_', ''];

  // Prefer large_ over small_ when both exist.
  for (const prefix of prefixes) {
    for (const ext of exts) {
      const avatarPath = path.join(avatarsDir, `${prefix}${authorId}${ext}`);
      if (fs.existsSync(avatarPath)) return avatarPath;
    }
  }
  return null;
}

/**
 * Convert file path to a relative path suitable for serving
 */
export function toServablePath(fullPath: string, exportPath: string): string {
  return fullPath.replace(exportPath, '').replace(/^\/+/, '');
}
