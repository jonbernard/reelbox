# Reelbox

A self-hosted vertical video viewer for browsing [myfaveTT](https://github.com/myfaveTT) archives. Scroll through your saved videos in a mobile-friendly, full-screen feed with filtering, creator browsing, and keyboard navigation.

## Features

- **Vertical scroll feed** with snap scrolling and infinite pagination
- **Filter views** — Liked, Favorites, Following, or All videos
- **Creator browsing** — filter Following videos by specific creator
- **Full-screen video player** with progress bar, seeking, and play/pause
- **Action rail** — like, save, share, and mute buttons
- **Video overlay** — creator info, expandable captions, like/view counts
- **Keyboard navigation** — `j`/`k` or arrow keys to scroll, `m` to mute, `Space` to play/pause
- **Mobile-optimized** — touch gestures, safe area inset support for notched devices
- **Autoplay handling** — respects browser autoplay policies with muted fallback
- **File watcher** — automatically imports new videos added to the export directory
- **Deep linking** — URLs update to reflect the current video for direct sharing
- **Range request support** — efficient video seeking via HTTP 206 partial content
- **Docker-ready** — single image runs as app, watcher, or one-off import

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 16 (standalone output) |
| UI        | React 19, Tailwind CSS 4       |
| Database  | PostgreSQL 16                  |
| ORM       | Prisma 6                       |
| Linting   | Biome                          |
| Testing   | Vitest, React Testing Library  |
| Runtime   | Node.js 20                     |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 16+
- A [myfaveTT](https://github.com/myfaveTT) export folder

## Quick Start (Local Development)

1. **Clone and install:**

```bash
git clone https://github.com/jonbernard/reelbox.git
cd reelbox
npm install
```

2. **Start the database:**

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL 16 container on `localhost:5432`.

3. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` — set `VIDEO_BASE_PATH` and `MYFAVETT_EXPORT_PATH` to your myfaveTT export folder:

```
DATABASE_URL=postgresql://reelbox:reelbox@localhost:5432/reelbox
VIDEO_BASE_PATH=/path/to/myfavett/export
MYFAVETT_EXPORT_PATH=/path/to/myfavett/export
```

4. **Set up the database and import:**

```bash
npx prisma generate
npx prisma db push
npm run import
```

5. **Start the dev server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To stop the database: `docker compose -f docker-compose.dev.yml down` (data persists in a volume). To wipe it: add `-v`.

## Docker Deployment

The project publishes a single Docker image to GitHub Container Registry. The same image runs as the app server, the file watcher, or a one-off import — controlled by the command.

### Using Docker Compose

1. **Create a `.env` file** next to `docker-compose.yml`:

```
EXPORT_PATH=/path/to/your/myfavett/export
```

2. **Start the stack:**

```bash
docker compose up -d
```

This starts three services:

| Service   | Purpose                                                   |
| --------- | --------------------------------------------------------- |
| `app`     | Next.js server on port 3000                               |
| `watcher` | Monitors export directory for new videos and auto-imports |
| `db`      | PostgreSQL 16 with persistent volume                      |

Database migrations and an initial import run automatically on each container start via the entrypoint.

3. **Run a one-off import** (if needed):

```bash
docker compose run --rm app npx tsx scripts/import.ts
```

### Portainer Deployment

1. Create a new **Stack** in Portainer
2. Paste the contents of `docker-compose.yml`
3. Add the environment variable `EXPORT_PATH` pointing to your myfaveTT export directory on the host
4. Deploy the stack

### Building the Image Locally

```bash
docker build -t reelbox .
```

Run it standalone (requires an external PostgreSQL instance):

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/reelbox \
  -e VIDEO_BASE_PATH=/videos \
  -e MYFAVETT_EXPORT_PATH=/videos \
  -v /path/to/export:/videos:ro \
  reelbox
```

## CI/CD

The GitHub Actions workflow runs on every push and pull request to `main`:

- **Lint** — Biome check
- **Type Check** — `tsc --noEmit`

On push to `main` (after all checks pass), the workflow builds and pushes the Docker image to `ghcr.io/jonbernard/reelbox` tagged with both `latest` and the git SHA.

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start development server             |
| `npm run build`       | Build for production                 |
| `npm run start`       | Start production server              |
| `npm run lint`        | Run Biome linter                     |
| `npm run lint:fix`    | Auto-fix lint issues                 |
| `npm run format`      | Format code with Biome               |
| `npm run test`        | Run tests                            |
| `npm run test:watch`  | Run tests in watch mode              |
| `npm run import`      | Import myfaveTT export to database   |
| `npm run watch`       | Watch for new videos and auto-import |
| `npm run db:generate` | Generate Prisma client               |
| `npm run db:push`     | Push schema to database              |
| `npm run db:studio`   | Open Prisma Studio                   |

## Environment Variables

| Variable               | Description                                 | Default    |
| ---------------------- | ------------------------------------------- | ---------- |
| `DATABASE_URL`         | PostgreSQL connection string                | _required_ |
| `VIDEO_BASE_PATH`      | Path to video files (used by the media API) | `/videos`  |
| `MYFAVETT_EXPORT_PATH` | Path to myfaveTT export folder              | _required_ |

## Keyboard Shortcuts

| Key               | Action         |
| ----------------- | -------------- |
| `j` / `ArrowDown` | Next video     |
| `k` / `ArrowUp`   | Previous video |
| `m`               | Toggle mute    |
| `Space` / `Enter` | Play / Pause   |

## myfaveTT Export Structure

The importer expects this folder structure from a [myfaveTT](https://github.com/myfaveTT) export:

```
export/
├── Archive.html
└── data/
    ├── .appdata/
    │   ├── db_videos.js
    │   ├── db_authors.js
    │   ├── db_texts.js
    │   ├── db_likes.js
    │   ├── db_bookmarked.js
    │   ├── db_following.js
    │   └── facts.json
    ├── Likes/
    │   ├── videos/
    │   └── covers/
    ├── Favorites/
    │   ├── videos/
    │   └── covers/
    └── Following/
        ├── Avatars/
        └── {authorId}/
            ├── videos/
            └── covers/
```

## Troubleshooting

### Connection refused / reset when accessing the app

If the app container logs show "Ready" but you can't connect from the host, Docker may have assigned a network subnet that overlaps with your LAN. Check the container's network with `docker inspect <container>` — if the `Gateway` or `IPAddress` falls within your local network range (e.g., `192.168.x.x`), there's a conflict.

Fix this by specifying a non-conflicting subnet in `docker-compose.yml`:

```yaml
networks:
  reelbox-network:
    driver: bridge
    ipam:
      config:
        - subnet: 10.100.0.0/24
```

You'll need to tear down the stack and redeploy for the network change to take effect.

## License

MIT
