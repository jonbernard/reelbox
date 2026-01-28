import * as fs from "node:fs";
import * as path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const VIDEO_BASE_PATH = process.env.VIDEO_BASE_PATH || "/app/videos";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const filePath = pathParts.join("/");

  // Prevent directory traversal
  if (filePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const fullPath = path.join(VIDEO_BASE_PATH, filePath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = fs.statSync(fullPath);
  const fileSize = stat.size;
  const ext = path.extname(fullPath).toLowerCase();

  // Determine content type
  const contentTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };

  const contentType = contentTypes[ext] || "application/octet-stream";
  const isVideo = ext === ".mp4" || ext === ".webm";

  // Handle range requests for video
  const range = request.headers.get("range");

  if (isVideo && range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(parts[0], 10);
    const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(fullPath, { start, end });
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk as Buffer));
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  // Non-range request
  const fileBuffer = fs.readFileSync(fullPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": fileSize.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": isVideo ? "public, max-age=31536000" : "public, max-age=86400",
    },
  });
}
