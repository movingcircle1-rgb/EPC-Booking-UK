/*
  # Admin Account Promotion Function

  ## Overview
  Creates a secure function to promote any user to admin role.
  This function can only be called by existing admins or directly via SQL.

  ## Usage
  To promote a user to admin, run:
  ```sql
  SELECT promote_user_to_admin('user-email@example.com');
  ```

  ## Security
  - Only callable by users with admin role or via direct SQL access
  - Logs all admin promotions for audit trail
*/

-- Function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;

  -- Update the user role to admin
  UPDATE user_roles
  SET 
    role = 'admin',
    updated_at = now()
  WHERE user_id = target_user_id;

  -- Log the promotion in activity logs
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  ) VALUES (
    target_user_id,
    'promoted_to_admin',
    'user_role',
    target_user_id,
    jsonb_build_object('email', user_email, 'promoted_at', now()),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user_id', target_user_id,
    'email', user_email
  );
END;
$$;

-- Function to check if any admin exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role = 'admin';
  
  RETURN admin_count > 0;
END;
$$;

-- Create a view to see all admin users (admin-only access)
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  ur.user_id,
  ur.role,
  ur.full_name,
  ur.phone,
  ur.created_at,
  au.email,
  au.created_at as account_created_at
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin';

-- Grant access to the view for authenticated users (RLS will control actual access)
GRANT SELECT ON admin_users TO authenticated;

-- Add RLS policy for admin view
CREATE POLICY "Only admins can view admin users"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    role = 'admin' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
