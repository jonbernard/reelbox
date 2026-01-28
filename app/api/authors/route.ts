import { prisma } from "@/app/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const followingOnly = searchParams.get("following") === "true";

  try {
    const where = followingOnly ? { isFollowing: true } : {};

    const authors = await prisma.author.findMany({
      where,
      orderBy: { nickname: "asc" },
      include: {
        _count: {
          select: { videos: true },
        },
      },
    });

    return NextResponse.json({ authors });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}
