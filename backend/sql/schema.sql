-- Database Schema for Email Builder Templates
-- Run this SQL directly in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  mjml TEXT,
  html TEXT,
  css TEXT,
  components JSONB,
  styles JSONB,
  assets JSONB,
  thumbnail VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Enable Row Level Security (optional, for multi-tenancy)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Add comment to table
COMMENT ON TABLE templates IS 'Email templates with HTML, CSS, and component data';
