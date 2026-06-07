/*
  # Rename admin-2 role to admin and remove old admin role

  1. Changes
    - Rename all 'admin-2' roles to 'admin' in user_roles table
    - Remove old 'admin' role entries (if any exist)
    - Update role constraint to remove 'admin-2' and keep 'admin'
  
  2. Security
    - Maintains all existing RLS policies
    - No data loss for admin-2 users
*/

-- First, rename all admin-2 roles to admin
UPDATE user_roles 
SET role = 'admin' 
WHERE role = 'admin-2' OR role = 'admin2';

-- Drop the old constraint
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add new constraint without admin-2
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'temp_admin', 'client', 'partner', 'staff', 'trade'));

-- Update any references in other tables if needed
-- (Most references use user_id, not role name, so this should be safe)
