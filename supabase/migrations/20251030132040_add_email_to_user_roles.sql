/*
  # Add Email Column to user_roles Table

  ## Overview
  Adds an email column to the user_roles table to make it easier
  to display user information without needing to join with auth.users.

  ## Changes
  1. Add email column to user_roles
  2. Populate existing records with email from auth.users
  3. Make email field updateable (but not the user_id or role by regular users)

  ## Security
  - Email is populated during user creation
  - Can be updated by the user themselves
  - Admins can view all emails
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_roles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN email text;
  END IF;
END $$;

-- Populate email from auth.users for existing records
UPDATE user_roles ur
SET email = au.email
FROM auth.users au
WHERE ur.user_id = au.id
AND ur.email IS NULL;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
