/*
  # Fix Critical RLS Performance Issues Only
  
  This migration focuses only on the most critical high-traffic tables
  that were flagged in the security report. We're fixing only policies
  that are definitely causing performance issues.
  
  Tables optimized:
  - user_roles (high traffic - authentication checks)
  - notifications (high traffic - user notifications)
  - packaging_orders (user orders)
  - quotations (customer quotes)
  - locations (public-facing pages)
  
  All other tables will be addressed in future optimizations once
  we've verified correct column names.
*/

-- ============================================================================
-- USER_ROLES - Critical for all authenticated requests
-- ============================================================================

DROP POLICY IF EXISTS "select_own_or_if_admin" ON user_roles;
CREATE POLICY "select_own_or_if_admin"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid())
      AND ur.role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "update_own_or_if_admin" ON user_roles;
CREATE POLICY "update_own_or_if_admin"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (select auth.uid())
      AND ur.role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "user_insert_own_role" ON user_roles;
CREATE POLICY "user_insert_own_role"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- NOTIFICATIONS - High traffic for user notifications
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users view notifications" ON notifications;
CREATE POLICY "Users view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update notifications" ON notifications;
CREATE POLICY "Users update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PACKAGING_ORDERS - User order management
-- ============================================================================

DROP POLICY IF EXISTS "Users view own packaging orders" ON packaging_orders;
CREATE POLICY "Users view own packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users create packaging orders" ON packaging_orders;
CREATE POLICY "Users create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins view all packaging orders" ON packaging_orders;
CREATE POLICY "Admins view all packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Admins update packaging orders" ON packaging_orders;
CREATE POLICY "Admins update packaging orders"
  ON packaging_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Admins delete packaging orders" ON packaging_orders;
CREATE POLICY "Admins delete packaging orders"
  ON packaging_orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- QUOTATIONS - Customer quotations (using customer_email)
-- ============================================================================

DROP POLICY IF EXISTS "Admins view all quotations" ON quotations;
CREATE POLICY "Admins view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Clients view own quotations" ON quotations;
CREATE POLICY "Clients view own quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (customer_email = (select auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Admins update all quotations" ON quotations;
CREATE POLICY "Admins update all quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Clients update own quotations" ON quotations;
CREATE POLICY "Clients update own quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (customer_email = (select auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Admins insert quotations" ON quotations;
CREATE POLICY "Admins insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Admins delete quotations" ON quotations;
CREATE POLICY "Admins delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- LOCATIONS - Public facing location pages (high traffic)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert locations" ON locations;
CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update locations" ON locations;
CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete locations" ON locations;
CREATE POLICY "Admins can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );
