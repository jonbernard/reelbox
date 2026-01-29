-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "uniqueIds" TEXT[],
    "nickname" TEXT NOT NULL,
    "nicknames" TEXT[],
    "followerCount" INTEGER,
    "heartCount" BIGINT,
    "videoCount" INTEGER,
    "signature" TEXT,
    "avatarPath" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isFollowing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "description" TEXT,
    "createTime" TIMESTAMP(3) NOT NULL,
    "diggCount" INTEGER,
    "playCount" INTEGER,
    "audioId" TEXT,
    "size" TEXT,
    "videoPath" TEXT NOT NULL,
    "coverPath" TEXT,
    "isLiked" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isFollowing" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "videosAdded" INTEGER NOT NULL DEFAULT 0,
    "videosUpdated" INTEGER NOT NULL DEFAULT 0,
    "authorsAdded" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_authorId_idx" ON "Video"("authorId");

-- CreateIndex
CREATE INDEX "Video_isLiked_idx" ON "Video"("isLiked");

-- CreateIndex
CREATE INDEX "Video_isFavorite_idx" ON "Video"("isFavorite");

-- CreateIndex
CREATE INDEX "Video_isFollowing_idx" ON "Video"("isFollowing");

-- CreateIndex
CREATE INDEX "Video_isHidden_idx" ON "Video"("isHidden");

-- CreateIndex
CREATE INDEX "Video_createTime_idx" ON "Video"("createTime");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

