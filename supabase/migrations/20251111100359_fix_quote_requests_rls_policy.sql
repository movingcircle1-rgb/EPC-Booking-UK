/*
  # Fix Quote Requests RLS Policy for Anonymous Submissions

  1. Changes
    - Drop duplicate public INSERT policies
    - Create a single, clear policy for anonymous quote submissions
    - Ensure anon role can insert quote requests

  2. Security
    - Allow anonymous users to submit quotes
    - Maintain existing policies for authenticated users
*/

-- Drop the duplicate policies
DROP POLICY IF EXISTS "quotes_insert_public" ON quote_requests;
DROP POLICY IF EXISTS "Public submit quote requests" ON quote_requests;

-- Create a single, clear policy for anonymous quote submissions
CREATE POLICY "allow_anonymous_quote_submission" 
ON quote_requests
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Ensure the policy allows both anonymous and authenticated users
COMMENT ON POLICY "allow_anonymous_quote_submission" ON quote_requests 
IS 'Allows both anonymous and authenticated users to submit quote requests';
