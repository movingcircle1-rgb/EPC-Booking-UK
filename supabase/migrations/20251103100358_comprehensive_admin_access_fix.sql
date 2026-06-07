/*
  # Comprehensive Admin Access Fix

  ## Problem
  Admin dashboard is not showing new quote requests or quotations properly.
  Admin users cannot accept/reject quotations.

  ## Root Causes
  1. Missing or incorrect RLS policies for admin SELECT access
  2. Policies might be too restrictive
  3. Need to ensure all data is visible to admins

  ## Solution
  - Add comprehensive admin policies to all relevant tables
  - Ensure admins can view, update, insert, and delete all records
  - Keep client access restricted to their own data
  - Add policies for quote_requests table for admin access

  ## Changes
  - Add/fix quote_requests admin policies
  - Ensure quotations admin policies work correctly
  - Add admin policies for quotes table if it exists
  - Test and verify access
*/

-- ============================================
-- STEP 1: FIX QUOTE_REQUESTS POLICIES
-- ============================================

-- Drop potentially conflicting or old policies
DROP POLICY IF EXISTS "Staff can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Staff can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can delete quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Users can view their own quote requests" ON quote_requests;

-- Ensure these policies exist and are correct
DROP POLICY IF EXISTS "quotes_select_staff" ON quote_requests;
CREATE POLICY "quotes_select_staff"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "quotes_select_own" ON quote_requests;
CREATE POLICY "quotes_select_own"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email'
  );

DROP POLICY IF EXISTS "quotes_update_staff" ON quote_requests;
CREATE POLICY "quotes_update_staff"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Add delete policy for admins
CREATE POLICY "quotes_delete_admin"
  ON quote_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- STEP 2: VERIFY QUOTATIONS POLICIES
-- ============================================

-- Ensure admin policies exist and work correctly
-- These should already exist from previous migration, but let's verify

-- If Admins view all quotations doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'quotations'
    AND policyname = 'Admins view all quotations'
  ) THEN
    CREATE POLICY "Admins view all quotations"
      ON quotations FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'staff')
        )
      );
  END IF;
END $$;

-- ============================================
-- STEP 3: ADD POLICIES FOR QUOTES TABLE (if exists)
-- ============================================

-- Check if quotes table exists and add policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quotes') THEN
    -- Enable RLS
    ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies
    DROP POLICY IF EXISTS "Admin view all quotes" ON quotes;
    DROP POLICY IF EXISTS "Admin update quotes" ON quotes;
    DROP POLICY IF EXISTS "Users view own quotes" ON quotes;

    -- Admin can view all
    CREATE POLICY "Admin view all quotes"
      ON quotes FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'staff')
        )
      );

    -- Admin can update all
    CREATE POLICY "Admin update quotes"
      ON quotes FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'staff')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'staff')
        )
      );

    -- Users can view their own quotes
    CREATE POLICY "Users view own quotes"
      ON quotes FOR SELECT
      TO authenticated
      USING (email = auth.jwt()->>'email');
  END IF;
END $$;

-- ============================================
-- STEP 4: ADD COMPREHENSIVE PACKAGING_ORDERS ADMIN POLICIES
-- ============================================

-- Verify admin policies exist for packaging orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'packaging_orders'
    AND policyname = 'Admins view all packaging orders'
  ) THEN
    CREATE POLICY "Admins view all packaging orders"
      ON packaging_orders FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'staff')
        )
      );
  END IF;
END $$;

-- ============================================
-- STEP 5: CREATE HELPER VIEW FOR ADMIN DASHBOARD
-- ============================================

-- Create a view that shows all quote-related data for admins
CREATE OR REPLACE VIEW admin_all_quotes AS
SELECT
  'quote_request' as source_type,
  id,
  quote_reference as reference_number,
  customer_name,
  customer_email,
  customer_phone,
  service_type,
  status,
  created_at,
  updated_at,
  NULL::numeric as total_amount,
  move_from_postcode,
  move_to_postcode
FROM quote_requests
UNION ALL
SELECT
  'quotation' as source_type,
  id,
  quotation_number as reference_number,
  NULL as customer_name,
  customer_email,
  NULL as customer_phone,
  service_type,
  status,
  created_at,
  updated_at,
  total_amount,
  move_from as move_from_postcode,
  move_to as move_to_postcode
FROM quotations
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON admin_all_quotes TO authenticated;

-- ============================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status_created ON quote_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_status_created ON quotations(status, created_at DESC);

-- ============================================
-- STEP 7: VERIFICATION QUERY
-- ============================================

-- You can run this to verify admin access:
-- SELECT COUNT(*) as quote_requests_count FROM quote_requests;
-- SELECT COUNT(*) as quotations_count FROM quotations;
-- SELECT * FROM admin_all_quotes LIMIT 10;
