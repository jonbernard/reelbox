# Scroll Viewer - TikTok-Style Video Viewer

## Project Overview

A self-hosted, mobile-friendly web application that replicates the TikTok vertical scroll experience for viewing archived videos from myfaveTT exports.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Next.js App   │◄──►│   PostgreSQL    │                │
│  │   (Port 3000)   │    │   (Port 5432)   │                │
│  └────────┬────────┘    └────────┬────────┘                │
│           │                      │                          │
│           │                      │                          │
│  ┌────────▼────────┐    ┌────────▼────────┐                │
│  │  Video Volume   │    │   DB Volume     │                │
│  │ (SMB mount)     │    │ (Persistent)    │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Linting | Biome (replacing ESLint) |
| Container | Docker + Docker Compose |
| Video Serving | Static file serving from mounted volume |

## Data Sources (myfaveTT Archive)

The myfaveTT export provides:

### Database Files (in `data/.appdata/`)
- `facts.json` - Main metadata with user info, lists
- `db_videos.js` - Video metadata (authorId, createTime, diggCount, playCount, size)
- `db_authors.js` - Author metadata (uniqueIds, nicknames, followerCount, etc.)
- `db_texts.js` - Video descriptions/captions
- `db_likes.js` - Liked video IDs
- `db_bookmarked.js` - Favorited video IDs
- `db_following.js` - Following author IDs

### Video Files
- `data/Likes/videos/{videoId}.mp4` - Liked videos
- `data/Likes/covers/{videoId}.jpeg` - Liked video covers
- `data/Favorites/videos/{videoId}.mp4` - Favorited videos
- `data/Favorites/covers/{videoId}.jpeg` - Favorited video covers
- `data/Following/{authorId}/videos/{videoId}.mp4` - Videos from followed creators
- `data/Following/{authorId}/covers/{videoId}.jpeg` - Covers from followed creators
- `data/Following/Avatars/{authorId}.jpeg` - Creator avatars

## Database Schema (Prisma)

```prisma
model Author {
  id            String   @id // TikTok author ID
  uniqueId      String   // Username (latest)
  uniqueIds     String[] // Historical usernames
  nickname      String   // Display name
  nicknames     String[] // Historical display names
  followerCount Int?
  heartCount    BigInt?
  videoCount    Int?
  signature     String?  // Bio
  avatarPath    String?  // Path to avatar image
  isPrivate     Boolean  @default(false)
  isFollowing   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  videos        Video[]
}

model Video {
  id          String   @id // TikTok video ID
  authorId    String
  author      Author   @relation(fields: [authorId], references: [id])
  description String?  // Caption/text
  createTime  DateTime // Original post time
  diggCount   Int?     // Like count
  playCount   Int?     // View count
  audioId     String?
  size        String?  // File size string
  videoPath   String   // Path to video file
  coverPath   String?  // Path to cover image
  isLiked     Boolean  @default(false)
  isFavorite  Boolean  @default(false)
  isFollowing Boolean  @default(false) // From a followed creator
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([authorId])
  @@index([isLiked])
  @@index([isFavorite])
  @@index([isFollowing])
  @@index([createTime])
}

model SyncLog {
  id         Int      @id @default(autoincrement())
  type       String   // 'manual' | 'watch'
  status     String   // 'started' | 'completed' | 'failed'
  videosAdded Int     @default(0)
  videosUpdated Int   @default(0)
  errors     String?
  startedAt  DateTime @default(now())
  completedAt DateTime?
}
```

## Implementation Plan

### Phase 1: Project Setup

1. **Remove ESLint, Add Biome**
   - Remove `eslint`, `eslint-config-next` from package.json
   - Remove `eslint.config.mjs`
   - Install `@biomejs/biome`
   - Create `biome.json` with standard configuration
   - Update `package.json` scripts

2. **Add Core Dependencies**
   ```bash
   npm install prisma @prisma/client
   npm install sharp # For image optimization
   npm install -D @biomejs/biome
   ```

3. **Initialize Prisma**
   - Create `prisma/schema.prisma`
   - Configure for PostgreSQL

### Phase 2: Database & Import System

4. **Create Import Script (`scripts/import.ts`)**
   - Parse myfaveTT JS database files
   - Extract JSON from `window.db=String.raw\`{...}\`` format
   - Map video files to database records
   - Support incremental sync (only new/updated)

5. **Create Watch Script (`scripts/watch.ts`)**
   - Use chokidar to watch for file changes
   - Trigger incremental sync on new files
   - Log sync events to SyncLog table

6. **Create CLI Entry Point**
   - `npm run import` - One-time import
   - `npm run watch` - Watch mode
   - Support specifying export path as argument

### Phase 3: API Development

7. **Create API Routes**
   - `GET /api/videos` - List videos with filters
     - Query params: `type` (liked|favorite|following|all)
     - Query params: `authorId` (filter by creator)
     - Query params: `cursor`, `limit` (pagination)
   - `GET /api/videos/[id]` - Get single video details
   - `GET /api/authors` - List followed authors
   - `GET /api/authors/[id]` - Get author details
   - `GET /api/sync` - Get sync status
   - `POST /api/sync` - Trigger manual sync

8. **Static File Serving**
   - Configure Next.js to serve videos from mounted volume
   - Set up proper CORS and range request headers for video streaming

### Phase 4: Frontend Development

9. **Create Video Player Component**
   - Full-screen vertical video player
   - Autoplay on scroll into view
   - Pause on scroll out of view
   - Touch/swipe gestures for mobile
   - Mute/unmute toggle with persistence
   - Progress bar overlay
   - Double-tap to like animation (visual only)

10. **Create Video Info Overlay**
    - Creator avatar + username
    - Video description (expandable)
    - Like count, view count
    - Original post date

11. **Create Navigation**
    - Tab bar: Liked | Favorites | Following
    - Following sub-filter: All creators or select one
    - Creator list sidebar/modal

12. **Create Feed Component**
    - Infinite scroll with virtualization
    - Preload next video
    - Skeleton loading states

### Phase 5: Docker & Deployment

13. **Create Dockerfile**
    ```dockerfile
    FROM node:20-alpine
    # Multi-stage build for production
    ```

14. **Create docker-compose.yml**
    ```yaml
    services:
      app:
        build: .
        ports:
          - "3000:3000"
        volumes:
          - /path/to/myfaveTT/data:/app/videos:ro
        environment:
          - DATABASE_URL=postgresql://...
        depends_on:
          - db

      db:
        image: postgres:16-alpine
        volumes:
          - postgres_data:/var/lib/postgresql/data
        environment:
          - POSTGRES_USER=scroll
          - POSTGRES_PASSWORD=scroll
          - POSTGRES_DB=scroll_viewer

    volumes:
      postgres_data:
    ```

15. **Create Import Container Command**
    - `docker-compose run app npm run import`
    - Document in README

### Phase 6: Polish & Documentation

16. **Mobile Optimization**
    - PWA manifest
    - Touch gestures
    - Responsive design
    - Safe area insets

17. **Documentation**
    - README with setup instructions
    - Docker deployment guide
    - Portainer setup guide

## File Structure (Final)

```
scroll-viewer/
├── app/
│   ├── api/
│   │   ├── videos/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── authors/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── sync/route.ts
│   ├── components/
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoFeed.tsx
│   │   ├── VideoOverlay.tsx
│   │   ├── Navigation.tsx
│   │   ├── AuthorList.tsx
│   │   └── SyncStatus.tsx
│   ├── hooks/
│   │   ├── useVideoFeed.ts
│   │   ├── useVideoPlayer.ts
│   │   └── useIntersectionObserver.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── prisma/
│   └── schema.prisma
├── scripts/
│   ├── import.ts
│   ├── watch.ts
│   └── parse-myfavett.ts
├── public/
├── biome.json
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://scroll:scroll@db:5432/scroll_viewer

# Video paths (inside container)
VIDEO_BASE_PATH=/app/videos

# Import source (for running import outside container)
MYFAVETT_EXPORT_PATH=/Volumes/Server/scroll-viewer
```

## Deployment Steps (Portainer)

1. Create a new Stack in Portainer
2. Paste docker-compose.yml content
3. Configure volumes to mount SMB share
4. Deploy stack
5. Run import: `docker exec scroll-viewer-app npm run import`
6. Access at `http://your-server:3000`

## Tasks Checklist

- [ ] Phase 1: Project Setup
  - [ ] Remove ESLint, add Biome
  - [ ] Configure Biome with global standards
  - [ ] Add Prisma and dependencies

- [ ] Phase 2: Database & Import
  - [ ] Create Prisma schema
  - [ ] Create myfaveTT parser
  - [ ] Create import script
  - [ ] Create watch script

- [ ] Phase 3: API Development
  - [ ] Videos API endpoints
  - [ ] Authors API endpoints
  - [ ] Sync API endpoint
  - [ ] Static file serving config

- [ ] Phase 4: Frontend Development
  - [ ] Video player component
  - [ ] Video info overlay
  - [ ] Navigation tabs
  - [ ] Following filter
  - [ ] Infinite scroll feed

- [ ] Phase 5: Docker & Deployment
  - [ ] Dockerfile
  - [ ] docker-compose.yml
  - [ ] Documentation

- [ ] Phase 6: Polish
  - [ ] PWA support
  - [ ] Mobile gestures
  - [ ] Error handling
  - [ ] Loading states
