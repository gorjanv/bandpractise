-- WARNING: This will delete ALL data from your database!
-- Only run this if you want to completely clear all songs and votes.

-- Option 1: Delete all votes first, then songs
DELETE FROM votes;
DELETE FROM songs;

-- Option 2: Truncate tables (faster, resets any sequences, but requires CASCADE for foreign keys)
-- TRUNCATE TABLE votes CASCADE;
-- TRUNCATE TABLE songs CASCADE;

-- Option 3: Delete only votes (songs will remain)
-- DELETE FROM votes;

-- Option 4: Delete only songs (votes will be automatically deleted due to CASCADE)
-- DELETE FROM songs;

-- Verify deletion
SELECT COUNT(*) as votes_count FROM votes;
SELECT COUNT(*) as songs_count FROM songs;


