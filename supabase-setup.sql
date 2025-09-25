-- SQL script to create the user_data table in Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Storing unencrypted as requested (not recommended for production)
  user_profile JSONB, -- JSON data from user profile API
  is_premium BOOLEAN DEFAULT FALSE, -- Premium access status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data(email);

-- Create an index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_user_data_created_at ON user_data(created_at);

-- Optional: Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add Row Level Security (RLS) policies if needed
-- ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Migration: Add is_premium column to existing tables (if table already exists)
-- Run this separately if you already created the table without the is_premium column
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Example policy (uncomment if you want to enable RLS)
-- CREATE POLICY "Users can view their own data" ON user_data
--   FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- CREATE POLICY "Users can update their own data" ON user_data
--   FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Create login_logs table to track all login attempts
CREATE TABLE IF NOT EXISTS login_logs (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_attempted TEXT NOT NULL, -- Store the attempted password for debugging
  login_status VARCHAR(20) NOT NULL CHECK (login_status IN ('SUCCESS', 'FAILED')),
  error_message TEXT, -- Store error message for failed attempts
  ip_address VARCHAR(45), -- IPv4 or IPv6 address
  user_agent TEXT, -- Browser/client information
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the login_logs table
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_attempted_at ON login_logs(attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON login_logs(login_status);
CREATE INDEX IF NOT EXISTS idx_login_logs_email_status ON login_logs(email, login_status);

-- Optional: Create a function to clean up old login logs (keep only last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM login_logs 
    WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Example: Schedule cleanup to run daily (you can set this up in Supabase cron jobs)
-- SELECT cron.schedule('cleanup-login-logs', '0 2 * * *', 'SELECT cleanup_old_login_logs();');

-- Drop existing views if they exist to avoid conflicts
DROP VIEW IF EXISTS user_exists CASCADE;
DROP VIEW IF EXISTS user_premium_status CASCADE;

-- Create public views for secure data access
CREATE VIEW user_exists AS
SELECT 
  email,
  true as exists
FROM user_data;

CREATE VIEW user_premium_status AS
SELECT 
  email,
  is_premium
FROM user_data;

-- Grant access to the tables and views
GRANT SELECT ON user_exists TO anon, authenticated;
GRANT SELECT ON user_premium_status TO anon, authenticated;

-- Grant public access to login_logs table for simple logging
GRANT ALL ON login_logs TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE login_logs_id_seq TO anon, authenticated;

GRANT SELECT, INSERT ON user_data TO anon, authenticated;