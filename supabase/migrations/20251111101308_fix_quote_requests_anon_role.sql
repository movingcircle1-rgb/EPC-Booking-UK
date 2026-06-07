/*
  # Fix Quote Requests - Explicit Anon Role Policy

  1. Changes
    - Drop existing INSERT policy
    - Create explicit policy for anon role
    - Grant necessary permissions to anon role
    
  2. Security
    - Explicitly allow anon role to insert quotes
*/

-- Drop existing policy
DROP POLICY IF EXISTS "quote_requests_allow_all_inserts" ON quote_requests;

-- Create explicit policy for anon role
CREATE POLICY "anon_insert_quotes" 
ON quote_requests
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create explicit policy for authenticated users
CREATE POLICY "authenticated_insert_quotes" 
ON quote_requests
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure anon role has INSERT permission on the table
GRANT INSERT ON quote_requests TO anon;
GRANT INSERT ON quote_requests TO authenticated;

-- Also ensure anon can use the sequence for the ID
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
