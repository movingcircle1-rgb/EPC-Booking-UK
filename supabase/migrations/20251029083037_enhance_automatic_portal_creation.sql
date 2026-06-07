/*
  # Enhanced Automatic Portal Account Creation

  ## Overview
  This migration enhances the automatic creation of portal-specific records when users sign up.
  It ensures that when a user registers with a specific role (partner, trade, staff), the 
  corresponding portal account is automatically created with proper default values.

  ## Changes Made
  1. Updates the handle_new_user() trigger function to create portal-specific records
  2. Creates entries in partners, trade_accounts, or staff_profiles based on user role
  3. Adds proper error handling and default values
  4. Ensures data consistency between user_roles and portal-specific tables

  ## Tables Affected
  - user_roles (existing)
  - partners (existing)
  - trade_accounts (existing)
  - staff_profiles (existing)

  ## Security
  - Maintains existing RLS policies
  - Uses SECURITY DEFINER for trigger function to ensure proper permissions
*/

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create enhanced function to handle new user signup with portal-specific record creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_full_name text;
  v_phone text;
  v_email text;
  v_user_roles_id uuid;
BEGIN
  -- Extract metadata from the new user
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
  v_email := new.email;
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'client');

  -- Create user_roles record
  INSERT INTO public.user_roles (user_id, role, full_name, phone)
  VALUES (new.id, v_role, v_full_name, v_phone)
  RETURNING id INTO v_user_roles_id;

  -- Create role-specific records based on the user's role
  IF v_role = 'partner' THEN
    -- Create partner record
    INSERT INTO public.partners (
      user_id, 
      company_name, 
      contact_name, 
      email, 
      phone, 
      status,
      partnership_type
    )
    VALUES (
      new.id,
      COALESCE(NULLIF(v_full_name, ''), 'Partner Company'),
      COALESCE(NULLIF(v_full_name, ''), 'Partner Contact'),
      v_email,
      COALESCE(NULLIF(v_phone, ''), 'Not Provided'),
      'pending',
      'referral'
    )
    ON CONFLICT (email) DO NOTHING;

  ELSIF v_role = 'trade' THEN
    -- Create trade account record
    INSERT INTO public.trade_accounts (
      user_id,
      business_name,
      contact_name,
      email,
      phone,
      account_status,
      discount_rate,
      credit_limit
    )
    VALUES (
      new.id,
      COALESCE(NULLIF(v_full_name, ''), 'Trade Business'),
      COALESCE(NULLIF(v_full_name, ''), 'Trade Contact'),
      v_email,
      COALESCE(NULLIF(v_phone, ''), 'Not Provided'),
      'pending',
      0,
      0
    )
    ON CONFLICT (email) DO NOTHING;

  ELSIF v_role = 'staff' THEN
    -- Create staff profile record
    INSERT INTO public.staff_profiles (
      user_id,
      job_role,
      hire_date
    )
    VALUES (
      new.id,
      'Pending Assignment',
      CURRENT_DATE
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating portal-specific record for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a helper function to manually create missing portal records for existing users
CREATE OR REPLACE FUNCTION public.create_missing_portal_records(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_role text;
  v_full_name text;
  v_phone text;
  v_email text;
  v_partner_exists boolean;
  v_trade_exists boolean;
  v_staff_exists boolean;
BEGIN
  -- Get user role and details
  SELECT ur.role, ur.full_name, ur.phone, u.email
  INTO v_role, v_full_name, v_phone, v_email
  FROM user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.user_id = p_user_id;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check if portal records exist
  SELECT EXISTS(SELECT 1 FROM partners WHERE user_id = p_user_id) INTO v_partner_exists;
  SELECT EXISTS(SELECT 1 FROM trade_accounts WHERE user_id = p_user_id) INTO v_trade_exists;
  SELECT EXISTS(SELECT 1 FROM staff_profiles WHERE user_id = p_user_id) INTO v_staff_exists;

  -- Create missing records based on role
  IF v_role = 'partner' AND NOT v_partner_exists THEN
    INSERT INTO public.partners (
      user_id, company_name, contact_name, email, phone, status, partnership_type
    )
    VALUES (
      p_user_id,
      COALESCE(NULLIF(v_full_name, ''), 'Partner Company'),
      COALESCE(NULLIF(v_full_name, ''), 'Partner Contact'),
      v_email,
      COALESCE(NULLIF(v_phone, ''), 'Not Provided'),
      'pending',
      'referral'
    )
    ON CONFLICT (email) DO NOTHING;
    
  ELSIF v_role = 'trade' AND NOT v_trade_exists THEN
    INSERT INTO public.trade_accounts (
      user_id, business_name, contact_name, email, phone, account_status, discount_rate, credit_limit
    )
    VALUES (
      p_user_id,
      COALESCE(NULLIF(v_full_name, ''), 'Trade Business'),
      COALESCE(NULLIF(v_full_name, ''), 'Trade Contact'),
      v_email,
      COALESCE(NULLIF(v_phone, ''), 'Not Provided'),
      'pending',
      0,
      0
    )
    ON CONFLICT (email) DO NOTHING;
    
  ELSIF v_role = 'staff' AND NOT v_staff_exists THEN
    INSERT INTO public.staff_profiles (user_id, job_role, hire_date)
    VALUES (p_user_id, 'Pending Assignment', CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating missing portal record for user %: %', p_user_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.create_missing_portal_records(uuid) TO authenticated;