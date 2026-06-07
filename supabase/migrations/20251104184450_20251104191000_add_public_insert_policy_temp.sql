/*
  # Temporary Public Insert Policy for Initial Data Load
  
  This migration adds a temporary policy to allow initial data import.
  This should be removed after the initial import is complete.
*/

-- Temporarily allow public inserts for initial data load
CREATE POLICY "Temp public insert for data load"
  ON locations
  FOR INSERT
  TO public
  WITH CHECK (true);
