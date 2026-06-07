/*
  # Add Admin2 Update Access to Quote Requests

  1. Changes
    - Grant admin-2 role UPDATE access to quote_requests table
    - Allow admin2 to accept or reject quote requests

  2. Security
    - Admin-2 can view and update quote requests
    - Admin-2 cannot delete quote requests
*/

-- Add UPDATE policy for quote_requests
DROP POLICY IF EXISTS "admin2_update_quote_requests" ON quote_requests;
CREATE POLICY "admin2_update_quote_requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );
