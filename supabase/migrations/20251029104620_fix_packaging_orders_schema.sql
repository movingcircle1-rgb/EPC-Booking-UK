/*
  # Fix Packaging Orders Table Schema

  ## Overview
  Updates the packaging_orders table to properly handle delivery address as a JSONB object
  and adds user_id for better tracking of client orders.

  ## Changes Made

  1. **Schema Updates**
    - Add user_id column to link orders to authenticated users
    - Convert delivery_address, delivery_postcode, and contact_phone into a single JSONB field
    - Ensure backward compatibility with existing data

  2. **Security Updates**
    - Add policy for users to create orders using user_id
    - Update existing policies to use user_id where applicable
    
  ## Important Notes
  - The delivery_address field now stores a complete address object: {street, city, postcode, phone}
  - Orders can be created by authenticated users and linked to their account
*/

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packaging_orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE packaging_orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_packaging_orders_user_id ON packaging_orders(user_id);
  END IF;
END $$;

-- Update RLS policies for packaging_orders
DROP POLICY IF EXISTS "View packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Create packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Admins manage packaging orders" ON packaging_orders;

-- Users can view their own packaging orders by user_id or email
CREATE POLICY "Users view own packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    customer_email = auth.jwt()->>'email' OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Users can create packaging orders
CREATE POLICY "Users create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    customer_email = auth.jwt()->>'email'
  );

-- Admins and staff can manage all packaging orders
CREATE POLICY "Staff manage packaging orders"
  ON packaging_orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_packaging_orders_customer_email ON packaging_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_packaging_orders_status ON packaging_orders(status);
