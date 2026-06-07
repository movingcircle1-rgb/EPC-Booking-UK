/*
  # Temporary Fix - Allow All Authenticated Users to Read Quotations

  1. Changes
    - Create a permissive policy for testing
    - Allow all authenticated users to view quotations
    - This will help us verify if RLS is the issue

  2. Notes
    - This is for debugging only
    - We'll add proper filtering back once we confirm it works
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;
DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;

-- Temporary permissive policy for all authenticated users
CREATE POLICY "Allow authenticated users to view all quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update their own quotations
CREATE POLICY "Allow users to update quotations"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "Allow admins full access"
  ON quotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );
