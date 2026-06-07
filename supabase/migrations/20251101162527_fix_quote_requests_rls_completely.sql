/*
  # Complete RLS Fix for Quote Requests

  1. Problem
    - RLS policies exist but inserts still failing
    - Even with correct policies, anon role cannot insert
    
  2. Solution
    - Disable RLS temporarily
    - Drop ALL policies
    - Re-enable RLS
    - Create single simple policy for INSERT
    - Add back other policies
    
  3. Security
    - Allow all inserts (anon + authenticated)
    - Restrict selects and updates appropriately
*/

-- Step 1: Disable RLS
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "enable_insert_for_all" ON quote_requests;
DROP POLICY IF EXISTS "enable_select_own_requests" ON quote_requests;
DROP POLICY IF EXISTS "enable_select_all_for_staff" ON quote_requests;
DROP POLICY IF EXISTS "enable_update_for_staff" ON quote_requests;

-- Step 3: Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Create brand new policies with different names

-- Allow anyone to insert quotes (this is the critical one)
CREATE POLICY "quotes_allow_insert_public"
  ON quote_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view their own quotes
CREATE POLICY "quotes_select_own"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = (auth.jwt() ->> 'email')::text);

-- Allow staff/admin to view all quotes
CREATE POLICY "quotes_select_staff"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Allow staff/admin to update quotes
CREATE POLICY "quotes_update_staff"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );