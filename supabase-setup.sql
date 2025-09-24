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