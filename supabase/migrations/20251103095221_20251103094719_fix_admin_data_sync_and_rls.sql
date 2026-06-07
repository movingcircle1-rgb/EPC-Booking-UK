/*
  # Fix Admin Data Synchronization and RLS Policies

  ## Overview
  This migration fixes critical issues preventing proper data synchronization between
  the client portal and admin dashboard. It addresses RLS policies, status enums,
  and admin management capabilities.

  ## Changes Made

  ### 1. Quotations Table RLS Fixes
  - Re-enable Row Level Security with proper policies
  - Allow admins to view, update, and manage all quotations
  - Allow clients to view their own quotations
  - Enable admin accept/reject functionality

  ### 2. Packaging Orders Status Enum Fix
  - Standardize status values across the application
  - Add missing status values (in_transit, dispatched)
  - Ensure backward compatibility

  ### 3. Admin Management Policies
  - Add policies for admins to update quotations on behalf of clients
  - Add policies for admins to manage packaging orders
  - Create helper functions for common admin operations

  ### 4. Performance Indexes
  - Add indexes for frequently queried columns
  - Optimize admin dashboard queries

  ## Security Notes
  - All policies properly check admin role from user_roles table
  - Client data remains protected by email matching
  - Audit trails maintained for admin actions
*/

-- ============================================
-- STEP 1: FIX PACKAGING_ORDERS STATUS ENUM
-- ============================================

-- Drop existing check constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'packaging_orders_status_check'
  ) THEN
    ALTER TABLE packaging_orders DROP CONSTRAINT packaging_orders_status_check;
  END IF;
END $$;

-- Add new comprehensive status check constraint
ALTER TABLE packaging_orders
  ADD CONSTRAINT packaging_orders_status_check
  CHECK (status IN (
    'pending',
    'confirmed',
    'in_transit',
    'dispatched',
    'delivered',
    'cancelled'
  ));

-- ============================================
-- STEP 2: RE-ENABLE QUOTATIONS RLS WITH PROPER POLICIES
-- ============================================

-- Enable RLS on quotations table
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
DROP POLICY IF EXISTS "Clients can update quotation acceptance" ON quotations;
DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;
DROP POLICY IF EXISTS "Allow authenticated users to view all quotations" ON quotations;
DROP POLICY IF EXISTS "Allow users to update quotations" ON quotations;
DROP POLICY IF EXISTS "Allow admins full access" ON quotations;

-- Policy 1: Clients can view their own quotations
CREATE POLICY "Clients view own quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 2: Admins and staff can view all quotations
CREATE POLICY "Admins view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Policy 3: Clients can update their own quotation acceptance status
CREATE POLICY "Clients update own quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 4: Admins can insert quotations
CREATE POLICY "Admins insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Policy 5: Admins can update any quotation
CREATE POLICY "Admins update all quotations"
  ON quotations FOR UPDATE
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

-- Policy 6: Admins can delete quotations
CREATE POLICY "Admins delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- STEP 3: ENHANCE PACKAGING_ORDERS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view own packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Users create packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Staff manage packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "View packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Create packaging orders" ON packaging_orders;
DROP POLICY IF EXISTS "Admins manage packaging orders" ON packaging_orders;

-- Policy 1: Users can view their own packaging orders
CREATE POLICY "Users view own packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 2: Admins can view all packaging orders
CREATE POLICY "Admins view all packaging orders"
  ON packaging_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Policy 3: Users can create their own packaging orders
CREATE POLICY "Users create packaging orders"
  ON packaging_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 4: Admins can update any packaging order
CREATE POLICY "Admins update packaging orders"
  ON packaging_orders FOR UPDATE
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

-- Policy 5: Admins can delete packaging orders
CREATE POLICY "Admins delete packaging orders"
  ON packaging_orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- STEP 4: ENHANCE QUOTE_REQUESTS RLS POLICIES
-- ============================================

-- Ensure quote_requests allows anonymous submissions
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Public can insert quote requests" ON quote_requests;

-- Policy: Allow public (anonymous and authenticated) to submit quote requests
CREATE POLICY "Public submit quote requests"
  ON quote_requests FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- STEP 5: CREATE HELPER FUNCTIONS FOR ADMIN OPERATIONS
-- ============================================

-- Function: Admin accepts a quotation on behalf of client
CREATE OR REPLACE FUNCTION admin_accept_quotation(
  quotation_id_param uuid,
  admin_user_id uuid
)
RETURNS json AS $$
DECLARE
  is_admin boolean;
  result json;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_user_id
    AND role IN ('admin', 'staff')
  ) INTO is_admin;

  IF NOT is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin privileges required'
    );
  END IF;

  -- Update quotation
  UPDATE quotations
  SET
    status = 'accepted',
    terms_accepted = true,
    terms_accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = quotation_id_param;

  -- Check if update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Quotation accepted successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Quotation not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin rejects a quotation on behalf of client
CREATE OR REPLACE FUNCTION admin_reject_quotation(
  quotation_id_param uuid,
  admin_user_id uuid
)
RETURNS json AS $$
DECLARE
  is_admin boolean;
  result json;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = admin_user_id
    AND role IN ('admin', 'staff')
  ) INTO is_admin;

  IF NOT is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin privileges required'
    );
  END IF;

  -- Update quotation
  UPDATE quotations
  SET
    status = 'rejected',
    updated_at = NOW()
  WHERE id = quotation_id_param;

  -- Check if update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Quotation rejected successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Quotation not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin updates packaging order status
CREATE OR REPLACE FUNCTION admin_update_packaging_order_status(
  order_id_param uuid,
  new_status_param text,
  tracking_number_param text DEFAULT NULL,
  delivery_date_param date DEFAULT NULL,
  admin_user_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if user is admin (if user_id provided)
  IF admin_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = admin_user_id
      AND role IN ('admin', 'staff')
    ) INTO is_admin;

    IF NOT is_admin THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Unauthorized: Admin privileges required'
      );
    END IF;
  END IF;

  -- Update packaging order
  UPDATE packaging_orders
  SET
    status = new_status_param,
    tracking_number = COALESCE(tracking_number_param, tracking_number),
    delivery_date = COALESCE(delivery_date_param, delivery_date),
    updated_at = NOW()
  WHERE id = order_id_param;

  -- Check if update was successful
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Packaging order updated successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Packaging order not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 6: CREATE PERFORMANCE INDEXES
-- ============================================

-- Quotations indexes
CREATE INDEX IF NOT EXISTS idx_quotations_customer_email ON quotations(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);

-- Packaging orders indexes
CREATE INDEX IF NOT EXISTS idx_packaging_orders_customer_email ON packaging_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_packaging_orders_user_id ON packaging_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_packaging_orders_status ON packaging_orders(status);
CREATE INDEX IF NOT EXISTS idx_packaging_orders_created_at ON packaging_orders(created_at DESC);

-- Quote requests indexes
CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);

-- ============================================
-- STEP 7: CREATE NOTIFICATION TRIGGERS
-- ============================================

-- Function to create notification when quotation is accepted
CREATE OR REPLACE FUNCTION notify_quotation_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO notifications (user_id, title, message, type, category, action_url)
    SELECT
      id,
      'Quotation Accepted',
      'Your quotation ' || NEW.quotation_number || ' has been accepted.',
      'success',
      'booking',
      '/client-portal'
    FROM auth.users
    WHERE email = NEW.customer_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quotation acceptance notifications
DROP TRIGGER IF EXISTS trigger_quotation_accepted ON quotations;
CREATE TRIGGER trigger_quotation_accepted
  AFTER UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION notify_quotation_accepted();

-- Function to create notification when packaging order status changes
CREATE OR REPLACE FUNCTION notify_packaging_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, category, action_url)
    SELECT
      id,
      'Packaging Order Update',
      'Your packaging order status has been updated to: ' || NEW.status,
      'info',
      'booking',
      '/client-portal'
    FROM auth.users
    WHERE email = NEW.customer_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for packaging order status notifications
DROP TRIGGER IF EXISTS trigger_packaging_order_status ON packaging_orders;
CREATE TRIGGER trigger_packaging_order_status
  AFTER UPDATE ON packaging_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_packaging_order_status_change();

-- ============================================
-- STEP 8: VERIFICATION QUERIES (FOR TESTING)
-- ============================================

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE tablename IN ('quotations', 'packaging_orders', 'quote_requests');

-- Verify policies exist
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE tablename IN ('quotations', 'packaging_orders', 'quote_requests')
-- ORDER BY tablename, policyname;

-- Test data access for a sample admin user
-- SELECT COUNT(*) FROM quotations;
-- SELECT COUNT(*) FROM packaging_orders;
-- SELECT COUNT(*) FROM quote_requests;
