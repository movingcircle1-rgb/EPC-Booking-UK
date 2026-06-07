/*
  # Remove Temporary Public Insert Policy
  
  Removes the temporary policy that was used for initial data load.
*/

-- Remove temporary public insert policy
DROP POLICY IF EXISTS "Temp public insert for data load" ON locations;
