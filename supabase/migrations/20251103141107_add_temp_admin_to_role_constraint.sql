/*
  # Add temp_admin to user_roles constraint
  
  1. Purpose
    - Update the CHECK constraint on user_roles table to allow 'temp_admin' role
  
  2. Changes
    - Drop existing constraint
    - Add new constraint including 'temp_admin'
*/

-- Drop the existing constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add new constraint that includes temp_admin
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'staff', 'partner', 'client', 'trade', 'temp_admin'));
