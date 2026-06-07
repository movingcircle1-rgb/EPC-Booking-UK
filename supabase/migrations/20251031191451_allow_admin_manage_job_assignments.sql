/*
  # Allow Admin to Manage Job Assignments

  1. Changes
    - Add INSERT policy for admins to create job assignments
    - Add SELECT policy for admins to view all job assignments
    - Add UPDATE policy for admins to modify job assignments
    - Add DELETE policy for admins to remove job assignments
    
  2. Security
    - Only users with 'admin' role can manage all assignments
    - Staff can still only see their own assignments
    - Uses the existing is_admin() function to check role
*/

-- Create function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all job assignments
CREATE POLICY "Admins can view all assignments"
  ON staff_job_assignments FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin can create job assignments for any staff
CREATE POLICY "Admins can create assignments"
  ON staff_job_assignments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admin can update any job assignment
CREATE POLICY "Admins can update assignments"
  ON staff_job_assignments FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete job assignments
CREATE POLICY "Admins can delete assignments"
  ON staff_job_assignments FOR DELETE
  TO authenticated
  USING (is_admin());
