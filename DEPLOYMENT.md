# 🚀 Deployment Guide

This guide will help you add your project to GitHub and deploy it to production.

## Step 1: Add to GitHub

### 1.1 Initialize Git (if not already done)

```bash
git init
```

### 1.2 Create a .gitignore (already exists, but verify)

Make sure `.gitignore` includes:
- `node_modules/`
- `.env*` (environment files)
- `.next/`
- `.vercel/`

Your project already has a proper `.gitignore` file.

### 1.3 Stage and Commit Files

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Band Practise voting app"
```

### 1.4 Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it (e.g., `band-practise-voting` or `band-voting-app`)
4. **DO NOT** initialize with README, .gitignore, or license (you already have these)
5. Click "Create repository"

### 1.5 Push to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename main branch if needed (if you're on 'master')
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel (Recommended for Next.js)

Vercel is the easiest and best option for Next.js apps. It's made by the Next.js team.

### 2.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### 2.2 Import Your Repository

1. In Vercel dashboard, click "Add New..." → "Project"
2. Find your `band-practise-voting` repository
3. Click "Import"

### 2.3 Configure Environment Variables

**IMPORTANT:** Before deploying, you MUST add your Supabase credentials:

1. In the "Configure Project" screen, scroll down to "Environment Variables"
2. Add these two variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   Value: Your Supabase anon/public key

3. You can find these in your Supabase dashboard:
   - Go to [supabase.com](https://supabase.com) → Your Project
   - Settings → API
   - Copy "Project URL" and "anon public" key

### 2.4 Deploy

1. Click "Deploy"
2. Wait 1-2 minutes for the build to complete
3. Vercel will give you a URL like: `https://your-app.vercel.app`

### 2.5 Update Supabase Settings (Important!)

1. Go to your Supabase dashboard
2. Settings → API
3. Under "Site URL" or "Redirect URLs", add your Vercel URL:
   - `https://your-app.vercel.app`
4. This allows authentication to work on your deployed site

## Step 3: Alternative Hosting Options

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repo
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variables in Site settings → Environment variables
7. Deploy!

### Railway

1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway will automatically detect Next.js and deploy

### Self-Hosting (Advanced)

If you want to host on your own server:

```bash
# Build the app
npm run build

# Start production server
npm start
```

You'll need to:
- Set up a Node.js server
- Configure environment variables
- Set up a reverse proxy (nginx)
- Handle SSL certificates

## Step 4: Database Setup (One-Time)

Make sure you've run all the SQL migrations on your Supabase database:

1. Go to Supabase → SQL Editor
2. Run these files in order (if not already done):
   - `supabase/schema.sql` (main schema)
   - `supabase/migration-auth.sql` (authentication)
   - `supabase/migration-rating.sql` (rating system)
   - `supabase/migration-voter-name.sql` (voter names)

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Try signing up/logging in
3. Add a song
4. Vote on a song
5. Check the dashboard

Everything should work exactly like your local version!

## Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Make sure TypeScript errors are resolved
- Verify environment variables are set correctly

### Authentication Not Working

- Verify Supabase URL is added to "Redirect URLs" in Supabase dashboard
- Check environment variables are set correctly in Vercel
- Make sure email provider is enabled in Supabase Auth settings

### Database Connection Issues

- Verify your Supabase project is active (not paused)
- Check environment variables match your Supabase credentials
- Ensure RLS policies are set up correctly

### Real-time Not Working

- Check Supabase real-time is enabled (Settings → API)
- Verify RLS policies allow reads
- Check browser console for errors

## Updating Your Deployment

Whenever you push changes to GitHub:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. Vercel automatically deploys (if you enabled auto-deploy)
4. Or manually trigger deployment in Vercel dashboard

## Custom Domain (Optional)

1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate to provision (automatic)

## Environment Variables Reference

Make sure these are set in your hosting platform:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public key | Supabase → Settings → API → anon public key |

**Note:** These are public keys, so it's safe to commit them to GitHub if needed (though .env files are excluded).

## Security Checklist

- ✅ Environment variables are set in hosting platform (not in code)
- ✅ `.env.local` is in `.gitignore`
- ✅ Supabase RLS policies are enabled
- ✅ Authentication redirect URLs are configured
- ✅ Database credentials are secure (never commit secrets)

## Need Help?

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)


