/*
  # CMS Enhancements and Portal System Tables

  ## Overview
  This migration enhances the existing CMS schema with additional fields and creates
  tables for the portal system (client, staff, partner, trade portals).

  ## 1. CMS Table Enhancements
    
    ### Pages Table Updates
    - Add `is_published` boolean field for draft/published state
    - Add `featured_image` text field for page hero images
    - Add `gallery` jsonb field for additional images
    
    ### Services Table Updates
    - Add `price_range` text field for pricing information
    - Add `featured` boolean to highlight popular services
    
    ### Cities/Locations Table Updates
    - Add `region` text field for grouping locations
    - Add `service_areas` jsonb for detailed coverage areas
    - Add `popular` boolean to feature main locations

  ## 2. Portal System Tables
    
    ### Bookings Table
    - For client portal booking management
    - Tracks customer bookings and their status
    
    ### Jobs Table
    - For staff portal job assignments
    - Links bookings to assigned staff members
    
    ### Partners Table
    - For partner portal company listings
    - Manages partnership relationships
    
    ### Trade Accounts Table
    - For trade portal specialized accounts
    - Business-to-business relationships

  ## 3. Security
    - Enable RLS on all new tables
    - Add restrictive policies for authenticated access
    - Protect sensitive portal data
*/

ALTER TABLE IF EXISTS pages
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_image text,
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS services
ADD COLUMN IF NOT EXISTS price_range text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

ALTER TABLE IF EXISTS cities
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS service_areas jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS popular boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service_type text NOT NULL,
  move_from text NOT NULL,
  move_to text NOT NULL,
  move_date date,
  status text DEFAULT 'pending',
  notes text,
  quote_amount decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  staff_id uuid,
  assigned_date timestamptz DEFAULT now(),
  scheduled_date date NOT NULL,
  status text DEFAULT 'assigned',
  notes text,
  completion_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view assigned jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "Staff can update their jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  address text,
  status text DEFAULT 'pending',
  partnership_type text,
  logo_url text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own data"
  ON partners FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Partners can update their profile"
  ON partners FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

CREATE TABLE IF NOT EXISTS trade_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  business_address text,
  account_status text DEFAULT 'pending',
  discount_rate decimal(5,2) DEFAULT 0,
  credit_limit decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade accounts can view their own data"
  ON trade_accounts FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Trade accounts can update their profile"
  ON trade_accounts FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  customer_email text NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  issued_date date DEFAULT CURRENT_DATE,
  due_date date,
  paid_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt()->>'email');

CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_move_date ON bookings(move_date);
CREATE INDEX IF NOT EXISTS idx_jobs_staff_id ON jobs(staff_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_trade_accounts_email ON trade_accounts(email);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
