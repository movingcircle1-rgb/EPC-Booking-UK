/*
  # Create and Enhance Quotes System

  ## Overview
  Creates the quotes table for quote request submissions and enhances it to integrate
  with the portal system and user accounts. Creates a seamless workflow from quote 
  requests to formal quotations.

  ## Changes Made

  1. **Quotes Table Creation**
    - `id` (uuid, primary key)
    - `user_id` (uuid, optional) - links to registered users
    - `quote_number` (text, unique) - auto-generated tracking reference
    - `name` (text) - customer name
    - `email` (text) - customer email
    - `phone` (text) - customer phone
    - `service_type` (text) - type of service requested
    - `location` (text) - general location info
    - `from_postcode` (text) - origin postcode
    - `to_postcode` (text) - destination postcode
    - `property_size` (text) - size of property/items
    - `preferred_date` (date) - preferred moving date
    - `flexible_dates` (boolean) - date flexibility
    - `message` (text) - additional details
    - `additional_requirements` (text) - special requirements
    - `status` (text) - processing status
    - `quotation_id` (uuid) - links to created quotation
    - `assigned_to` (uuid) - assigned staff member
    - `processed_at` (timestamptz) - when quote was processed
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. **Auto-generation Functions**
    - Quote number generator with format QR-YYYYMM-#####
    - Sequence for unique quote numbers
    - Triggers for auto-generating quote numbers and updating timestamps

  3. **Performance Indexes**
    - Index on user_id for fast user lookups
    - Index on email for anonymous user matching
    - Index on quote_number for tracking
    - Index on status for filtering

  4. **Security - Row Level Security**
    - Public can submit quote requests
    - Users can view their own quotes (by user_id or email)
    - Admins/staff can view and manage all quotes
    - Restrictive policies prevent unauthorized access

  ## Important Notes
  - Quote numbers are auto-generated in format: QR-202510-00001
  - Anonymous submissions are allowed and can be linked to users later
  - Status transitions: new → contacted → quoted → accepted/declined
*/

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  quote_number text UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text NOT NULL,
  location text,
  from_postcode text,
  to_postcode text,
  property_size text,
  preferred_date date,
  flexible_dates boolean DEFAULT false,
  message text,
  additional_requirements text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'pending', 'contacted', 'quoted', 'accepted', 'declined', 'expired', 'completed')),
  quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  seq_num := LPAD(NEXTVAL('quote_number_seq')::TEXT, 5, '0');
  new_number := 'QR-' || year_month || '-' || seq_num;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate quote numbers
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate quote numbers on insert
DROP TRIGGER IF EXISTS trigger_set_quote_number ON quotes;
CREATE TRIGGER trigger_set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_number();

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row updates
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quotation_id ON quotes(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- RLS Policies

-- Allow public (anonymous) to submit quote requests
CREATE POLICY "Public can submit quote requests"
  ON quotes FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to view their own quotes by user_id
CREATE POLICY "Users view own quotes by user_id"
  ON quotes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to view quotes matching their email
CREATE POLICY "Users view own quotes by email"
  ON quotes FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Allow admins and staff to view all quotes
CREATE POLICY "Admins view all quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Allow admins and staff to update quotes
CREATE POLICY "Admins update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Allow admins to delete quotes
CREATE POLICY "Admins delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );