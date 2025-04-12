# Warplet Top Traders App - Deployment Summary

## Architecture Overview

This application follows a serverless architecture designed for Vercel deployment with the following components:

1. **Single API Handler**: All API functionality is consolidated into one serverless function to stay within Vercel Hobby plan limits
2. **Static Web Interface**: Simple HTML/CSS interface for browser viewing
3. **Warpcast Frame Integration**: Frame metadata and endpoints for Warpcast platform integration
4. **Database Storage**: PostgreSQL (Neon.tech) for data persistence
5. **External API Integration**: Neynar API for social data and Dune Analytics for trading data

## Key Deployment Optimizations

### 1. Function Consolidation

We've reduced the number of serverless functions from 15+ down to 1 by:
- Using a single entry point (`api/all-routes.js`) that routes internally based on path
- Implementing path-based routing within this handler
- Defining response generators for each endpoint type

### 2. Simplified Build Process

We've optimized the build and deployment:
- Skipping the standard build step (not needed for serverless functions)
- Using `.vercelignore` to exclude unnecessary files
- Customizing installation to only include production dependencies

### 3. Dynamic Data Handling

The application dynamically fetches:
- Warpcast following data from Neynar API
- Trading performance data from Dune Analytics
- User addresses from your Warplet connected friends

## Live Deployment

The app is deployed at:
https://topwarplettraders.vercel.app/

## Frame URL

The Warpcast Frame can be accessed via:
https://topwarplettraders.vercel.app/

## Implementation Details

### Frame Functionality

The app provides three interactive buttons:
1. **24h View**: Shows 24-hour performance data
2. **7d View**: Shows 7-day performance data 
3. **Share**: Allows sharing results via Warpcast composer

### API Endpoints

All endpoints are handled by the single consolidated handler:
- `/api/all-routes` - Main entry point
- `/api/frame-action` → Redirected to main handler
- `/api/health` → Redirected to main handler
- `/api/minimal` → Redirected to main handler

### Technologies Used

- Express.js for API handling
- Neynar API for Warpcast data
- Dune Analytics API for trading data
- PostgreSQL/Neon for persistence
- Vercel for hosting and serverless functions