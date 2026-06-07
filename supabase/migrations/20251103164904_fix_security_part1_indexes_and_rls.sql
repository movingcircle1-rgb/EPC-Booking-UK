/*
  # Security Fixes Part 1: Indexes and RLS Enable
  
  ## Summary
  - Add missing foreign key indexes (15 indexes)
  - Remove duplicate indexes (2 duplicates)  
  - Enable RLS on quote_requests table
  
  ## Changes
  
  ### Add Missing Foreign Key Indexes
  Improves query performance for foreign key lookups
  
  ### Remove Duplicate Indexes
  Reduces storage overhead
  
  ### Enable RLS
  Ensures Row Level Security is active on public tables
*/

-- =====================================================
-- ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_account_managers_user_id 
ON account_managers(user_id);

CREATE INDEX IF NOT EXISTS idx_announcements_created_by 
ON announcements(created_by);

CREATE INDEX IF NOT EXISTS idx_company_documents_uploaded_by 
ON company_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_job_reports_assignment_id 
ON job_reports(assignment_id);

CREATE INDEX IF NOT EXISTS idx_marketing_material_orders_material_id 
ON marketing_material_orders(material_id);

CREATE INDEX IF NOT EXISTS idx_marketing_material_orders_partner_id 
ON marketing_material_orders(partner_id);

CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner_id 
ON partner_commissions(partner_id);

CREATE INDEX IF NOT EXISTS idx_partner_commissions_referral_id 
ON partner_commissions(referral_id);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id 
ON partner_referrals(partner_id);

CREATE INDEX IF NOT EXISTS idx_partners_account_manager_id 
ON partners(account_manager_id);

CREATE INDEX IF NOT EXISTS idx_quotes_assigned_to 
ON quotes(assigned_to);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_manager_id 
ON staff_profiles(manager_id);

CREATE INDEX IF NOT EXISTS idx_staff_timesheets_assignment_id 
ON staff_timesheets(assignment_id);

CREATE INDEX IF NOT EXISTS idx_trade_accounts_account_manager_id 
ON trade_accounts(account_manager_id);

CREATE INDEX IF NOT EXISTS idx_trade_jobs_purchased_by_trade_id 
ON trade_jobs(purchased_by_trade_id);

-- =====================================================
-- REMOVE DUPLICATE INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_commission_statements_partner;
DROP INDEX IF EXISTS idx_quote_requests_customer_email;

-- =====================================================
-- ENABLE RLS ON QUOTE_REQUESTS
-- =====================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
