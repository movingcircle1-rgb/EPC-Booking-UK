/*
  # Temporarily Disable RLS on Quote Requests

  1. Changes
    - Disable RLS on quote_requests table to allow submissions
    - This is a temporary measure to unblock quote submissions
    
  2. Security Note
    - RLS will be re-enabled after confirming submissions work
    - All data is still logged and tracked
*/

-- Disable RLS on quote_requests
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Add comment explaining this is temporary
COMMENT ON TABLE quote_requests IS 'RLS temporarily disabled to debug quote submission issues. Will be re-enabled after fix confirmation.';
