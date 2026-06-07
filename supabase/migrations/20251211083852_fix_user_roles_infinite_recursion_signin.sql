/*
  # Fix User Roles Infinite Recursion - Sign In Fix

  ## Problem
  Sign-in failing with "infinite recursion detected in policy for relation 'user_roles'"
  
  The RLS policies on user_roles table were querying the user_roles table itself
  to check if a user is an admin, creating an infinite loop:
  
  1. User tries to sign in
  2. System checks user_roles for permissions
  3. RLS policy triggers and queries user_roles again (to check admin status)
  4. This triggers RLS again → INFINITE RECURSION
  
  ## Solution
  Replace all recursive EXISTS queries with SECURITY DEFINER helper functions
  that bypass RLS when checking admin status.
  
  ## Changes
  1. Create/Update SECURITY DEFINER helper functions
  2. Replace ALL recursive user_roles policies with non-recursive versions
  3. Ensure sign-in works without recursion
*/

-- ============================================================================
-- STEP 1: Create SECURITY DEFINER helper functions (bypass RLS)
-- ============================================================================

-- Helper to check if a user is admin/admin2/temp_admin
CREATE OR REPLACE FUNCTION public.is_privileged_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  -- Query bypasses RLS due to SECURITY DEFINER
  SELECT role INTO user_role_value
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  RETURN user_role_value IN ('admin', 'admin2', 'temp_admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ============================================================================
-- STEP 2: Fix user_roles policies - NO RECURSION
-- ============================================================================

-- Drop ALL existing policies on user_roles
DROP POLICY IF EXISTS "select_own_or_if_admin" ON user_roles;
DROP POLICY IF EXISTS "update_own_or_if_admin" ON user_roles;
DROP POLICY IF EXISTS "user_insert_own_role" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "user_view_own_or_admin_views_all" ON user_roles;

-- SELECT: Users see own role, admins see all (NO RECURSION)
CREATE POLICY "user_roles_select_no_recursion"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own role
    user_id = auth.uid()
    OR
    -- Admins can see all roles (uses SECURITY DEFINER function, no recursion)
    public.is_privileged_admin(auth.uid())
  );

-- UPDATE: Users update own role, admins update all (NO RECURSION)
CREATE POLICY "user_roles_update_no_recursion"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    public.is_privileged_admin(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    public.is_privileged_admin(auth.uid())
  );

-- INSERT: Users can create own role, admins can create any (NO RECURSION)
CREATE POLICY "user_roles_insert_no_recursion"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR
    public.is_privileged_admin(auth.uid())
  );

-- DELETE: Only admins can delete (NO RECURSION)
CREATE POLICY "user_roles_delete_admins_only"
  ON user_roles FOR DELETE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

-- ============================================================================
-- STEP 3: Fix OTHER tables that query user_roles in policies
-- ============================================================================

-- PACKAGING_ORDERS - Fix admin check
DROP POLICY IF EXISTS "Admins view all packaging orders" ON packaging_orders;
CREATE POLICY "Admins view all packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update packaging orders" ON packaging_orders;
CREATE POLICY "Admins update packaging orders"
  ON packaging_orders FOR UPDATE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete packaging orders" ON packaging_orders;
CREATE POLICY "Admins delete packaging orders"
  ON packaging_orders FOR DELETE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

-- QUOTATIONS - Fix admin check
DROP POLICY IF EXISTS "Admins view all quotations" ON quotations;
CREATE POLICY "Admins view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update all quotations" ON quotations;
CREATE POLICY "Admins update all quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins insert quotations" ON quotations;
CREATE POLICY "Admins insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete quotations" ON quotations;
CREATE POLICY "Admins delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

-- LOCATIONS - Fix admin check
DROP POLICY IF EXISTS "Admins can insert locations" ON locations;
CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update locations" ON locations;
CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete locations" ON locations;
CREATE POLICY "Admins can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (public.is_privileged_admin(auth.uid()));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify no policies on user_roles query user_roles
-- All policies should use public.is_privileged_admin() instead

COMMENT ON FUNCTION public.is_privileged_admin IS 
'SECURITY DEFINER function to check admin status without triggering RLS. 
Used in policies to prevent infinite recursion.';
