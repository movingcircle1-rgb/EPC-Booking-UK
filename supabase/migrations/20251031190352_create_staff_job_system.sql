/*
  # Staff Job Management System

  1. New Tables
    - `staff_job_assignments`
      - Links staff to specific removal jobs
      - Shows job details, customer info, addresses
      - Team members assigned to same job
    
    - `staff_timesheets`
      - Clock in/out functionality
      - Tracks actual hours worked per job
      - Calculates pay
    
    - `job_reports`
      - Staff can report issues (damage, delays)
      - Photos and notes
  
  2. Security
    - RLS enabled on all tables
    - Staff can only see their own assignments and timesheets
    - Staff can only report on jobs they're assigned to
*/

-- Staff Job Assignments
CREATE TABLE IF NOT EXISTS staff_job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) NOT NULL,
  job_date date NOT NULL,
  job_type text NOT NULL,
  customer_name text,
  pickup_address text NOT NULL,
  pickup_postcode text NOT NULL,
  delivery_address text,
  delivery_postcode text,
  start_time time,
  estimated_duration_hours integer DEFAULT 8,
  special_instructions text,
  team_members text[], -- Array of staff names on same job
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff Timesheets (Clock In/Out)
CREATE TABLE IF NOT EXISTS staff_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) NOT NULL,
  assignment_id uuid REFERENCES staff_job_assignments(id),
  clock_in_time timestamptz,
  clock_out_time timestamptz,
  total_hours decimal(4,2),
  break_minutes integer DEFAULT 0,
  hourly_rate decimal(6,2) DEFAULT 15.00,
  total_pay decimal(8,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job Issue Reports
CREATE TABLE IF NOT EXISTS job_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) NOT NULL,
  assignment_id uuid REFERENCES staff_job_assignments(id) NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('damage', 'delay', 'customer_issue', 'vehicle_issue', 'other')),
  description text NOT NULL,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  photo_urls text[],
  reported_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolution_notes text
);

-- Enable RLS
ALTER TABLE staff_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_job_assignments
CREATE POLICY "Staff can view own assignments"
  ON staff_job_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = staff_id);

CREATE POLICY "Staff can update own assignment status"
  ON staff_job_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = staff_id)
  WITH CHECK (auth.uid() = staff_id);

-- RLS Policies for staff_timesheets
CREATE POLICY "Staff can view own timesheets"
  ON staff_timesheets FOR SELECT
  TO authenticated
  USING (auth.uid() = staff_id);

CREATE POLICY "Staff can insert own timesheets"
  ON staff_timesheets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Staff can update own timesheets"
  ON staff_timesheets FOR UPDATE
  TO authenticated
  USING (auth.uid() = staff_id)
  WITH CHECK (auth.uid() = staff_id);

-- RLS Policies for job_reports
CREATE POLICY "Staff can view own reports"
  ON job_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = staff_id);

CREATE POLICY "Staff can create reports for assigned jobs"
  ON job_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = staff_id
    AND EXISTS (
      SELECT 1 FROM staff_job_assignments
      WHERE id = assignment_id
      AND staff_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_staff_date ON staff_job_assignments(staff_id, job_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_staff ON staff_timesheets(staff_id, clock_in_time);
CREATE INDEX IF NOT EXISTS idx_reports_staff ON job_reports(staff_id, reported_at);
