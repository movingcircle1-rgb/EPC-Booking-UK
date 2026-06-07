/*
  # Add Admin2 Access to Quotations and Packaging Orders

  1. Changes
    - Grant admin2 role SELECT access to quote_requests table
    - Grant admin2 role SELECT, UPDATE access to quotations table
    - Grant admin2 role SELECT, UPDATE access to packaging_orders table
    - Add RLS policies for admin2 role

  2. Security
    - Admin2 can view and manage quotations
    - Admin2 can view and manage packaging orders
    - Admin2 can view quote requests but not delete
*/

-- Add policies for quote_requests (read-only for admin2)
DROP POLICY IF EXISTS "admin2_view_quote_requests" ON quote_requests;
CREATE POLICY "admin2_view_quote_requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Add policies for quotations (read and update for admin2)
DROP POLICY IF EXISTS "admin2_view_quotations" ON quotations;
CREATE POLICY "admin2_view_quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

DROP POLICY IF EXISTS "admin2_update_quotations" ON quotations;
CREATE POLICY "admin2_update_quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Add policies for packaging_orders (read and update for admin2)
DROP POLICY IF EXISTS "admin2_view_packaging_orders" ON packaging_orders;
CREATE POLICY "admin2_view_packaging_orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

DROP POLICY IF EXISTS "admin2_update_packaging_orders" ON packaging_orders;
CREATE POLICY "admin2_update_packaging_orders"
  ON packaging_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_status_created 
  ON quotations(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_packaging_orders_status_created 
  ON packaging_orders(status, created_at DESC);
