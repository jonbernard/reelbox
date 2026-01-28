import * as path from 'node:path';

import { PrismaClient } from '@prisma/client';
import { watch } from 'chokidar';

import {
  type AuthorData,
  findAvatarPath,
  findCoverPath,
  parseMyfaveTTExport,
  toServablePath,
  type VideoData,
} from './parse-myfavett';

const prisma = new PrismaClient();

// Debounce timer for batch processing
let syncTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 5000;

async function syncNewVideo(videoId: string, exportPath: string, videoFilePath: string) {
  try {
    // Parse the current database files
    const data = parseMyfaveTTExport(exportPath);

    // Get video metadata
    const videoData = data.videos[videoId] as VideoData | undefined;
    if (!videoData) {
      console.info(`  No metadata found for video ${videoId}, skipping`);
      return false;
    }

    // Determine video type from path
    const isLiked = videoFilePath.includes('/Likes/');
    const isFavorite = videoFilePath.includes('/Favorites/');
    const isFollowing = videoFilePath.includes('/Following/') && !isLiked && !isFavorite;

    const videoPath = toServablePath(videoFilePath, exportPath);

    // Find cover
    const coverFullPath = findCoverPath(
      exportPath,
      videoId,
      isLiked,
      isFavorite,
      videoData.authorId,
    );
    const coverPath = coverFullPath ? toServablePath(coverFullPath, exportPath) : null;

    // Get description
    const description = data.texts[videoId] || null;

    // Ensure author exists
    const authorData = data.authors[videoData.authorId] as AuthorData | undefined;
    const authorExists = await prisma.author.findUnique({
      where: { id: videoData.authorId },
    });

    if (!authorExists && authorData) {
      const uniqueIds = authorData.uniqueIds || [];
      const nicknames = authorData.nicknames || [];
      const avatarFullPath = findAvatarPath(exportPath, videoData.authorId);
      const avatarPath = avatarFullPath ? toServablePath(avatarFullPath, exportPath) : null;

      await prisma.author.create({
        data: {
          id: videoData.authorId,
          uniqueId: uniqueIds[0] || `user_${videoData.authorId}`,
          uniqueIds,
          nickname: nicknames[0] || `User ${videoData.authorId}`,
          nicknames,
          followerCount: authorData.followerCount,
          heartCount: authorData.heartCount ? BigInt(authorData.heartCount) : null,
          videoCount: authorData.videoCount,
          signature: authorData.signature,
          avatarPath,
          isPrivate: authorData.privateAccount || false,
          isFollowing,
        },
      });
      console.info(`  Created author: ${uniqueIds[0] || videoData.authorId}`);
    }

    // Check if video already exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (existingVideo) {
      await prisma.video.update({
        where: { id: videoId },
        data: {
          videoPath,
          coverPath,
          isLiked: existingVideo.isLiked || isLiked,
          isFavorite: existingVideo.isFavorite || isFavorite,
          isFollowing: existingVideo.isFollowing || isFollowing,
        },
      });
      console.info(`  Updated video: ${videoId}`);
      return true;
    }

    // Create new video
    await prisma.video.create({
      data: {
        id: videoId,
        authorId: videoData.authorId,
        description,
        createTime: new Date(videoData.createTime * 1000),
        diggCount: videoData.diggCount,
        playCount: videoData.playCount,
        audioId: videoData.audioId,
        size: videoData.size,
        videoPath,
        coverPath,
        isLiked,
        isFavorite,
        isFollowing,
      },
    });

    console.info(`  Added video: ${videoId}`);
    return true;
  } catch (error) {
    console.error(`  Error syncing video ${videoId}:`, error);
    return false;
  }
}

async function main() {
  const exportPath = process.env.MYFAVETT_EXPORT_PATH;

  if (!exportPath) {
    console.error('Error: MYFAVETT_EXPORT_PATH environment variable is not set');
    process.exit(1);
  }

  console.info(`Watching for new videos in: ${exportPath}`);

  const videoPaths = [
    path.join(exportPath, 'data', 'Likes', 'videos'),
    path.join(exportPath, 'data', 'Favorites', 'videos'),
    path.join(exportPath, 'data', 'Following', '*', 'videos'),
  ];

  const watcher = watch(videoPaths, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });

  const pendingVideos: Map<string, string> = new Map();

  watcher.on('add', (filePath) => {
    if (!filePath.endsWith('.mp4')) return;

    const videoId = path.basename(filePath, '.mp4');
    console.info(`New video detected: ${videoId}`);
    pendingVideos.set(videoId, filePath);

    // Debounce processing
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(async () => {
      const videosToSync = new Map(pendingVideos);
      pendingVideos.clear();

      console.info(`\nSyncing ${videosToSync.size} new video(s)...`);

      const syncLog = await prisma.syncLog.create({
        data: {
          type: 'watch',
          status: 'started',
        },
      });

      let added = 0;
      let failed = 0;

      for (const [id, path] of videosToSync) {
        const success = await syncNewVideo(id, exportPath, path);
        if (success) added++;
        else failed++;
      }

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: failed > 0 ? 'completed' : 'completed',
          videosAdded: added,
          errors: failed > 0 ? `${failed} videos failed to sync` : null,
          completedAt: new Date(),
        },
      });

      console.info(`Sync complete: ${added} added, ${failed} failed\n`);
    }, DEBOUNCE_MS);
  });

  watcher.on('error', (error) => {
    console.error('Watcher error:', error);
  });

  console.info('Watch mode active. Press Ctrl+C to stop.\n');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.info('\nShutting down...');
    await watcher.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

main();
