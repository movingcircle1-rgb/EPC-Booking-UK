/*
  # Fix RLS Auth Function Performance - Part 3
  
  1. Performance Optimization
    - Optimizing notifications, packaging_orders, quotations
    - Support tickets, staff tables
  
  2. Tables Updated (Part 3)
    - notifications
    - packaging_orders
    - quotations
    - support_tickets
    - staff_job_assignments
    - staff_timesheets
    - job_reports
*/

-- ============================================================================
-- NOTIFICATIONS
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
-- PACKAGING_ORDERS
-- ============================================================================

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

DROP POLICY IF EXISTS "Users view own packaging orders" ON packaging_orders;
CREATE POLICY "Users view own packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

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

DROP POLICY IF EXISTS "Users create packaging orders" ON packaging_orders;
CREATE POLICY "Users create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- QUOTATIONS
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
  USING (
    customer_email = (select auth.jwt()->>'email')
  );

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
  USING (
    customer_email = (select auth.jwt()->>'email')
  );

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
-- SUPPORT_TICKETS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- STAFF_JOB_ASSIGNMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view own assignments" ON staff_job_assignments;
CREATE POLICY "Staff can view own assignments"
  ON staff_job_assignments FOR SELECT
  TO authenticated
  USING (staff_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff can update own assignment status" ON staff_job_assignments;
CREATE POLICY "Staff can update own assignment status"
  ON staff_job_assignments FOR UPDATE
  TO authenticated
  USING (staff_id = (select auth.uid()));

-- ============================================================================
-- STAFF_TIMESHEETS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view own timesheets" ON staff_timesheets;
CREATE POLICY "Staff can view own timesheets"
  ON staff_timesheets FOR SELECT
  TO authenticated
  USING (staff_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff can insert own timesheets" ON staff_timesheets;
CREATE POLICY "Staff can insert own timesheets"
  ON staff_timesheets FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff can update own timesheets" ON staff_timesheets;
CREATE POLICY "Staff can update own timesheets"
  ON staff_timesheets FOR UPDATE
  TO authenticated
  USING (staff_id = (select auth.uid()));

-- ============================================================================
-- JOB_REPORTS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view own reports" ON job_reports;
CREATE POLICY "Staff can view own reports"
  ON job_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_job_assignments
      WHERE staff_job_assignments.id = job_reports.assignment_id
      AND staff_job_assignments.staff_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Staff can create reports for assigned jobs" ON job_reports;
CREATE POLICY "Staff can create reports for assigned jobs"
  ON job_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_job_assignments
      WHERE staff_job_assignments.id = assignment_id
      AND staff_job_assignments.staff_id = (select auth.uid())
    )
  );
