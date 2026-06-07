/*
  # Completely Fix Quote Requests RLS for Anonymous Submissions

  1. Changes
    - Drop and recreate RLS policy to be completely permissive for inserts
    - Ensure foreign key constraints allow NULL
    - Add policy that bypasses all RLS checks for anonymous submissions

  2. Security
    - Allow completely open INSERT for anonymous users
    - Maintain existing SELECT/UPDATE/DELETE policies
*/

-- Temporarily disable RLS to ensure we can make changes
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "allow_anonymous_quote_submission" ON quote_requests;
DROP POLICY IF EXISTS "quotes_insert_public" ON quote_requests;
DROP POLICY IF EXISTS "Public submit quote requests" ON quote_requests;

-- Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create a completely permissive INSERT policy for both anon and authenticated users
CREATE POLICY "quote_requests_allow_all_inserts" 
ON quote_requests
FOR INSERT 
TO public
WITH CHECK (true);

-- Verify that foreign keys allow NULL (they should based on schema check)
-- No changes needed as they're already nullable

-- Add comment for clarity
COMMENT ON POLICY "quote_requests_allow_all_inserts" ON quote_requests 
IS 'Allows anyone (anonymous or authenticated) to submit quote requests without restrictions';
