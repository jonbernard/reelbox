import { PrismaClient } from '@prisma/client';

import {
  findAvatarPath,
  findCoverPath,
  findVideoPath,
  parseMyfaveTTExport,
  toServablePath,
} from './parse-myfavett';

const prisma = new PrismaClient();

async function main() {
  const exportPath = process.env.MYFAVETT_EXPORT_PATH;

  if (!exportPath) {
    console.error('Error: MYFAVETT_EXPORT_PATH environment variable is not set');
    process.exit(1);
  }

  console.info(`Importing from: ${exportPath}`);

  // Create sync log entry
  const syncLog = await prisma.syncLog.create({
    data: {
      type: 'manual',
      status: 'started',
    },
  });

  try {
    // Parse the export
    console.info('Parsing myfaveTT export...');
    const data = parseMyfaveTTExport(exportPath);

    // Get sets for quick lookup
    const likedVideoIds = new Set(data.likes.likes.downloaded);
    const favoriteVideoIds = new Set(data.bookmarked.downloaded);
    const followingAuthorIds = new Set(data.following.started);

    let authorsAdded = 0;
    let videosAdded = 0;
    let videosUpdated = 0;

    // Import authors
    console.info('Importing authors...');
    const authorEntries = Object.entries(data.authors);
    for (const [authorId, authorData] of authorEntries) {
      const uniqueIds = authorData.uniqueIds || [];
      const nicknames = authorData.nicknames || [];
      const avatarFullPath = findAvatarPath(exportPath, authorId);
      const avatarPath = avatarFullPath ? toServablePath(avatarFullPath, exportPath) : null;

      const existingAuthor = await prisma.author.findUnique({
        where: { id: authorId },
      });

      if (existingAuthor) {
        await prisma.author.update({
          where: { id: authorId },
          data: {
            uniqueId: uniqueIds[0] || existingAuthor.uniqueId,
            uniqueIds,
            nickname: nicknames[0] || existingAuthor.nickname,
            nicknames,
            followerCount: authorData.followerCount,
            heartCount: authorData.heartCount ? BigInt(authorData.heartCount) : null,
            videoCount: authorData.videoCount,
            signature: authorData.signature,
            avatarPath,
            isPrivate: authorData.privateAccount || false,
            isFollowing: followingAuthorIds.has(authorId),
          },
        });
      } else {
        await prisma.author.create({
          data: {
            id: authorId,
            uniqueId: uniqueIds[0] || `user_${authorId}`,
            uniqueIds,
            nickname: nicknames[0] || `User ${authorId}`,
            nicknames,
            followerCount: authorData.followerCount,
            heartCount: authorData.heartCount ? BigInt(authorData.heartCount) : null,
            videoCount: authorData.videoCount,
            signature: authorData.signature,
            avatarPath,
            isPrivate: authorData.privateAccount || false,
            isFollowing: followingAuthorIds.has(authorId),
          },
        });
        authorsAdded++;
      }
    }
    console.info(`Processed ${authorEntries.length} authors (${authorsAdded} new)`);

    // Import videos
    console.info('Importing videos...');
    const videoEntries = Object.entries(data.videos);

    for (const [videoId, videoData] of videoEntries) {
      const isLiked = likedVideoIds.has(videoId);
      const isFavorite = favoriteVideoIds.has(videoId);
      const isFollowing = followingAuthorIds.has(videoData.authorId);

      // Find video file path
      const videoFullPath = findVideoPath(
        exportPath,
        videoId,
        isLiked,
        isFavorite,
        videoData.authorId,
      );

      // Skip if video file doesn't exist
      if (!videoFullPath) {
        continue;
      }

      const videoPath = toServablePath(videoFullPath, exportPath);

      // Find cover path
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

      // Ensure author exists (create placeholder if not)
      const authorExists = await prisma.author.findUnique({
        where: { id: videoData.authorId },
      });

      if (!authorExists) {
        await prisma.author.create({
          data: {
            id: videoData.authorId,
            uniqueId: `user_${videoData.authorId}`,
            uniqueIds: [],
            nickname: `User ${videoData.authorId}`,
            nicknames: [],
            isFollowing,
          },
        });
        authorsAdded++;
      }

      const existingVideo = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (existingVideo) {
        await prisma.video.update({
          where: { id: videoId },
          data: {
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
        videosUpdated++;
      } else {
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
        videosAdded++;
      }
    }

    console.info(
      `Processed ${videoEntries.length} videos (${videosAdded} new, ${videosUpdated} updated)`,
    );

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        videosAdded,
        videosUpdated,
        authorsAdded,
        completedAt: new Date(),
      },
    });

    console.info('\nImport completed successfully!');
    console.info(`  Authors: ${authorsAdded} added`);
    console.info(`  Videos: ${videosAdded} added, ${videosUpdated} updated`);
  } catch (error) {
    console.error('Import failed:', error);

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        errors: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
