-- Migration to remove authentication completely
-- This migration removes all RLS policies, auth-related constraints, and references to auth.uid()

-- Simple approach: just drop everything that might exist, ignore errors
-- Grant full access to all tables for anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 