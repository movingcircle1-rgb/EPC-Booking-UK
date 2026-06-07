/*
  # Fix RLS Policies - Remove Direct auth.users Access

  ## Problem
  RLS policies were using direct queries to auth.users table which regular users
  don't have permission to access, causing "permission denied for table users" errors.

  ## Solution
  Replace `(SELECT email FROM auth.users WHERE id = auth.uid())` with `auth.jwt()->>'email'`
  which uses the JWT token data instead of querying the users table.

  ## Changes
  - Update quotations RLS policies to use JWT email
  - Update packaging_orders RLS policies to use JWT email
  - Ensure all policies work for authenticated clients
*/

-- ============================================
-- FIX QUOTATIONS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Clients view own quotations" ON quotations;
DROP POLICY IF EXISTS "Clients update own quotations" ON quotations;

-- Policy 1: Clients can view their own quotations (using JWT)
CREATE POLICY "Clients view own quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email'
  );

-- Policy 2: Clients can update their own quotation acceptance status (using JWT)
CREATE POLICY "Clients update own quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email'
  )
  WITH CHECK (
    customer_email = auth.jwt()->>'email'
  );

-- ============================================
-- FIX PACKAGING_ORDERS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view own packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Users create packaging orders" ON packaging_orders;

-- Policy 1: Users can view their own packaging orders (using JWT)
CREATE POLICY "Users view own packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    customer_email = auth.jwt()->>'email'
  );

-- Policy 2: Users can create their own packaging orders (using JWT)
CREATE POLICY "Users create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    customer_email = auth.jwt()->>'email'
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Test that policies exist and are correct
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('quotations', 'packaging_orders')
-- ORDER BY tablename, policyname;
