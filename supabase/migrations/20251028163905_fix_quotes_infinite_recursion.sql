/*
  # Fix Infinite Recursion Error in Quotes Table RLS Policies

  ## Problem
  The quotes table RLS policies were causing infinite recursion when checking user_roles
  during quote submission. This occurred because policies on quotes query user_roles,
  which triggers RLS evaluation that creates a circular dependency.

  ## Solution
  1. Create a SECURITY DEFINER helper function to check user roles without RLS recursion
  2. Drop all conflicting policies from previous migrations
  3. Recreate optimized policies using the helper function
  4. Simplify policy logic to prevent nested RLS checks

  ## Changes Made
  
  ### Helper Function
  - `is_admin_or_staff()` - Security definer function to check user roles safely
  
  ### Policies Updated
  - Public can submit quote requests (no auth required)
  - Users can view their own quotes (by user_id or email match)
  - Admins/staff can view, update, and delete all quotes
  
  ## Security
  - Anonymous users can INSERT quotes (public form submissions)
  - Authenticated users can SELECT their own quotes
  - Only admins/staff can UPDATE and DELETE quotes
  - All policies optimized to prevent recursion
*/

-- ============================================================================
-- PART 1: Create Helper Function to Check User Roles (Breaks Recursion)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_or_staff(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query user_roles without triggering RLS policies
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  -- Return true if user is admin or staff
  RETURN user_role IN ('admin', 'staff');
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, default to false (no access)
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query user_roles without triggering RLS policies
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
  
  -- Return true if user is admin
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, default to false (no access)
    RETURN false;
END;
$$;

-- ============================================================================
-- PART 2: Drop All Existing Conflicting Quote Policies
-- ============================================================================

-- Drop policies from initial CMS tables migration
DROP POLICY IF EXISTS "Anyone can submit quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can view quotes" ON quotes;
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON quotes;

-- Drop policies from quotes enhancement migration
DROP POLICY IF EXISTS "Public can submit quote requests" ON quotes;
DROP POLICY IF EXISTS "Users view own quotes by user_id" ON quotes;
DROP POLICY IF EXISTS "Users view own quotes by email" ON quotes;
DROP POLICY IF EXISTS "Admins view all quotes" ON quotes;
DROP POLICY IF EXISTS "Admins update quotes" ON quotes;
DROP POLICY IF EXISTS "Admins delete quotes" ON quotes;

-- ============================================================================
-- PART 3: Create Optimized Non-Recursive Policies
-- ============================================================================

-- Policy 1: Allow anonymous/public users to submit quote requests
-- This is critical for the public quote form to work
CREATE POLICY "quotes_public_insert"
  ON quotes FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to view quotes where they are the owner (by user_id)
CREATE POLICY "quotes_user_select_by_id"
  ON quotes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 3: Allow authenticated users to view quotes matching their email
-- This handles cases where quotes were submitted before user registration
CREATE POLICY "quotes_user_select_by_email"
  ON quotes FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt())->>'email');

-- Policy 4: Allow admins and staff to view ALL quotes
-- Uses the helper function to avoid recursion
CREATE POLICY "quotes_admin_staff_select"
  ON quotes FOR SELECT
  TO authenticated
  USING (public.is_admin_or_staff(auth.uid()));

-- Policy 5: Allow admins and staff to update quotes
-- Uses the helper function to avoid recursion
CREATE POLICY "quotes_admin_staff_update"
  ON quotes FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_staff(auth.uid()))
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

-- Policy 6: Allow only admins to delete quotes
-- Uses the helper function to avoid recursion
CREATE POLICY "quotes_admin_delete"
  ON quotes FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 4: Verify Indexes and Table Structure
-- ============================================================================

-- Ensure all necessary indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================================================
-- Notes
-- ============================================================================

-- The key to fixing the infinite recursion is using SECURITY DEFINER functions
-- that bypass RLS when checking user roles. This breaks the circular dependency:
--
-- Before (RECURSIVE):
-- Quote Policy -> Check user_roles (triggers RLS) -> Check user_roles (triggers RLS) -> INFINITE LOOP
--
-- After (NON-RECURSIVE):
-- Quote Policy -> Call is_admin_or_staff() (SECURITY DEFINER, no RLS) -> Return result
--
-- The SECURITY DEFINER function runs with the privileges of the function owner (superuser)
-- and explicitly sets search_path to prevent security vulnerabilities.
