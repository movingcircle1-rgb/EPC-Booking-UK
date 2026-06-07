/*
  # Disable RLS on Quotations Table

  1. Changes
    - Temporarily disable RLS completely on quotations
    - Remove all policies
    - Allow anon access for debugging

  2. Security Note
    - This is for debugging only
    - Will re-enable proper RLS once issue is identified
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view all quotations" ON quotations;
DROP POLICY IF EXISTS "Allow users to update quotations" ON quotations;
DROP POLICY IF EXISTS "Allow admins full access" ON quotations;
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;
DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;

-- Disable RLS completely
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
