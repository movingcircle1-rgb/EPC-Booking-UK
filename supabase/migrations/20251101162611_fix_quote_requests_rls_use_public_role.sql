/*
  # Fix Quote Requests RLS - Use PUBLIC role

  1. Issue
    - Policy for anon/authenticated not working
    - Need to use PUBLIC role which includes everyone
    
  2. Solution
    - Drop current INSERT policy
    - Create new policy using TO public (includes anon + authenticated + all roles)
    - This is the standard way to allow anonymous access in Supabase
*/

-- Drop the current INSERT policy
DROP POLICY IF EXISTS "quotes_allow_insert_public" ON quote_requests;

-- Create policy for PUBLIC role (includes anon and authenticated)
CREATE POLICY "quotes_insert_public"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);