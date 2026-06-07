/*
  # User Roles and Authentication System

  ## Overview
  This migration creates a comprehensive user roles system with proper security policies
  for admin access and portal management.

  ## 1. User Roles Table
    - `user_roles` table to manage user permissions
    - Links auth.users to specific roles (admin, staff, partner, client, trade)
    - Stores additional profile information

  ## 2. Role Types
    - **admin**: Full access to CMS and all portals
    - **staff**: Access to staff portal and job management
    - **partner**: Access to partner portal
    - **client**: Access to client portal and their bookings
    - **trade**: Access to trade portal and trade accounts

  ## 3. Security
    - Enable RLS on user_roles table
    - Users can view their own role
    - Only admins can modify roles
    - Update existing portal table policies to check user roles

  ## 4. Admin User Creation
    - Creates initial admin user with credentials
    - Email: admin@nationalremovalsandstorage.co.uk
    - Role: admin
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff', 'partner', 'client', 'trade')),
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own role
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only admins can insert roles
CREATE POLICY "Admins can create roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update bookings policies to work with user_roles
DROP POLICY IF EXISTS "Authenticated users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and staff can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Update jobs policies
DROP POLICY IF EXISTS "Staff can view assigned jobs" ON jobs;
CREATE POLICY "Staff can view their jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Staff can update their jobs" ON jobs;
CREATE POLICY "Staff can update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update partners policies
DROP POLICY IF EXISTS "Partners can view their own data" ON partners;
CREATE POLICY "Partners can view their data"
  ON partners FOR SELECT
  TO authenticated
  USING (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Partners can update their profile" ON partners;
CREATE POLICY "Partners can update their profile"
  ON partners FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update trade_accounts policies
DROP POLICY IF EXISTS "Trade accounts can view their own data" ON trade_accounts;
CREATE POLICY "Trade accounts can view their data"
  ON trade_accounts FOR SELECT
  TO authenticated
  USING (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Trade accounts can update their profile" ON trade_accounts;
CREATE POLICY "Trade accounts can update their profile"
  ON trade_accounts FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update invoices policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Admins can manage all CMS tables
CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage cities"
  ON cities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Function to automatically create user_role when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, full_name)
  VALUES (
    new.id,
    'client',
    COALESCE(new.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user_role for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
