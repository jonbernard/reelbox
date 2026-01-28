import { prisma } from "@/app/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { videos: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json({ error: "Failed to fetch author" }, { status: 500 });
  }
}
