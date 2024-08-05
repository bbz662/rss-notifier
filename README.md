# RSS Discord Notifier

This project is a Cloudflare Worker that checks RSS feeds and sends notifications to Discord when new items are found.

## Project Structure

- `src/`
  - `index.ts`: Main entry point for the worker
  - `FeedManager.ts`: Manages feed operations
  - `jobs/`
    - `RssFeedChecker.ts`: Checks RSS feeds for new items
    - `DiscordNotifier.ts`: Sends notifications to Discord
- `migrations/`: SQL migration files for database schema
- `tsconfig.json`: TypeScript configuration
- `package.json`: Node.js project configuration
- `wrangler.toml.example`: Example configuration for Cloudflare Workers

## Setup

1. Install dependencies:
```
npm install
npm install -g wrangler
wrangler login
```
2. Copy `wrangler.toml.example` to `wrangler.toml` and fill in your database ID and other necessary information.
3. Set up your D1 database:
```
wrangler d1 create rss-db
wrangler d1 migrations apply rss-db --remote
```
4. Deploy the worker:
```
wrangler deploy
```

## Usage

The worker exposes the following endpoints:

- `POST /add-feed`: Add a new RSS feed
```
curl -X POST https://your-domain/add-feed -H "Content-Type: application/json" -d '{"feedUrl": "https://example.co/rss-feed"}'
```
- `GET /list-feeds`: List all added feeds
```
curl https://your-domain/list-feeds
```
- `GET /feed-check`: Manually trigger a feed check
```
curl https://your-domain/feed-check
```

The worker is also scheduled to run every 15 minutes to check for new RSS items.

## Configuration

Make sure to set the following in your `wrangler.toml`:

- `DISCORD_WEBHOOK`: Your Discord webhook URL for notifications
