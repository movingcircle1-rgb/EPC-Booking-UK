/*
  # Fix RLS Auth Function Performance - Part 1
  
  1. Performance Optimization
    - Replace `auth.uid()` with `(select auth.uid())` where not already optimized
    - Replace `auth.jwt()` with `(select auth.jwt())` where not already optimized
    - Focus on most critical high-traffic tables first
  
  2. Tables Updated (Part 1)
    - activity_logs
    - announcements
    - business_analytics
    - account_managers
  
  3. Security
    - Maintains identical access control logic
    - Only changes execution optimization
*/

-- ============================================================================
-- ACTIVITY_LOGS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;
CREATE POLICY "Admins can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- ANNOUNCEMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view published announcements for their role" ON announcements;
CREATE POLICY "Users can view published announcements for their role"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    published = true
    AND (
      target_roles IS NULL
      OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = (select auth.uid())
        AND role = ANY(target_roles)
      )
    )
  );

-- ============================================================================
-- BUSINESS_ANALYTICS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage analytics" ON business_analytics;
CREATE POLICY "Admins can manage analytics"
  ON business_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- ACCOUNT_MANAGERS  
-- ============================================================================

DROP POLICY IF EXISTS "account_managers_admin_all" ON account_managers;
CREATE POLICY "account_managers_admin_all"
  ON account_managers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );
