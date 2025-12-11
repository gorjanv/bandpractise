# Authentication Setup Guide

This guide will help you set up authentication for your Band Practise app using Supabase Auth.

## Step 1: Enable Authentication in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider (it should be enabled by default)
4. Optionally configure:
   - **Email confirmation**: Toggle on/off as needed
   - **Password requirements**: Adjust minimum length if desired

## Step 2: Update Database Schema

### Option A: Fresh Install (New Database)

If you haven't created the tables yet, run the updated `supabase/schema.sql` file in your SQL Editor. This includes authentication support.

### Option B: Existing Database (Migration)

If you already have tables created, run the migration script:

1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `supabase/migration-auth.sql`
3. Run the SQL
4. This will:
   - Add `user_id` columns to both tables
   - Add `added_by_name` column to songs
   - Update unique constraints
   - Update RLS policies to require authentication

## Step 3: Verify RLS Policies

After running the migration, verify that the Row Level Security policies are correct:

1. Go to **Table Editor** → Select a table (songs or votes)
2. Click on **Policies** tab
3. You should see policies that check `auth.uid()` for inserts/updates

## Step 4: Test Authentication

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. You should see a login/signup modal
4. Create a new account or sign in
5. Try adding a song and voting - it should work!

## How It Works

- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Existing users can sign in with their credentials
- **Authentication State**: The app automatically tracks login state
- **Protected Actions**: Adding songs and voting require authentication
- **User Identification**: Songs and votes are linked to user IDs

## Troubleshooting

### "Unauthorized" errors when adding songs/voting
- Make sure you're signed in
- Check that the database migration ran successfully
- Verify RLS policies are set up correctly

### Authentication modal doesn't appear
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure Supabase Auth is enabled in your project

### Can't sign up
- Check that Email provider is enabled in Supabase
- Verify email confirmation settings (try disabling if testing)
- Check Supabase logs for errors

### Users can't vote/add songs
- Verify the migration added `user_id` columns
- Check that RLS policies require `auth.uid() = user_id`
- Make sure API routes are receiving auth headers

## Security Notes

- All API routes now require authentication
- Users can only modify their own votes
- User IDs are automatically set by Supabase Auth
- RLS policies enforce data access rules at the database level


