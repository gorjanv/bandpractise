# Environment Variables Setup

This file contains instructions for setting up your environment variables.

## Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish initializing
4. Go to **Settings** → **API**
5. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 2: Create Environment File

Create a file named `.env.local` in the root of the project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Supabase Project URL
- `your_anon_key_here` with your Supabase anon public key

## Step 3: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** to execute the SQL
5. Verify the tables were created by checking **Table Editor** - you should see `songs` and `votes` tables

## Step 4: Verify Setup

1. Make sure `.env.local` is in your `.gitignore` (it should be by default)
2. Restart your development server if it's running:
   ```bash
   npm run dev
   ```
3. The app should now connect to your Supabase database

## Troubleshooting

### "Supabase URL and Anon Key must be provided" warning
- Make sure your `.env.local` file exists in the project root
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env.local`

### Database connection errors
- Verify your Supabase project is active (not paused)
- Check that you've run the SQL schema from `supabase/schema.sql`
- Make sure your Supabase project allows connections from your IP

### Real-time not working
- Ensure Row Level Security (RLS) policies are set up correctly (the schema.sql includes these)
- Check that your Supabase project has real-time enabled (it should be by default)

