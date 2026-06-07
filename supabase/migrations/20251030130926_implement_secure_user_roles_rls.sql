/*
  # Implement Secure RLS for user_roles Without Recursion

  ## Overview
  Creates a secure RLS system for user_roles that avoids infinite recursion
  by using security definer functions and simple policies.

  ## Strategy
  1. Keep RLS disabled for now (already done)
  2. Users can only read their own role directly via user_id match
  3. All admin operations go through secure functions
  4. Frontend uses client-side Supabase which respects policies

  ## Security Notes
  - Users can only see their own role
  - No recursive checks needed
  - Service role has full access for admin operations
*/

-- Re-enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Service role full access" ON user_roles;
DROP POLICY IF EXISTS "Check admin status" ON user_roles;

-- Policy 1: Users can ONLY view their own role (no recursion)
CREATE POLICY "user_view_own_role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own role during signup (no recursion)
CREATE POLICY "user_insert_own_role"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own profile info (not role)
CREATE POLICY "user_update_own_profile"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() 
    AND role = (SELECT role FROM user_roles WHERE user_id = auth.uid())
  );

-- Create a secure function to get user role (for admin dashboard)
CREATE OR REPLACE FUNCTION get_all_user_roles()
RETURNS TABLE (
  user_id uuid,
  role text,
  full_name text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT ur.role INTO current_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();

  -- Only allow admins to see all roles
  IF current_user_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      ur.user_id,
      ur.role,
      ur.full_name,
      ur.phone,
      ur.created_at,
      ur.updated_at
    FROM user_roles ur
    ORDER BY ur.created_at DESC;
  ELSE
    -- Non-admins only see their own role
    RETURN QUERY
    SELECT 
      ur.user_id,
      ur.role,
      ur.full_name,
      ur.phone,
      ur.created_at,
      ur.updated_at
    FROM user_roles ur
    WHERE ur.user_id = auth.uid();
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_user_roles() TO authenticated;
