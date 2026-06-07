/*
  # Enhance Trade Portal System

  ## Overview
  This migration enhances the trade portal with GDPR compliance, account manager assignment,
  and improved notifications for a complete trade partner experience.

  ## Changes

  1. **Trade Accounts Enhancements**
    - Add `gdpr_consent` field for GDPR compliance
    - Add `gdpr_consent_date` timestamp
    - Add `account_manager_name` for designated contact
    - Add `account_manager_email` for direct communication
    - Add `account_manager_phone` for support calls
    - Add `company_registration_number` for verification
    - Add `vat_number` for invoicing

  2. **Trade Jobs Enhancements**
    - Add `is_purchased` flag to track direct purchases
    - Add `purchased_by_trade_id` for purchase tracking
    - Add `purchase_price` for fixed-price purchases

  3. **Notifications Table Enhancement**
    - Ensure notifications table exists with trade portal support

  ## Security
    - RLS policies remain enabled on all tables
    - Trade partners can only access their own records
    - Admin users have full access for management
*/

-- Add GDPR and account manager fields to trade_accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'gdpr_consent'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN gdpr_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'gdpr_consent_date'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN gdpr_consent_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'account_manager_name'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN account_manager_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'account_manager_email'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN account_manager_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'account_manager_phone'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN account_manager_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'company_registration_number'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN company_registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_accounts' AND column_name = 'vat_number'
  ) THEN
    ALTER TABLE trade_accounts ADD COLUMN vat_number text;
  END IF;
END $$;

-- Add purchase tracking fields to trade_jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_jobs' AND column_name = 'is_purchased'
  ) THEN
    ALTER TABLE trade_jobs ADD COLUMN is_purchased boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_jobs' AND column_name = 'purchased_by_trade_id'
  ) THEN
    ALTER TABLE trade_jobs ADD COLUMN purchased_by_trade_id uuid REFERENCES trade_accounts(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trade_jobs' AND column_name = 'purchase_price'
  ) THEN
    ALTER TABLE trade_jobs ADD COLUMN purchase_price numeric(10,2);
  END IF;
END $$;

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
      ON notifications FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON notifications FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications' AND policyname = 'System can insert notifications'
  ) THEN
    CREATE POLICY "System can insert notifications"
      ON notifications FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_status ON trade_jobs(status);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_purchased ON trade_jobs(is_purchased);
CREATE INDEX IF NOT EXISTS idx_trade_bids_status ON trade_bids(status);

-- Update default account manager for existing trade accounts (example)
UPDATE trade_accounts 
SET 
  account_manager_name = 'Trade Support Team',
  account_manager_email = 'trade@nationalremovalsandstorage.co.uk',
  account_manager_phone = '+44 1902 123456'
WHERE account_manager_name IS NULL;
