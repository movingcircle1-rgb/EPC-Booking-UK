/*
  # Fix RLS Auth Function Performance - Part 2
  
  1. Performance Optimization
    - Optimizing commission_statements, company_documents, locations
    - Material downloads, marketing materials, partner tables
  
  2. Tables Updated (Part 2)
    - commission_statements
    - company_documents  
    - locations
    - material_downloads
    - marketing_material_orders
    - partner_commissions
    - partner_referrals
*/

-- ============================================================================
-- COMMISSION_STATEMENTS
-- ============================================================================

DROP POLICY IF EXISTS "statements_admin_manage" ON commission_statements;
CREATE POLICY "statements_admin_manage"
  ON commission_statements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

DROP POLICY IF EXISTS "statements_select_own_or_admin" ON commission_statements;
CREATE POLICY "statements_select_own_or_admin"
  ON commission_statements FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- COMPANY_DOCUMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage company documents" ON company_documents;
CREATE POLICY "Admins can manage company documents"
  ON company_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- LOCATIONS
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

-- ============================================================================
-- MATERIAL_DOWNLOADS
-- ============================================================================

DROP POLICY IF EXISTS "downloads_insert_own" ON material_downloads;
CREATE POLICY "downloads_insert_own"
  ON material_downloads FOR INSERT
  TO authenticated
  WITH CHECK (partner_id = (select auth.uid()));

DROP POLICY IF EXISTS "downloads_select_own_or_admin" ON material_downloads;
CREATE POLICY "downloads_select_own_or_admin"
  ON material_downloads FOR SELECT
  TO authenticated
  USING (
    partner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- ============================================================================
-- MARKETING_MATERIAL_ORDERS
-- ============================================================================

DROP POLICY IF EXISTS "Partners view own orders" ON marketing_material_orders;
CREATE POLICY "Partners view own orders"
  ON marketing_material_orders FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners create orders" ON marketing_material_orders;
CREATE POLICY "Partners create orders"
  ON marketing_material_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PARTNER_COMMISSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Partners view own commissions" ON partner_commissions;
CREATE POLICY "Partners view own commissions"
  ON partner_commissions FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PARTNER_REFERRALS
-- ============================================================================

DROP POLICY IF EXISTS "Partners view own referrals" ON partner_referrals;
CREATE POLICY "Partners view own referrals"
  ON partner_referrals FOR SELECT
  TO authenticated
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Partners create referrals" ON partner_referrals;
CREATE POLICY "Partners create referrals"
  ON partner_referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = (select auth.uid())
    )
  );
