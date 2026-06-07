/*
  # Comprehensive Admin Portal System

  ## Overview
  This migration creates a complete admin management system including compliance tracking,
  announcements, support tickets, and analytics tables.

  ## New Tables

  1. **company_documents**
    - Store insurance certificates, licenses, and compliance documents
    - Fields: document_type, title, file_url, expiry_date, status
    - RLS: Admin-only access

  2. **announcements**
    - System-wide announcements and notifications
    - Fields: title, message, target_roles, priority, scheduled_date
    - RLS: Admins create, users view based on role

  3. **support_tickets**
    - Customer and partner support ticket system
    - Fields: subject, description, status, priority, assigned_to
    - RLS: Users create own tickets, admins view all

  4. **business_analytics**
    - Store aggregated business metrics for reporting
    - Fields: metric_name, metric_value, period, category
    - RLS: Admin-only access

  5. **activity_logs**
    - Audit trail for all system actions
    - Fields: user_id, action, entity_type, entity_id, details
    - RLS: Admin-only access

  ## Security
    - All tables have RLS enabled
    - Admin users have full access
    - Regular users have restricted access based on ownership
*/

-- Create company_documents table
CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  expiry_date date,
  status text DEFAULT 'active',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage company documents"
  ON company_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_roles text[] DEFAULT ARRAY['client', 'trade', 'partner', 'staff'],
  priority text DEFAULT 'normal',
  scheduled_date timestamptz,
  published boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Users can view published announcements for their role"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY(target_roles)
    )
  );

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  category text,
  assigned_to uuid REFERENCES auth.users(id),
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Create business_analytics table
CREATE TABLE IF NOT EXISTS business_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_data jsonb,
  period_start date NOT NULL,
  period_end date NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage analytics"
  ON business_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_company_documents_status ON company_documents(status);
CREATE INDEX IF NOT EXISTS idx_company_documents_expiry ON company_documents(expiry_date);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published);
CREATE INDEX IF NOT EXISTS idx_announcements_target_roles ON announcements USING gin(target_roles);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_analytics_category ON business_analytics(category);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON business_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter int;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM support_tickets;
  new_number := 'TICKET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ticket_number_trigger ON support_tickets;
CREATE TRIGGER ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();
