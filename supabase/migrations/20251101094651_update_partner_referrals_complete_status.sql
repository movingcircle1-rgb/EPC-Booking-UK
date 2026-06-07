/*
  # Update Partner Referrals - Add Complete Status

  1. Changes
    - Add 'complete' to status enum for partner_referrals
    - Add completed_date column
  
  2. Security
    - No changes to RLS policies
*/

-- Update status check constraint to include 'complete'
ALTER TABLE partner_referrals DROP CONSTRAINT IF EXISTS partner_referrals_status_check;

ALTER TABLE partner_referrals ADD CONSTRAINT partner_referrals_status_check 
  CHECK (status IN ('pending', 'contacted', 'quoted', 'won', 'lost', 'cancelled', 'complete'));

-- Add completed_date column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_referrals' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE partner_referrals ADD COLUMN completed_date timestamptz;
  END IF;
END $$;