/*
  # Fix Quotations RLS with JWT Email

  1. Changes
    - Use auth.jwt() to get email from JWT token
    - Remove casting issues
    - Simplify policy structure

  2. Security
    - Users see only their quotations
    - Admin/staff see all quotations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;

-- Create policy using JWT email without casting
CREATE POLICY "Users can view their quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (auth.jwt() ->> 'email')
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Update policy
CREATE POLICY "Clients can update quotation acceptance"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (customer_email = (auth.jwt() ->> 'email'))
  WITH CHECK (customer_email = (auth.jwt() ->> 'email'));
