/*
  # Add admin-2 Role
  
  ## Summary
  Add new 'admin-2' role to the system that has access to:
  - Locations Management (full CRUD)
  - Auto-Linking/Keywords Management (full CRUD)
  
  ## Changes
  1. Add 'admin-2' to role constraint
  2. Update RLS policies to include admin-2
  
  ## Security
  - admin-2 has same access as temp_admin for locations and keywords
  - admin-2 is restricted from all other admin features
*/

-- =====================================================
-- ADD admin-2 TO ROLE CONSTRAINT
-- =====================================================

ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'client', 'partner', 'staff', 'trade', 'temp_admin', 'admin-2'));

-- =====================================================
-- UPDATE RLS POLICIES FOR CITIES
-- =====================================================

DROP POLICY IF EXISTS "Temp admins can view all cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can insert cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can update cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can delete cities" ON cities;

CREATE POLICY "Temp admins can view all cities" ON cities
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can insert cities" ON cities
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can update cities" ON cities
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can delete cities" ON cities
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

-- =====================================================
-- UPDATE RLS POLICIES FOR KEYWORDS
-- =====================================================

DROP POLICY IF EXISTS "Temp admins can view all keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can insert keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can update keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can delete keywords" ON keywords;

CREATE POLICY "Temp admins can view all keywords" ON keywords
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can insert keywords" ON keywords
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can update keywords" ON keywords
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

CREATE POLICY "Temp admins can delete keywords" ON keywords
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

-- =====================================================
-- UPDATE RLS POLICIES FOR LOCATION_SERVICES
-- =====================================================

DROP POLICY IF EXISTS "Temp admins can manage location services" ON location_services;

CREATE POLICY "Temp admins can manage location services" ON location_services
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);

-- =====================================================
-- UPDATE RLS POLICIES FOR LOCATION_CONTENT_TEMPLATES
-- =====================================================

DROP POLICY IF EXISTS "Temp admins can manage location templates" ON location_content_templates;

CREATE POLICY "Temp admins can manage location templates" ON location_content_templates
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('admin', 'temp_admin', 'admin-2')
  )
);
