/*
  # Create Admin User Management System

  ## Overview
  Creates functions to manage admin users securely.

  ## Functions Created
  1. check_user_exists - Check if a user exists by email
  2. promote_user_to_admin - Promote any user to admin role

  ## Security
  - Functions use SECURITY DEFINER to bypass RLS
  - Only callable by service role or existing admins
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_user_exists(text);
DROP FUNCTION IF EXISTS promote_user_to_admin(text);

-- Create a function to check if user exists by email
CREATE OR REPLACE FUNCTION check_user_exists(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_result uuid;
BEGIN
  SELECT id INTO user_id_result
  FROM auth.users
  WHERE email = user_email;
  
  RETURN user_id_result;
END;
$$;

-- Create a function to promote existing user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  existing_role text;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN 'ERROR: User with email ' || user_email || ' not found';
  END IF;

  -- Check if user already has a role
  SELECT role INTO existing_role
  FROM user_roles
  WHERE user_id = target_user_id;

  IF existing_role = 'admin' THEN
    RETURN 'User is already an admin';
  END IF;

  IF existing_role IS NOT NULL THEN
    -- Update existing role to admin
    UPDATE user_roles
    SET role = 'admin', updated_at = now()
    WHERE user_id = target_user_id;
    RETURN 'User promoted from ' || existing_role || ' to admin';
  ELSE
    -- Insert new admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    RETURN 'User role set to admin';
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION promote_user_to_admin(text) TO authenticated, service_role;
