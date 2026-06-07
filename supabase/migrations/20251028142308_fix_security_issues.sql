/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified by Supabase:
  
  1. **Missing Foreign Key Indexes**: Adds indexes for all foreign keys to improve query performance
  2. **RLS Performance Optimization**: Wraps auth functions in SELECT to prevent re-evaluation per row
  3. **Function Security**: Fixes search_path for handle_new_user function
  
  ## Changes Made
  
  ### Foreign Key Indexes
  - Added indexes for all unindexed foreign keys across all tables
  - Improves JOIN performance and foreign key constraint checking
  
  ### RLS Policy Optimization
  - Replaced direct auth.uid() calls with (SELECT auth.uid())
  - Replaced direct auth.jwt() calls with (SELECT auth.jwt())
  - Significantly improves query performance at scale
  
  ### Function Security
  - Updated handle_new_user function with immutable search_path
  
  ## Impact
  - Better query performance for foreign key lookups
  - Faster RLS policy evaluation
  - Enhanced security for database functions
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

-- availability_calendar indexes
CREATE INDEX IF NOT EXISTS idx_availability_calendar_approved_by 
  ON availability_calendar(approved_by);

-- booking_additional_services indexes
CREATE INDEX IF NOT EXISTS idx_booking_additional_services_booking_id 
  ON booking_additional_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_additional_services_service_id 
  ON booking_additional_services(service_id);

-- invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id 
  ON invoices(booking_id);

-- jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_booking_id 
  ON jobs(booking_id);

-- material_orders indexes
CREATE INDEX IF NOT EXISTS idx_material_orders_material_id 
  ON material_orders(material_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_partner_id 
  ON material_orders(partner_id);

-- packaging_orders indexes
CREATE INDEX IF NOT EXISTS idx_packaging_orders_booking_id 
  ON packaging_orders(booking_id);

-- payment_links indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_booking_id 
  ON payment_links(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_quotation_id 
  ON payment_links(quotation_id);

-- policy_acknowledgments indexes
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_policy_id 
  ON policy_acknowledgments(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_staff_id 
  ON policy_acknowledgments(staff_id);

-- referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_booking_id 
  ON referrals(booking_id);

-- trade_jobs indexes
CREATE INDEX IF NOT EXISTS idx_trade_jobs_awarded_to_trade_id 
  ON trade_jobs(awarded_to_trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_posted_by_trade_id 
  ON trade_jobs(posted_by_trade_id);

-- trade_service_bookings indexes
CREATE INDEX IF NOT EXISTS idx_trade_service_bookings_service_id 
  ON trade_service_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_trade_service_bookings_trade_account_id 
  ON trade_service_bookings(trade_account_id);

-- notifications index (user_id already has index from migration, but ensure it exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- ============================================================================
-- PART 2: Optimize RLS Policies - Drop and Recreate with SELECT wrapping
-- ============================================================================

-- user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT auth.jwt())->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Admins and staff can update bookings" ON bookings;
CREATE POLICY "Admins and staff can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')));

-- jobs policies
DROP POLICY IF EXISTS "Staff can view their jobs" ON jobs;
CREATE POLICY "Staff can view their jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    staff_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage jobs" ON jobs;
CREATE POLICY "Admins can manage jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

DROP POLICY IF EXISTS "Staff can update their jobs" ON jobs;
CREATE POLICY "Staff can update their jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (staff_id = (SELECT auth.uid()))
  WITH CHECK (staff_id = (SELECT auth.uid()));

-- partners policies
DROP POLICY IF EXISTS "Partners can view their data" ON partners;
CREATE POLICY "Partners can view their data"
  ON partners FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Partners can update their profile" ON partners;
CREATE POLICY "Partners can update their profile"
  ON partners FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- trade_accounts policies
DROP POLICY IF EXISTS "Trade accounts can view their data" ON trade_accounts;
CREATE POLICY "Trade accounts can view their data"
  ON trade_accounts FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Trade accounts can update their profile" ON trade_accounts;
CREATE POLICY "Trade accounts can update their profile"
  ON trade_accounts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can manage trade accounts" ON trade_accounts;
CREATE POLICY "Admins can manage trade accounts"
  ON trade_accounts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- invoices policies
DROP POLICY IF EXISTS "Users can view their invoices" ON invoices;
CREATE POLICY "Users can view their invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT auth.jwt())->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;
CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- quotations policies
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
CREATE POLICY "Users can view their quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT auth.jwt())->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;
CREATE POLICY "Clients can update quotation acceptance"
  ON quotations FOR UPDATE
  TO authenticated
  USING (customer_email = (SELECT auth.jwt())->>'email')
  WITH CHECK (customer_email = (SELECT auth.jwt())->>'email');

DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;
CREATE POLICY "Admins can manage quotations"
  ON quotations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')));

-- documents policies
DROP POLICY IF EXISTS "Authenticated users view documents" ON documents;
CREATE POLICY "Authenticated users view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = ANY(access_roles))
  );

DROP POLICY IF EXISTS "Admins manage documents" ON documents;
CREATE POLICY "Admins manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- additional_services policies
DROP POLICY IF EXISTS "Admins manage services" ON additional_services;
CREATE POLICY "Admins manage services"
  ON additional_services FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- booking_additional_services policies
DROP POLICY IF EXISTS "View booking services" ON booking_additional_services;
CREATE POLICY "View booking services"
  ON booking_additional_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.customer_email = (SELECT auth.jwt())->>'email') OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Add booking services" ON booking_additional_services;
CREATE POLICY "Add booking services"
  ON booking_additional_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.customer_email = (SELECT auth.jwt())->>'email') OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

-- payment_links policies
DROP POLICY IF EXISTS "View payment links" ON payment_links;
CREATE POLICY "View payment links"
  ON payment_links FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT auth.jwt())->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Admins manage payment links" ON payment_links;
CREATE POLICY "Admins manage payment links"
  ON payment_links FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')));

-- packaging_orders policies
DROP POLICY IF EXISTS "View packaging orders" ON packaging_orders;
CREATE POLICY "View packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT auth.jwt())->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Create packaging orders" ON packaging_orders;
CREATE POLICY "Create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_email = (SELECT auth.jwt())->>'email');

DROP POLICY IF EXISTS "Admins manage packaging orders" ON packaging_orders;
CREATE POLICY "Admins manage packaging orders"
  ON packaging_orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff')));

-- referrals policies
DROP POLICY IF EXISTS "Partners view referrals" ON referrals;
CREATE POLICY "Partners view referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Partners create referrals" ON referrals;
CREATE POLICY "Partners create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins manage referrals" ON referrals;
CREATE POLICY "Admins manage referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- commission_statements policies
DROP POLICY IF EXISTS "Partners view statements" ON commission_statements;
CREATE POLICY "Partners view statements"
  ON commission_statements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins manage statements" ON commission_statements;
CREATE POLICY "Admins manage statements"
  ON commission_statements FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- marketing_materials policies
DROP POLICY IF EXISTS "Partners view materials" ON marketing_materials;
CREATE POLICY "Partners view materials"
  ON marketing_materials FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('partner', 'admin'))
  );

DROP POLICY IF EXISTS "Admins manage materials" ON marketing_materials;
CREATE POLICY "Admins manage materials"
  ON marketing_materials FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- material_orders policies
DROP POLICY IF EXISTS "Partners view material orders" ON material_orders;
CREATE POLICY "Partners view material orders"
  ON material_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Partners create material orders" ON material_orders;
CREATE POLICY "Partners create material orders"
  ON material_orders FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins manage material orders" ON material_orders;
CREATE POLICY "Admins manage material orders"
  ON material_orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- trade_jobs policies
DROP POLICY IF EXISTS "Trade view jobs" ON trade_jobs;
CREATE POLICY "Trade view jobs"
  ON trade_jobs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('trade', 'admin')));

DROP POLICY IF EXISTS "Trade create jobs" ON trade_jobs;
CREATE POLICY "Trade create jobs"
  ON trade_jobs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Trade update own jobs" ON trade_jobs;
CREATE POLICY "Trade update own jobs"
  ON trade_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

-- trade_bids policies
DROP POLICY IF EXISTS "Trade view bids" ON trade_bids;
CREATE POLICY "Trade view bids"
  ON trade_bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Trade create bids" ON trade_bids;
CREATE POLICY "Trade create bids"
  ON trade_bids FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Trade update bids" ON trade_bids;
CREATE POLICY "Trade update bids"
  ON trade_bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = (SELECT auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

-- trade_services policies
DROP POLICY IF EXISTS "Trade view services" ON trade_services;
CREATE POLICY "Trade view services"
  ON trade_services FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('trade', 'admin'))
  );

DROP POLICY IF EXISTS "Admins manage trade services" ON trade_services;
CREATE POLICY "Admins manage trade services"
  ON trade_services FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- trade_service_bookings policies
DROP POLICY IF EXISTS "Trade view service bookings" ON trade_service_bookings;
CREATE POLICY "Trade view service bookings"
  ON trade_service_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = trade_account_id AND ta.user_id = (SELECT auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Trade create service bookings" ON trade_service_bookings;
CREATE POLICY "Trade create service bookings"
  ON trade_service_bookings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = trade_account_id AND ta.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins manage trade service bookings" ON trade_service_bookings;
CREATE POLICY "Admins manage trade service bookings"
  ON trade_service_bookings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- staff_profiles policies
DROP POLICY IF EXISTS "Staff view own profile" ON staff_profiles;
CREATE POLICY "Staff view own profile"
  ON staff_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Staff update own profile" ON staff_profiles;
CREATE POLICY "Staff update own profile"
  ON staff_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins manage staff profiles" ON staff_profiles;
CREATE POLICY "Admins manage staff profiles"
  ON staff_profiles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- availability_calendar policies
DROP POLICY IF EXISTS "Staff view availability" ON availability_calendar;
CREATE POLICY "Staff view availability"
  ON availability_calendar FOR SELECT
  TO authenticated
  USING (
    staff_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('admin', 'staff'))
  );

DROP POLICY IF EXISTS "Staff manage availability" ON availability_calendar;
CREATE POLICY "Staff manage availability"
  ON availability_calendar FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Staff update availability" ON availability_calendar;
CREATE POLICY "Staff update availability"
  ON availability_calendar FOR UPDATE
  TO authenticated
  USING (staff_id = (SELECT auth.uid()))
  WITH CHECK (staff_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins manage all availability" ON availability_calendar;
CREATE POLICY "Admins manage all availability"
  ON availability_calendar FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- policies_documents policies
DROP POLICY IF EXISTS "Staff view policies" ON policies_documents;
CREATE POLICY "Staff view policies"
  ON policies_documents FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role IN ('staff', 'admin'))
  );

DROP POLICY IF EXISTS "Admins manage policies" ON policies_documents;
CREATE POLICY "Admins manage policies"
  ON policies_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- policy_acknowledgments policies
DROP POLICY IF EXISTS "Staff view acknowledgments" ON policy_acknowledgments;
CREATE POLICY "Staff view acknowledgments"
  ON policy_acknowledgments FOR SELECT
  TO authenticated
  USING (
    staff_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Staff create acknowledgments" ON policy_acknowledgments;
CREATE POLICY "Staff create acknowledgments"
  ON policy_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = (SELECT auth.uid()));

-- notifications policies
DROP POLICY IF EXISTS "Users view notifications" ON notifications;
CREATE POLICY "Users view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update notifications" ON notifications;
CREATE POLICY "Users update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- audit_logs policies
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;
CREATE POLICY "Admins view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'));

-- gdpr_consents policies
DROP POLICY IF EXISTS "Users view consents" ON gdpr_consents;
CREATE POLICY "Users view consents"
  ON gdpr_consents FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users create consents" ON gdpr_consents;
CREATE POLICY "Users create consents"
  ON gdpr_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 3: Fix Function Security
-- ============================================================================

-- Recreate handle_new_user function with immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;
