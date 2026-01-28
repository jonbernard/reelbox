import { prisma } from "@/app/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all";
  const authorId = searchParams.get("authorId");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50);

  try {
    const where: Record<string, unknown> = {};

    // Filter by type
    switch (type) {
      case "liked":
        where.isLiked = true;
        break;
      case "favorite":
        where.isFavorite = true;
        break;
      case "following":
        where.isFollowing = true;
        break;
      // 'all' has no filter
    }

    // Filter by author if specified
    if (authorId) {
      where.authorId = authorId;
    }

    const videos = await prisma.video.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createTime: "desc" },
      include: {
        author: {
          select: {
            id: true,
            uniqueId: true,
            nickname: true,
            avatarPath: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (videos.length > limit) {
      const nextItem = videos.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      videos,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
