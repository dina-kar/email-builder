-- Migration: Update thumbnail column from VARCHAR(255) to TEXT
-- This allows storing base64 encoded images which are typically thousands of characters long
-- Run this in your database to fix the "value too long" error

-- Update the thumbnail column type
ALTER TABLE templates 
ALTER COLUMN thumbnail TYPE TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN templates.thumbnail IS 'Base64 encoded thumbnail image or URL to thumbnail';
