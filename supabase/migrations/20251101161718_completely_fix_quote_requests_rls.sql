/*
  # Completely Fix Quote Requests RLS

  1. Problem
    - Anonymous users getting RLS violation when submitting quotes
    - Policies exist but still blocking inserts
    
  2. Solution
    - Drop ALL existing policies
    - Recreate with proper INSERT policy for anon users
    - Ensure WITH CHECK is properly set
    
  3. Security
    - Anyone (anon/authenticated) can INSERT quotes
    - Only authenticated users can SELECT their own quotes
    - Only staff/admin can SELECT all quotes
    - Only staff/admin can UPDATE quotes
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous quote submissions" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated quote submissions" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Staff can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Staff can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Customers can view their own requests" ON quote_requests;

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (including anonymous) to insert quotes
CREATE POLICY "enable_insert_for_all"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow customers to view their own requests
CREATE POLICY "enable_select_own_requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (auth.jwt() ->> 'email')::text
  );

-- Allow staff and admin to view all requests
CREATE POLICY "enable_select_all_for_staff"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Allow staff and admin to update requests
CREATE POLICY "enable_update_for_staff"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );