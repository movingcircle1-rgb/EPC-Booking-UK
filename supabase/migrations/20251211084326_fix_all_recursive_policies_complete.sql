/*
  # Fix ALL Recursive Policies - Complete Solution

  ## Problem
  Hundreds of policies across ALL tables query user_roles directly, causing
  infinite recursion during sign-in. Even after fixing user_roles table policies,
  other tables trigger the recursion.

  ## Solution
  Replace ALL EXISTS queries on user_roles with SECURITY DEFINER helper functions
  that bypass RLS completely.

  ## Changes
  1. Update helper functions to handle ALL admin types (admin, admin2, admin-2, temp_admin)
  2. Fix ALL policies across ALL tables to use helper functions
  3. Ensure admin2 has FULL admin access everywhere
*/

-- ============================================================================
-- STEP 1: Create comprehensive SECURITY DEFINER helper functions
-- ============================================================================

-- Check if user has any admin role (admin, admin2, admin-2, temp_admin)
CREATE OR REPLACE FUNCTION public.is_any_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  SELECT role INTO user_role_value
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  RETURN user_role_value IN ('admin', 'admin2', 'admin-2', 'temp_admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Check if user has admin or staff role
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  SELECT role INTO user_role_value
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  RETURN user_role_value IN ('admin', 'admin2', 'admin-2', 'temp_admin', 'staff');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(check_role text, check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  SELECT role INTO user_role_value
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  RETURN user_role_value = check_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(check_roles text[], check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
BEGIN
  SELECT role INTO user_role_value
  FROM user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  RETURN user_role_value = ANY(check_roles);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ============================================================================
-- STEP 2: Fix user_roles table policies (NO RECURSION)
-- ============================================================================

DROP POLICY IF EXISTS "Admin-2 can update users" ON user_roles;
DROP POLICY IF EXISTS "Admin-2 can view all users" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_no_recursion" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_no_recursion" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_no_recursion" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admins_only" ON user_roles;

-- SELECT: Users see own, admins see all
CREATE POLICY "user_roles_select_final"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_any_admin(auth.uid())
  );

-- UPDATE: Users update own, admins update all
CREATE POLICY "user_roles_update_final"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_any_admin(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_any_admin(auth.uid())
  );

-- INSERT: Users create own, admins create any
CREATE POLICY "user_roles_insert_final"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_any_admin(auth.uid())
  );

-- DELETE: Only admins can delete
CREATE POLICY "user_roles_delete_final"
  ON user_roles FOR DELETE
  TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- ============================================================================
-- STEP 3: Fix ALL other table policies
-- ============================================================================

-- PACKAGING_ORDERS
DROP POLICY IF EXISTS "Admins view all packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Admins update packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Admins delete packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "admin2_view_packaging_orders" ON packaging_orders;
DROP POLICY IF EXISTS "admin2_update_packaging_orders" ON packaging_orders;

CREATE POLICY "admin_view_all_packaging_orders"
  ON packaging_orders FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_packaging_orders"
  ON packaging_orders FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_packaging_orders"
  ON packaging_orders FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- QUOTATIONS
DROP POLICY IF EXISTS "Admins view all quotations" ON quotations;
DROP POLICY IF EXISTS "Admins update all quotations" ON quotations;
DROP POLICY IF EXISTS "Admins insert quotations" ON quotations;
DROP POLICY IF EXISTS "Admins delete quotations" ON quotations;
DROP POLICY IF EXISTS "admin2_view_quotations" ON quotations;
DROP POLICY IF EXISTS "admin2_update_quotations" ON quotations;

CREATE POLICY "admin_view_quotations"
  ON quotations FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_quotations"
  ON quotations FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_quotations"
  ON quotations FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_quotations"
  ON quotations FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- LOCATIONS
DROP POLICY IF EXISTS "Admins can insert locations" ON locations;
DROP POLICY IF EXISTS "Admins can update locations" ON locations;
DROP POLICY IF EXISTS "Admins can delete locations" ON locations;

CREATE POLICY "admin_insert_locations"
  ON locations FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_locations"
  ON locations FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_locations"
  ON locations FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- QUOTE_REQUESTS
DROP POLICY IF EXISTS "admin2_view_quote_requests" ON quote_requests;
DROP POLICY IF EXISTS "admin2_update_quote_requests" ON quote_requests;
DROP POLICY IF EXISTS "quotes_select_staff" ON quote_requests;
DROP POLICY IF EXISTS "quotes_update_staff" ON quote_requests;
DROP POLICY IF EXISTS "quotes_delete_admin" ON quote_requests;

CREATE POLICY "admin_view_quote_requests"
  ON quote_requests FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_staff_update_quote_requests"
  ON quote_requests FOR UPDATE TO authenticated
  USING (public.is_admin_or_staff(auth.uid()))
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "admin_delete_quote_requests"
  ON quote_requests FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- ARTICLES
DROP POLICY IF EXISTS "Admin-2 and admin users can view all articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can insert articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can update articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete articles" ON articles;

CREATE POLICY "admin_view_articles"
  ON articles FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_articles"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_articles"
  ON articles FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_articles"
  ON articles FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- MEDIA_LIBRARY
DROP POLICY IF EXISTS "Admin-2 and admin users can view all media" ON media_library;
DROP POLICY IF EXISTS "Admin-2 and admin users can insert media" ON media_library;
DROP POLICY IF EXISTS "Admin-2 and admin users can update media" ON media_library;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete media" ON media_library;

CREATE POLICY "admin_view_media"
  ON media_library FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_media"
  ON media_library FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_media"
  ON media_library FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_media"
  ON media_library FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- PAGE_SEO_METADATA
DROP POLICY IF EXISTS "Admin-2 and admin users can view SEO metadata" ON page_seo_metadata;
DROP POLICY IF EXISTS "Admin-2 and admin users can insert SEO metadata" ON page_seo_metadata;
DROP POLICY IF EXISTS "Admin-2 and admin users can update SEO metadata" ON page_seo_metadata;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete SEO metadata" ON page_seo_metadata;

CREATE POLICY "admin_view_seo_metadata"
  ON page_seo_metadata FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_seo_metadata"
  ON page_seo_metadata FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_seo_metadata"
  ON page_seo_metadata FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_seo_metadata"
  ON page_seo_metadata FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- CITIES
DROP POLICY IF EXISTS "Temp admins can view all cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can insert cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can update cities" ON cities;
DROP POLICY IF EXISTS "Temp admins can delete cities" ON cities;

CREATE POLICY "admin_view_cities"
  ON cities FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_cities"
  ON cities FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_cities"
  ON cities FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_cities"
  ON cities FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- KEYWORDS
DROP POLICY IF EXISTS "Temp admins can view all keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can insert keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can update keywords" ON keywords;
DROP POLICY IF EXISTS "Temp admins can delete keywords" ON keywords;

CREATE POLICY "admin_view_keywords"
  ON keywords FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_keywords"
  ON keywords FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_keywords"
  ON keywords FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_keywords"
  ON keywords FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- CITY_CONTENT_BLOCKS
DROP POLICY IF EXISTS "Admins can view content blocks" ON city_content_blocks;
DROP POLICY IF EXISTS "Admins can insert content blocks" ON city_content_blocks;
DROP POLICY IF EXISTS "Admins can update content blocks" ON city_content_blocks;
DROP POLICY IF EXISTS "Admins can delete content blocks" ON city_content_blocks;

CREATE POLICY "admin_view_city_content"
  ON city_content_blocks FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_city_content"
  ON city_content_blocks FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_city_content"
  ON city_content_blocks FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_city_content"
  ON city_content_blocks FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- CITY_SERVICE_CONTENT
DROP POLICY IF EXISTS "Admin2 can view city service content" ON city_service_content;
DROP POLICY IF EXISTS "Admin2 can insert city service content" ON city_service_content;
DROP POLICY IF EXISTS "Admin2 can update city service content" ON city_service_content;
DROP POLICY IF EXISTS "Admin2 can delete city service content" ON city_service_content;

CREATE POLICY "admin_view_city_service_content"
  ON city_service_content FOR SELECT TO authenticated
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_insert_city_service_content"
  ON city_service_content FOR INSERT TO authenticated
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_update_city_service_content"
  ON city_service_content FOR UPDATE TO authenticated
  USING (public.is_any_admin(auth.uid()))
  WITH CHECK (public.is_any_admin(auth.uid()));

CREATE POLICY "admin_delete_city_service_content"
  ON city_service_content FOR DELETE TO authenticated
  USING (public.is_any_admin(auth.uid()));

-- Add comments
COMMENT ON FUNCTION public.is_any_admin IS 'Check if user has any admin role (admin, admin2, admin-2, temp_admin) - SECURITY DEFINER to prevent recursion';
COMMENT ON FUNCTION public.is_admin_or_staff IS 'Check if user has admin or staff role - SECURITY DEFINER to prevent recursion';
COMMENT ON FUNCTION public.has_role IS 'Check if user has specific role - SECURITY DEFINER to prevent recursion';
COMMENT ON FUNCTION public.has_any_role IS 'Check if user has any of specified roles - SECURITY DEFINER to prevent recursion';
