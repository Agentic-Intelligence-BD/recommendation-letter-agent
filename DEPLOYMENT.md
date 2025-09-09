# Vercel Deployment Guide

## Fixed Issues

### 1. Prisma Binary Target Issue ✅
- **Problem**: `PRISMA_QUERY_ENGINE_LIBRARY` references missing secret
- **Solution**: 
  - Removed problematic env var from `vercel.json`
  - Added `binaryTargets = ["native", "rhel-openssl-1.0.x"]` to `schema.prisma`
  - Regenerated Prisma client

### 2. Environment Variables Required

Set these in your Vercel dashboard (Settings > Environment Variables):

```bash
# Required
DATABASE_URL=your-production-database-url
JWT_SECRET=your-super-secure-jwt-secret-here

# Optional
NEXTAUTH_URL=https://your-app.vercel.app
```

## Database Setup for Production

### Option 1: PostgreSQL (Recommended)
1. Create a PostgreSQL database (e.g., Neon, Supabase, or Vercel Postgres)
2. Update your DATABASE_URL to the PostgreSQL connection string
3. Update `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### Option 2: Keep SQLite (Not recommended for production)
- SQLite works for development but has limitations on Vercel
- File system is read-only on Vercel's serverless functions

## Deploy Steps

1. **Push changes to GitHub**
2. **Connect to Vercel**
3. **Set environment variables in Vercel dashboard**
4. **Deploy**

The build command in `package.json` is already configured:
```json
"build": "prisma generate && next build"
```

## Troubleshooting

If you still get Prisma errors:
1. Ensure `DATABASE_URL` is set in Vercel environment variables
2. Make sure the database is accessible from Vercel's servers
3. Check that `prisma generate` runs during build (it should with current config)