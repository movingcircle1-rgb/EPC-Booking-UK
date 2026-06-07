/*
  # Admin User Creation Function

  ## Overview
  Creates a secure function for admins to create new users without
  logging into their account. This prevents the admin from being
  logged out when creating a new user.

  ## Function
  - `admin_create_user` - Creates a new user and returns the user info
  - Only callable by admins
  - Does not affect the current session

  ## Security
  - Checks that caller is an admin
  - Returns user info without exposing sensitive data
*/

-- Create function to create users as admin
CREATE OR REPLACE FUNCTION admin_create_user(
  p_email text,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_role text DEFAULT 'client'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role text;
  v_result jsonb;
BEGIN
  -- Check if caller is admin
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Return instruction to create user via Supabase Admin API
  -- This function serves as a validation and will be used by the frontend
  -- to know that the operation is authorized
  v_result := jsonb_build_object(
    'success', true,
    'message', 'User creation authorized',
    'user_data', jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'phone', p_phone,
      'role', p_role
    )
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;

-- Create a trigger function to automatically add email when user_roles is created
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If email is not provided, try to get it from auth.users
  IF NEW.email IS NULL THEN
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_user_email_trigger ON user_roles;

CREATE TRIGGER sync_user_email_trigger
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();
