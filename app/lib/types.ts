export interface Author {
  id: string;
  uniqueId: string;
  nickname: string;
  avatarPath: string | null;
  followerCount?: number | null;
  heartCount?: bigint | null;
  videoCount?: number | null;
  signature?: string | null;
  isFollowing: boolean;
  _count?: {
    videos: number;
  };
}

export interface Video {
  id: string;
  authorId: string;
  author: Author;
  description: string | null;
  createTime: string;
  diggCount: number | null;
  playCount: number | null;
  audioId: string | null;
  size: string | null;
  videoPath: string;
  coverPath: string | null;
  isLiked: boolean;
  isFavorite: boolean;
  isFollowing: boolean;
  isHidden: boolean;
}

export interface VideosResponse {
  videos: Video[];
  nextCursor: string | null;
}

export interface AuthorsResponse {
  authors: Author[];
}

export interface SyncStatus {
  counts: {
    videos: number;
    authors: number;
    liked: number;
    favorite: number;
    following: number;
  };
  recentSyncs: SyncLog[];
}

export interface SyncLog {
  id: number;
  type: string;
  status: string;
  videosAdded: number;
  videosUpdated: number;
  authorsAdded: number;
  errors: string | null;
  startedAt: string;
  completedAt: string | null;
}

export type FeedType = 'all' | 'liked' | 'favorite' | 'following';
