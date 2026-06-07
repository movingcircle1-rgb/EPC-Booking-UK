/*
  # Fix Quote Requests RLS for Anonymous Submissions

  1. Problem
    - Anonymous users cannot submit quote forms
    - INSERT policy exists but may be missing WITH CHECK clause
    
  2. Solution
    - Drop existing INSERT policy
    - Create new INSERT policy that allows both anonymous and authenticated users
    - Add WITH CHECK clause to allow data insertion
    
  3. Security
    - Anyone can submit quotes (required for public quote form)
    - Only authenticated users can view their own quotes
    - Only staff/admin can view all quotes
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON quote_requests;

-- Create new INSERT policy that allows anonymous submissions
CREATE POLICY "Allow anonymous quote submissions"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure authenticated users can also insert
CREATE POLICY "Allow authenticated quote submissions"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;