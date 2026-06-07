/*
  # Partner Referral & Commission System

  1. New Tables
    - `partner_referrals`
      - Customer referrals submitted by partners
      - Tracks status: pending → contacted → quoted → won/lost
      - Links to actual bookings when converted
    
    - `partner_commissions`
      - Commission payments earned by partners
      - Based on completed referrals
      - Payment status tracking
    
    - `partner_account_managers`
      - Account manager assignments
      - Contact details for partners
  
  2. Security
    - RLS enabled on all tables
    - Partners can only see their own referrals and commissions
    - Admins can manage all partner data
*/

-- Partner Referrals (Customer leads submitted by partners)
CREATE TABLE IF NOT EXISTS partner_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) NOT NULL,
  partner_user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Customer Details
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  
  -- Move Details
  move_from_postcode text NOT NULL,
  move_to_postcode text,
  property_size text,
  move_date date,
  
  -- Referral Details
  referral_notes text,
  estimated_value decimal(10,2),
  
  -- Status Tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'won', 'lost', 'cancelled')),
  contacted_date timestamptz,
  quoted_date timestamptz,
  won_date timestamptz,
  
  -- Link to actual booking if won
  booking_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partner Commissions
CREATE TABLE IF NOT EXISTS partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) NOT NULL,
  partner_user_id uuid REFERENCES auth.users(id) NOT NULL,
  referral_id uuid REFERENCES partner_referrals(id) NOT NULL,
  
  -- Commission Details
  job_value decimal(10,2) NOT NULL,
  commission_rate decimal(5,2) DEFAULT 10.00,
  commission_amount decimal(10,2) NOT NULL,
  
  -- Payment Details
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  approved_date timestamptz,
  paid_date timestamptz,
  payment_reference text,
  
  created_at timestamptz DEFAULT now()
);

-- Partner Account Managers
CREATE TABLE IF NOT EXISTS partner_account_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  position text DEFAULT 'Account Manager',
  photo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add commission_rate to partners table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partners' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE partners ADD COLUMN commission_rate decimal(5,2) DEFAULT 10.00;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_account_managers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_referrals

-- Partners can view their own referrals
CREATE POLICY "Partners view own referrals"
  ON partner_referrals FOR SELECT
  TO authenticated
  USING (partner_user_id = auth.uid());

-- Partners can create referrals
CREATE POLICY "Partners create referrals"
  ON partner_referrals FOR INSERT
  TO authenticated
  WITH CHECK (partner_user_id = auth.uid());

-- Admins can view all referrals
CREATE POLICY "Admins view all referrals"
  ON partner_referrals FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update referrals (change status)
CREATE POLICY "Admins update referrals"
  ON partner_referrals FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policies for partner_commissions

-- Partners can view their own commissions
CREATE POLICY "Partners view own commissions"
  ON partner_commissions FOR SELECT
  TO authenticated
  USING (partner_user_id = auth.uid());

-- Admins can manage all commissions
CREATE POLICY "Admins manage commissions"
  ON partner_commissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policies for partner_account_managers

-- All authenticated users can view active account managers
CREATE POLICY "View active account managers"
  ON partner_account_managers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage account managers
CREATE POLICY "Admins manage account managers"
  ON partner_account_managers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_partner ON partner_referrals(partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON partner_referrals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON partner_commissions(partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON partner_commissions(status, paid_date);

-- Insert default account manager
INSERT INTO partner_account_managers (name, email, phone, position, is_active)
VALUES 
  ('Sarah Johnson', 'sarah.johnson@nationalremovals.co.uk', '0121 555 0123', 'Senior Account Manager', true),
  ('Michael Brown', 'michael.brown@nationalremovals.co.uk', '0121 555 0124', 'Partnership Director', true)
ON CONFLICT DO NOTHING;
