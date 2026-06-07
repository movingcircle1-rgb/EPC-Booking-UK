/*
  # Fix Admin Dashboard RLS Policies

  ## Overview
  Fixes Row Level Security policies that were preventing admin users from accessing
  dashboard data. The issue was with overly restrictive policies on user_roles table.

  ## Changes Made
  1. Drop conflicting user_roles SELECT policy
  2. Create new comprehensive policy allowing admins to view all users
  3. Ensure admin users can access all necessary tables for dashboard

  ## Security Notes
  - Maintains strict authentication requirements
  - Only admins can view all user data
  - Regular users can still only see their own data
*/

-- Drop the problematic policy that was blocking admin access
DROP POLICY IF EXISTS "Only admins can view admin users" ON user_roles;

-- Create a better policy for user_roles SELECT access
CREATE POLICY "Admins can view all users, users can view own record"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own record
    user_id = auth.uid()
    OR
    -- Admins can view all records
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Ensure admins can update any user role
DROP POLICY IF EXISTS "Service role can update roles" ON user_roles;

CREATE POLICY "Admins can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Ensure admins can insert user roles (for creating new users)
DROP POLICY IF EXISTS "System can insert roles" ON user_roles;

CREATE POLICY "Users can insert own role or admins can insert any"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Verify is_admin function exists and works correctly
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
END;
$$;

-- Verify is_admin_or_staff function exists and works correctly
CREATE OR REPLACE FUNCTION is_admin_or_staff(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'staff')
  );
END;
$$;
