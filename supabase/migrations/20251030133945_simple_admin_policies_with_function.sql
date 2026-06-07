/*
  # Simple Admin Policies Using Security Definer Function

  ## Overview
  Creates a SECURITY DEFINER function that can check admin status without
  triggering infinite recursion, then uses it in RLS policies.

  ## Strategy
  1. Create a cached function to check if user is admin
  2. Use this function in policies
  3. Avoids recursion by using SECURITY DEFINER

  ## Security
  - Function bypasses RLS for the admin check only
  - Policies still enforce proper access control
*/

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_is_admin TO authenticated;

-- SELECT policy: users see own data, admins see all
CREATE POLICY "select_own_or_if_admin"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    public.check_is_admin(auth.uid())
  );

-- UPDATE policy: users update own data, admins update any
CREATE POLICY "update_own_or_if_admin"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    public.check_is_admin(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    public.check_is_admin(auth.uid())
  );
