# 🎵 Band Practise - Song Voting App

A Tinder-like interface for music bands to vote on songs for their next practise session. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎯 **Swipe Interface**: Swipe left (✕) or right (✓) on songs to vote
- 🎨 **Beautiful UI**: Modern, mobile-friendly interface with smooth animations
- 🎬 **YouTube Integration**: Preview songs directly in the app
- 👥 **Multi-user Support**: Multiple band members can vote simultaneously
- 🔄 **Real-time Updates**: See new songs and votes as they happen
- 📊 **Vote Tracking**: See which songs are most popular

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Your project URL
   - Your `anon` public key

### 3. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL from `supabase/schema.sql` to create the tables:

```sql
-- Copy and paste the entire contents of supabase/schema.sql
```

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Important Notes for Deployment

- Make sure your Supabase project allows connections from your deployment URL
- The database schema must be set up before deployment
- Environment variables must be configured in your hosting platform

## How to Use

1. **Enter Your Name**: When you first open the app, enter your name
2. **Swipe Through Songs**: Swipe right (✓) to vote yes, left (✕) to vote no
3. **Preview Songs**: Tap the "Preview" button to watch/listen on YouTube
4. **Add Songs**: Click "+ Add Song" to add new songs for voting
5. **View Results**: See which songs are most popular in the summary section

## Project Structure

```
├── app/
│   ├── api/          # API routes for songs and votes
│   ├── page.tsx      # Main application page
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── SongCard.tsx      # Swipeable song card
│   └── AddSongModal.tsx  # Modal for adding songs
├── lib/
│   ├── api.ts        # API client functions
│   ├── supabase.ts   # Supabase client configuration
│   ├── storage.ts    # Legacy localStorage (not used)
│   └── youtube.ts    # YouTube URL parsing utilities
├── supabase/
│   └── schema.sql    # Database schema
└── types.ts          # TypeScript type definitions
```

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend database and real-time subscriptions
- **React Hooks** - State management

## License

MIT
