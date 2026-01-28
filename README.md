# Scroll Viewer

A self-hosted, mobile-friendly TikTok-style video viewer for myfaveTT archives.

## Features

- Vertical scroll video feed (like TikTok)
- Mobile-friendly with touch gestures
- Filter by: Liked, Favorites, Following, or All videos
- Filter Following by specific creator
- Video progress bar and mute toggle
- Keyboard navigation (j/k, arrow keys, m for mute)
- PostgreSQL database with Prisma ORM
- Import/sync myfaveTT exports
- Docker-ready for self-hosting

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- A myfaveTT export folder

## Quick Start (Development)

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL and myfaveTT export path
```

3. Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

4. Import your myfaveTT archive:

```bash
npm run import
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Using Docker Compose

1. Edit `docker-compose.yml` to set your myfaveTT export path:

```yaml
volumes:
  - /path/to/your/myfavett/export:/app/videos:ro
```

2. Start the stack:

```bash
docker-compose up -d
```

3. Run the database migration and import:

```bash
docker-compose --profile setup run migrate
```

4. Access at `http://your-server:3000`

### Portainer Deployment

1. Create a new Stack in Portainer
2. Paste the contents of `docker-compose.yml`
3. Update the volume mount path for your myfaveTT export
4. Deploy the stack
5. Run the migration container (enable the "setup" profile)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |
| `npm run import` | Import myfaveTT export to database |
| `npm run watch` | Watch for new videos and auto-import |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `VIDEO_BASE_PATH` | Path to video files (in container) | `/app/videos` |
| `MYFAVETT_EXPORT_PATH` | Path to myfaveTT export folder | Required for import |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `ArrowDown` | Next video |
| `k` / `ArrowUp` | Previous video |
| `m` | Toggle mute |
| `Space` / `Enter` | Play/Pause |

## myfaveTT Export Structure

The importer expects this folder structure:

```
export/
├── Archive.html
├── data/
│   ├── .appdata/
│   │   ├── db_videos.js
│   │   ├── db_authors.js
│   │   ├── db_texts.js
│   │   ├── db_likes.js
│   │   ├── db_bookmarked.js
│   │   ├── db_following.js
│   │   └── facts.json
│   ├── Likes/
│   │   ├── videos/
│   │   └── covers/
│   ├── Favorites/
│   │   ├── videos/
│   │   └── covers/
│   └── Following/
│       ├── Avatars/
│       └── {authorId}/
│           ├── videos/
│           └── covers/
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Linting**: Biome

## License

MIT
