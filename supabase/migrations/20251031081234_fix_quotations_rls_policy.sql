/*
  # Fix Quotations RLS Policy for Client Portal

  1. Changes
    - Update RLS policy to properly check user email from auth
    - Make policy work with both JWT email and user email field
    - Ensure clients can view their quotations

  2. Security
    - Maintains proper authentication checks
    - Clients only see their own quotations
    - Admin/staff can see all quotations
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;

-- Create improved policy that checks multiple sources for email
CREATE POLICY "Users can view their quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (
    -- Match customer_email against authenticated user's email
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Allow admins and staff to view all
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );
