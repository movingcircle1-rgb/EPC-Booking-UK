/*
  # Simplify Quotations RLS Policy

  1. Changes
    - Drop complex policy with casting
    - Create simple direct comparison policy
    - Use auth.email() helper function for cleaner access

  2. Security
    - Users see only their quotations
    - Admin/staff see all quotations
    - Policy is simpler and more reliable
*/

-- Drop existing view policy
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;

-- Create simpler policy using direct email comparison
CREATE POLICY "Users can view their quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.email()
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Also update the update policy for consistency
DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;

CREATE POLICY "Clients can update quotation acceptance"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (customer_email = auth.email())
  WITH CHECK (customer_email = auth.email());
