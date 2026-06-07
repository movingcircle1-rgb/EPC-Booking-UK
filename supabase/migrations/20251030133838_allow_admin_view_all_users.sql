/*
  # Allow Admin to View All Users

  ## Overview
  Updates RLS policies on user_roles table to allow admins to view all users
  while regular users can only see their own role.

  ## Changes
  1. Drop existing restrictive SELECT policy
  2. Create new policy that allows:
     - Regular users to see their own role
     - Admins to see all roles

  ## Security
  - Non-admins can only see their own data
  - Admins can see all users for management purposes
*/

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "user_view_own_role" ON user_roles;

-- Create new policy that allows admins to see all, others see only their own
CREATE POLICY "users_view_policy"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );

-- Also update the UPDATE policy to allow admins to update any user
DROP POLICY IF EXISTS "user_update_own_profile" ON user_roles;

CREATE POLICY "users_update_policy"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );
