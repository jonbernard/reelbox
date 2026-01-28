import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the most recent sync logs
    const syncLogs = await prisma.syncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    // Get counts
    const [videoCount, authorCount] = await Promise.all([
      prisma.video.count(),
      prisma.author.count(),
    ]);

    // Get breakdown by type
    const [likedCount, favoriteCount, followingCount] = await Promise.all([
      prisma.video.count({ where: { isLiked: true } }),
      prisma.video.count({ where: { isFavorite: true } }),
      prisma.video.count({ where: { isFollowing: true } }),
    ]);

    return NextResponse.json({
      counts: {
        videos: videoCount,
        authors: authorCount,
        liked: likedCount,
        favorite: favoriteCount,
        following: followingCount,
      },
      recentSyncs: syncLogs,
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json({ error: "Failed to fetch sync status" }, { status: 500 });
  }
}
