-- SQL script to remove the 30-day login logs cleanup function
-- Run this in your Supabase SQL editor if you want to remove the cleanup functionality

-- Drop the cleanup function if it exists
DROP FUNCTION IF EXISTS cleanup_old_login_logs();

-- If you had set up the cron job, remove it (uncomment the line below)
-- SELECT cron.unschedule('cleanup-login-logs');

-- Note: This will remove the automatic cleanup functionality
-- Your login logs will now be kept indefinitely unless manually deleted
-- You can always re-add the cleanup function later by running the main supabase-setup.sql script