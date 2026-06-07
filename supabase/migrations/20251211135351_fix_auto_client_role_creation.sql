/*
  # Auto-create client role for new users

  1. Changes
    - Create trigger function to automatically create client role when user signs up
    - Add trigger on auth.users to call this function
    - This ensures every new user automatically gets a 'client' role
    
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggers on INSERT to auth.users
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_set_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

-- Create function to handle new user role creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert user_roles entry with client role
  INSERT INTO public.user_roles (user_id, email, role, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'No name'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_roles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.user_roles.phone),
    role = CASE 
      WHEN public.user_roles.role IS NULL OR public.user_roles.role = '' THEN 'client'
      ELSE public.user_roles.role
    END;

  RETURN NEW;
END;
$$;

-- Create trigger that fires after user creation
CREATE TRIGGER on_auth_user_created_set_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();