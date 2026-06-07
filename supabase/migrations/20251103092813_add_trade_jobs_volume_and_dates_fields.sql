/*
  # Add Trade Jobs Volume, Dates, and Requirements Fields

  1. Changes
    - Add volume_cubic_metres field for job volume
    - Add job_date field for confirmed job date
    - Add estimated_job_date field for unconfirmed/estimated date
    - Add additional_requirements field for special requirements

  2. Fields Added
    - volume_cubic_metres (numeric) - Job volume in cubic metres
    - job_date (date) - Confirmed job date
    - estimated_job_date (date) - Estimated/unconfirmed job date
    - additional_requirements (text) - Additional job requirements and notes

  3. Security
    - No RLS changes needed (existing policies apply)
*/

-- Add new fields to trade_jobs table
ALTER TABLE trade_jobs 
  ADD COLUMN IF NOT EXISTS volume_cubic_metres numeric(10,2),
  ADD COLUMN IF NOT EXISTS job_date date,
  ADD COLUMN IF NOT EXISTS estimated_job_date date,
  ADD COLUMN IF NOT EXISTS additional_requirements text;