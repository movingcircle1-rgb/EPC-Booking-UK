/*
  # Enhance Trade Portal - Complete

  ## Overview
  Adds missing features to existing trade portal tables

  ## Changes
  1. Add account_manager_id to trade_accounts
  2. Add location fields to trade_jobs
  3. Update RLS policies
  4. Insert sample services
*/

-- Add account_manager_id to trade_accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'account_manager_id'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN account_manager_id uuid REFERENCES account_managers(id);
  END IF;
END $$;

-- Add addresses to trade_jobs if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_jobs' AND column_name = 'pickup_address'
  ) THEN
    ALTER TABLE trade_jobs ADD COLUMN pickup_address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_jobs' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE trade_jobs ADD COLUMN delivery_address text;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE trade_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_services ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for trade_accounts
DROP POLICY IF EXISTS "trade_accounts_select_own_or_admin" ON trade_accounts;
DROP POLICY IF EXISTS "trade_accounts_insert_own" ON trade_accounts;
DROP POLICY IF EXISTS "trade_accounts_update_own" ON trade_accounts;
DROP POLICY IF EXISTS "trade_accounts_update_own_or_admin" ON trade_accounts;

CREATE POLICY "trade_accounts_select_own_or_admin"
  ON trade_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.check_is_admin(auth.uid()));

CREATE POLICY "trade_accounts_insert_own"
  ON trade_accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "trade_accounts_update_own_or_admin"
  ON trade_accounts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.check_is_admin(auth.uid()));

-- Drop and recreate policies for trade_jobs
DROP POLICY IF EXISTS "trade_jobs_select_all" ON trade_jobs;
DROP POLICY IF EXISTS "trade_jobs_insert_own" ON trade_jobs;
DROP POLICY IF EXISTS "trade_jobs_update_own" ON trade_jobs;
DROP POLICY IF EXISTS "trade_jobs_update_own_or_admin" ON trade_jobs;

CREATE POLICY "trade_jobs_select_all"
  ON trade_jobs FOR SELECT TO authenticated
  USING (
    status IN ('open', 'in_progress')
    OR posted_by_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR public.check_is_admin(auth.uid())
  );

CREATE POLICY "trade_jobs_insert_own"
  ON trade_jobs FOR INSERT TO authenticated
  WITH CHECK (posted_by_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid()));

CREATE POLICY "trade_jobs_update_own_or_admin"
  ON trade_jobs FOR UPDATE TO authenticated
  USING (
    posted_by_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR public.check_is_admin(auth.uid())
  );

-- Drop and recreate policies for trade_bids
DROP POLICY IF EXISTS "trade_bids_select_related" ON trade_bids;
DROP POLICY IF EXISTS "trade_bids_insert_own" ON trade_bids;
DROP POLICY IF EXISTS "trade_bids_update_own" ON trade_bids;
DROP POLICY IF EXISTS "trade_bids_update_related" ON trade_bids;

CREATE POLICY "trade_bids_select_related"
  ON trade_bids FOR SELECT TO authenticated
  USING (
    bidder_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR job_id IN (SELECT id FROM trade_jobs WHERE posted_by_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid()))
    OR public.check_is_admin(auth.uid())
  );

CREATE POLICY "trade_bids_insert_own"
  ON trade_bids FOR INSERT TO authenticated
  WITH CHECK (bidder_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid()));

CREATE POLICY "trade_bids_update_related"
  ON trade_bids FOR UPDATE TO authenticated
  USING (
    bidder_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR job_id IN (SELECT id FROM trade_jobs WHERE posted_by_trade_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid()))
    OR public.check_is_admin(auth.uid())
  );

-- Drop and recreate policies for trade_service_bookings
DROP POLICY IF EXISTS "bookings_select_own" ON trade_service_bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON trade_service_bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON trade_service_bookings;
DROP POLICY IF EXISTS "bookings_select_own_or_admin" ON trade_service_bookings;
DROP POLICY IF EXISTS "bookings_update_own_or_admin" ON trade_service_bookings;

CREATE POLICY "bookings_select_own_or_admin"
  ON trade_service_bookings FOR SELECT TO authenticated
  USING (
    trade_account_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR public.check_is_admin(auth.uid())
  );

CREATE POLICY "bookings_insert_own"
  ON trade_service_bookings FOR INSERT TO authenticated
  WITH CHECK (trade_account_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid()));

CREATE POLICY "bookings_update_own_or_admin"
  ON trade_service_bookings FOR UPDATE TO authenticated
  USING (
    trade_account_id IN (SELECT id FROM trade_accounts WHERE user_id = auth.uid())
    OR public.check_is_admin(auth.uid())
  );

-- Drop and recreate policies for trade_services
DROP POLICY IF EXISTS "services_select_all" ON trade_services;
DROP POLICY IF EXISTS "services_admin_all" ON trade_services;
DROP POLICY IF EXISTS "services_select_active" ON trade_services;

CREATE POLICY "services_select_active"
  ON trade_services FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "services_admin_all"
  ON trade_services FOR ALL TO authenticated
  USING (public.check_is_admin(auth.uid()))
  WITH CHECK (public.check_is_admin(auth.uid()));

-- Insert sample services if none exist
INSERT INTO trade_services (name, service_type, description, price_per_day, price_per_hour, is_active)
SELECT * FROM (VALUES
  ('Driver Hire', 'driver', 'Professional driver for your removal vehicle', 280.00, 35.00, true),
  ('Porter Assistance', 'porter', 'Experienced porters for loading and unloading', 200.00, 25.00, true),
  ('Driver + Porter Team', 'team', 'Complete team with driver and porter', 400.00, 50.00, true),
  ('Long Distance Driver', 'driver_long', 'Specialist driver for long distance moves', 450.00, 45.00, true)
) AS v(name, service_type, description, price_per_day, price_per_hour, is_active)
WHERE NOT EXISTS (SELECT 1 FROM trade_services LIMIT 1);
