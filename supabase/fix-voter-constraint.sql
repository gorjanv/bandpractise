-- Quick fix for the vote/voter NOT NULL constraint errors
-- Run this in your Supabase SQL Editor if you're getting constraint errors

-- Make voter column nullable
ALTER TABLE votes ALTER COLUMN voter DROP NOT NULL;

-- Make vote column nullable (it's deprecated, we use rating now)
ALTER TABLE votes ALTER COLUMN vote DROP NOT NULL;

-- Verify the changes (optional - you can check in Table Editor)
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'votes' AND column_name IN ('voter', 'vote');

