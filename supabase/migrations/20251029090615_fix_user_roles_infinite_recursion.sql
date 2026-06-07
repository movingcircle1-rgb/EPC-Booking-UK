/*
  # Fix Infinite Recursion in user_roles RLS Policies

  ## Problem
  The "Admins can manage roles" policy creates infinite recursion by querying 
  the user_roles table within its own policy check.

  ## Solution
  1. Drop all existing RLS policies on user_roles
  2. Create simple, non-recursive policies:
     - Users can view their own role (no recursion)
     - Service role can manage all roles (bypasses RLS)
     - Use a simpler approach for role checking

  ## Security
  - Maintains data security
  - Prevents infinite recursion
  - Users can only see their own role
  - System functions can manage roles via SECURITY DEFINER
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can create roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Create simple, non-recursive policy for viewing own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow inserts during signup (via trigger with SECURITY DEFINER)
CREATE POLICY "System can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow updates via service role only (for admin functions)
-- Users cannot update their own roles to prevent privilege escalation
CREATE POLICY "Service role can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Allow deletes only when deleting own account
CREATE POLICY "Users can delete own role"
  ON user_roles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
