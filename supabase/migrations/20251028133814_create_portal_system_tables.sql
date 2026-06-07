/*
  # Portal System Extended Tables

  ## Overview
  Creates extended tables for all four portal systems with specific functionality
  for Client, Partner, Trade, and Staff portals.

  ## Tables Created
  - Client Portal: quotations, documents, additional_services, payment_links, packaging_orders
  - Partner Portal: referrals, commission_statements, marketing_materials
  - Trade Portal: trade_jobs, trade_bids, trade_services
  - Staff Portal: staff_profiles, availability_calendar, policies_documents
  - Shared: notifications, audit_logs, gdpr_consents

  ## Security
  - Row Level Security enabled on all tables
  - Role-based access policies
*/

-- Client Portal Tables

CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  quotation_number text NOT NULL UNIQUE,
  customer_email text NOT NULL,
  service_type text NOT NULL,
  move_from text NOT NULL,
  move_to text NOT NULL,
  move_date date,
  base_amount decimal(10,2) NOT NULL DEFAULT 0,
  additional_services_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),
  quotation_pdf_url text,
  terms_pdf_url text,
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  valid_until date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Clients can update quotation acceptance"
  ON quotations FOR UPDATE
  TO authenticated
  USING (customer_email = auth.jwt()->>'email')
  WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage quotations"
  ON quotations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('terms', 'policies', 'guides', 'marketing', 'forms', 'other')),
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  version text DEFAULT '1.0',
  is_active boolean DEFAULT true,
  access_roles text[] DEFAULT ARRAY['client', 'partner', 'trade', 'staff', 'admin'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(access_roles))
  );

CREATE POLICY "Admins manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS additional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('packing', 'storage', 'insurance', 'cleaning', 'other')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  unit text DEFAULT 'item',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active services"
  ON additional_services FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage services"
  ON additional_services FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS booking_additional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES additional_services(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  added_at timestamptz DEFAULT now()
);

ALTER TABLE booking_additional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View booking services"
  ON booking_additional_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.customer_email = auth.jwt()->>'email') OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Add booking services"
  ON booking_additional_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.customer_email = auth.jwt()->>'email') OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE TABLE IF NOT EXISTS payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text,
  payment_url text,
  payment_gateway text DEFAULT 'stripe',
  gateway_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'failed', 'expired')),
  sent_at timestamptz,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View payment links"
  ON payment_links FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Admins manage payment links"
  ON payment_links FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE TABLE IF NOT EXISTS packaging_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  delivery_address text NOT NULL,
  delivery_postcode text NOT NULL,
  contact_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  delivery_date date,
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE packaging_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_email = auth.jwt()->>'email');

CREATE POLICY "Admins manage packaging orders"
  ON packaging_orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- Partner Portal Tables

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service_type text NOT NULL,
  move_from text,
  move_to text,
  estimated_move_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'booked', 'completed', 'cancelled')),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  referral_notes text,
  commission_rate decimal(5,2) DEFAULT 5.00,
  commission_amount decimal(10,2) DEFAULT 0,
  commission_paid boolean DEFAULT false,
  commission_paid_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Partners create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()));

CREATE POLICY "Admins manage referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS commission_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  statement_month text NOT NULL,
  statement_year integer NOT NULL,
  total_referrals integer DEFAULT 0,
  completed_referrals integer DEFAULT 0,
  total_commission decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid')),
  payment_date date,
  payment_method text,
  payment_reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, statement_month, statement_year)
);

ALTER TABLE commission_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view statements"
  ON commission_statements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage statements"
  ON commission_statements FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS marketing_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('brochures', 'flyers', 'business_cards', 'posters', 'digital', 'templates')),
  file_url text,
  thumbnail_url text,
  is_downloadable boolean DEFAULT true,
  is_orderable boolean DEFAULT false,
  stock_available integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view materials"
  ON marketing_materials FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('partner', 'admin'))
  );

CREATE POLICY "Admins manage materials"
  ON marketing_materials FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS material_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  material_id uuid REFERENCES marketing_materials(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  delivery_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered')),
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view material orders"
  ON material_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Partners create material orders"
  ON material_orders FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()));

CREATE POLICY "Admins manage material orders"
  ON material_orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Trade Portal Tables

CREATE TABLE IF NOT EXISTS trade_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by_trade_id uuid REFERENCES trade_accounts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('removal', 'delivery', 'storage', 'packing', 'driver', 'porter', 'other')),
  pickup_postcode text NOT NULL,
  delivery_postcode text NOT NULL,
  volume_cubic_feet integer,
  preferred_date date NOT NULL,
  flexible_dates boolean DEFAULT false,
  budget_amount decimal(10,2),
  requirements text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'awarded', 'in_progress', 'completed', 'cancelled')),
  awarded_to_trade_id uuid REFERENCES trade_accounts(id) ON DELETE SET NULL,
  awarded_bid_id uuid,
  posting_fee decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade view jobs"
  ON trade_jobs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('trade', 'admin')));

CREATE POLICY "Trade create jobs"
  ON trade_jobs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = auth.uid()));

CREATE POLICY "Trade update own jobs"
  ON trade_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = posted_by_trade_id AND ta.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS trade_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES trade_jobs(id) ON DELETE CASCADE NOT NULL,
  bidder_trade_id uuid REFERENCES trade_accounts(id) ON DELETE CASCADE NOT NULL,
  bid_amount decimal(10,2) NOT NULL,
  proposed_date date NOT NULL,
  cover_letter text,
  estimated_duration_hours integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade view bids"
  ON trade_bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Trade create bids"
  ON trade_bids FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = auth.uid()));

CREATE POLICY "Trade update bids"
  ON trade_bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = bidder_trade_id AND ta.user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM trade_jobs tj
      JOIN trade_accounts ta ON tj.posted_by_trade_id = ta.id
      WHERE tj.id = job_id AND ta.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS trade_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  service_type text NOT NULL CHECK (service_type IN ('vehicle_hire', 'driver', 'porter', 'equipment', 'storage', 'other')),
  price_per_day decimal(10,2),
  price_per_hour decimal(10,2),
  is_active boolean DEFAULT true,
  availability_info text,
  requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade view services"
  ON trade_services FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('trade', 'admin'))
  );

CREATE POLICY "Admins manage trade services"
  ON trade_services FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS trade_service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_account_id uuid REFERENCES trade_accounts(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES trade_services(id) ON DELETE CASCADE NOT NULL,
  booking_date date NOT NULL,
  start_time time,
  duration_hours integer,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade view service bookings"
  ON trade_service_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = trade_account_id AND ta.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Trade create service bookings"
  ON trade_service_bookings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM trade_accounts ta WHERE ta.id = trade_account_id AND ta.user_id = auth.uid()));

CREATE POLICY "Admins manage trade service bookings"
  ON trade_service_bookings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Staff Portal Tables

CREATE TABLE IF NOT EXISTS staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  job_role text NOT NULL,
  department text,
  employee_number text UNIQUE,
  hire_date date,
  previous_experience text,
  certifications text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  bank_account_name text,
  bank_account_number text,
  bank_sort_code text,
  ni_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own profile"
  ON staff_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff update own profile"
  ON staff_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage staff profiles"
  ON staff_profiles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS availability_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  shift_type text CHECK (shift_type IN ('morning', 'afternoon', 'full_day', 'night', 'off')),
  time_off_type text CHECK (time_off_type IN ('vacation', 'sick', 'personal', 'other')),
  time_off_reason text,
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, date)
);

ALTER TABLE availability_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view availability"
  ON availability_calendar FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Staff manage availability"
  ON availability_calendar FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Staff update availability"
  ON availability_calendar FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Admins manage all availability"
  ON availability_calendar FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS policies_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('company_policy', 'procedure', 'handbook', 'training', 'safety', 'hr', 'other')),
  file_url text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  is_active boolean DEFAULT true,
  requires_acknowledgment boolean DEFAULT false,
  effective_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policies_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view policies"
  ON policies_documents FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
  );

CREATE POLICY "Admins manage policies"
  ON policies_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES policies_documents(id) ON DELETE CASCADE NOT NULL,
  staff_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  acknowledged_at timestamptz DEFAULT now(),
  ip_address text,
  UNIQUE(policy_id, staff_id)
);

ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view acknowledgments"
  ON policy_acknowledgments FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff create acknowledgments"
  ON policy_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = auth.uid());

-- Shared System Tables

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category text CHECK (category IN ('booking', 'payment', 'referral', 'job', 'system', 'other')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS gdpr_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing', 'cookies', 'data_processing')),
  consent_version text NOT NULL,
  is_consented boolean NOT NULL,
  consent_text text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view consents"
  ON gdpr_consents FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users create consents"
  ON gdpr_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create performance indexes

CREATE INDEX idx_quotations_customer_email ON quotations(customer_email);
CREATE INDEX idx_quotations_booking_id ON quotations(booking_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_payment_links_customer_email ON payment_links(customer_email);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_packaging_orders_customer_email ON packaging_orders(customer_email);
CREATE INDEX idx_referrals_partner_id ON referrals(partner_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_commission_statements_partner_id ON commission_statements(partner_id);
CREATE INDEX idx_trade_jobs_status ON trade_jobs(status);
CREATE INDEX idx_trade_jobs_preferred_date ON trade_jobs(preferred_date);
CREATE INDEX idx_trade_bids_job_id ON trade_bids(job_id);
CREATE INDEX idx_trade_bids_bidder_trade_id ON trade_bids(bidder_trade_id);
CREATE INDEX idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX idx_availability_calendar_staff_id ON availability_calendar(staff_id);
CREATE INDEX idx_availability_calendar_date ON availability_calendar(date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_gdpr_consents_user_id ON gdpr_consents(user_id);