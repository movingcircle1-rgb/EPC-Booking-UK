/*
  # Add Staff Profile Consent, Available Date, and CV Fields

  1. Changes
    - Add consent checkbox field for work contact permission
    - Add available_from_date field for work availability
    - Add cv_file_url field for CV upload storage

  2. Fields Added
    - contact_consent (boolean) - Consent to be contacted about work
    - available_from_date (date) - Date available for work from
    - cv_file_url (text) - URL to uploaded CV file

  3. Security
    - No RLS changes needed (existing policies apply)
*/

-- Add new fields to staff_profiles table
ALTER TABLE staff_profiles 
  ADD COLUMN IF NOT EXISTS contact_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_from_date date,
  ADD COLUMN IF NOT EXISTS cv_file_url text;