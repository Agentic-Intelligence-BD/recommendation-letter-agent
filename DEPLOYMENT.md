# 🚀 Deployment Guide - Recommendation Letter Assistant

## Quick Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)

### 1. Prepare Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js app
5. Click "Deploy"

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### 3. Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables:

```env
# REQUIRED - Generate new secret for production
JWT_SECRET=b155a5304320b72828707be9f64840cc22dd1ffcf170509c8afe9885f26123f488331e70cc588aff21f41896bcb4fe2b4e1f97c5f8ba46ccaf569ebfea33f325

# Your app details
NEXT_PUBLIC_APP_NAME=Recommendation Letter Assistant
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Production environment
NODE_ENV=production
```

### 4. Database Setup

#### Option A: Start with SQLite (Simplest)
- Your app will work immediately with SQLite
- Good for initial testing and small user base
- Add this to Vercel environment variables:
```env
DATABASE_URL=file:./prisma/dev.db
```

#### Option B: Upgrade to PostgreSQL (Recommended for Production)
1. In Vercel dashboard, go to Storage → Create Database → PostgreSQL
2. Copy the provided `DATABASE_URL`
3. Add to environment variables:
```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### 5. Custom Domain (Optional)
1. In Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔧 Environment Variables Reference

### Required Variables
- `JWT_SECRET` - Authentication secret (use generated one above)
- `DATABASE_URL` - Database connection string

### Optional Variables (Future Features)
- `OPENAI_API_KEY` - For AI letter generation
- `ANTHROPIC_API_KEY` - Alternative AI provider
- `EMAIL_SERVER_*` - For email notifications

## 🐛 Troubleshooting

### Build Failures
- Check that all dependencies are in package.json
- Ensure Prisma schema is valid
- Verify environment variables are set

### Database Issues
- Make sure DATABASE_URL is correctly formatted
- For PostgreSQL, ensure SSL mode is enabled
- Check that schema migrations ran successfully

### Authentication Issues
- Verify JWT_SECRET is set and secure
- Check that userType is properly handled in token payload

## 📈 Performance Tips

### Optimize for Production
- Images are already optimized with Next.js Image component
- API routes have proper error handling
- Database queries are optimized with Prisma

### Monitoring
- Use Vercel Analytics (built-in)
- Monitor function execution times
- Set up error tracking if needed

## 🔄 Updates and Maintenance

### Deploying Updates
1. Make changes locally
2. Test thoroughly in development
3. Commit and push to main branch
4. Vercel automatically deploys new versions

### Database Migrations (when using PostgreSQL)
```bash
# Create migration
npx prisma migrate dev --name descriptive-name

# Deploy to production
npx prisma migrate deploy
```

## 📞 Support
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs

---
Your app is now ready for production! 🎉