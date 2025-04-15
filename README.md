# Warpcast Top Traders

A mini-app for Warpcast that shows the trading performance of the accounts you follow.

## Features

- Display PnL (Profit and Loss) for the top 5 most active traders among accounts you follow
- Toggle between 24-hour and 7-day time periods
- Share results via Warpcast's cast composer
- Interactive achievement system with badges for different trading milestones
- Beautiful crypto-themed UI with gradient backgrounds and performance indicators

## Technologies Used

- React with TypeScript
- Express.js server
- PostgreSQL database via Neon (serverless PostgreSQL)
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- Framer Motion for animations
- Drizzle ORM for database operations
- Neynar API for Warpcast data
- Dune Analytics API for trading data

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEYNAR_API_KEY` - API key for Neynar (for fetching Warpcast data)
- `DUNE_API_KEY` - API key for Dune Analytics (for fetching trading data)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Add environment variables to a `.env` file in the project root
4. Run the development server: `npm run dev`

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

## Warpcast Frame Approaches

Various approaches have been tested for compatibility with Warpcast frames:

1. **Auto-Detecting Frame** - [/auto-frame.html](https://warplet-traders.vercel.app/auto-frame.html)
   - The most reliable implementation for frame detection.
   - Share with JUST the URL alone, then add a space or modify the text in the composer.
   - Warpcast requires text interaction to trigger frame detection.
   - Uses inline SVG for consistent rendering across platforms.

2. **Frame with URL as Last Line** - [/frame-url-last.html](https://warplet-traders.vercel.app/frame-url-last.html)
   - Alternative implementation with URL as the last line of the share text.
   - Requires manual interaction with the composer for frame detection.

3. **Simple 7d Frame** - [/simple-7d-frame.html](https://warplet-traders.vercel.app/simple-7d-frame.html)
   - Simplified frame with 7-day timeframe data and a single Share button.
   - Updated with newline handling for better compatibility.

4. **Static Frame Pages** - [/final-frame.html](https://warplet-traders.vercel.app/final-frame.html) and [/7d-frame.html](https://warplet-traders.vercel.app/7d-frame.html)
   - Static implementation with separate pages for 24h and 7d views.
   - Updated to use inline SVG instead of remote image URLs.

## Architecture

The application is structured as follows:

- `server/` - Express.js backend
  - `api/` - API routes for data fetching
  - `db.ts` - Database connection
  - `storage.ts` - Data storage interface
- `client/src/` - React frontend
  - `components/` - UI components
  - `lib/` - Utility functions and types
  - `pages/` - Application pages
- `shared/` - Shared types and schemas
- `api/` - Vercel serverless functions

## Credits

Created for Warpcast by a Replit AI assistant.