/*
  # Create Temporary Admin Role System
  
  1. Purpose
    - Create a new "temp_admin" role for limited administrative access
    - Grant access ONLY to Locations (cities table) and Auto-Linking (keywords table) features
    - Restrict access to all other admin functionalities
  
  2. New Role
    - Add "temp_admin" to user_roles table
    - Configure to allow management of cities and keywords tables
  
  3. Security
    - Enable RLS policies for temp_admin to access cities table
    - Enable RLS policies for temp_admin to access keywords table
    - Enable RLS policies for temp_admin to access location_services table
    - Enable RLS policies for temp_admin to access location_content_templates table
    - Restrict temp_admin from accessing user management, quotations, etc.
  
  4. Tables Affected
    - user_roles (allow temp_admin role)
    - cities (grant read/write access)
    - keywords (grant read/write access)
    - location_services (grant read/write access)
    - location_content_templates (grant read/write access)
*/

-- Add RLS policies for temp_admin to view and manage cities table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cities' 
    AND policyname = 'Temp admins can view all cities'
  ) THEN
    CREATE POLICY "Temp admins can view all cities"
      ON cities FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cities' 
    AND policyname = 'Temp admins can insert cities'
  ) THEN
    CREATE POLICY "Temp admins can insert cities"
      ON cities FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cities' 
    AND policyname = 'Temp admins can update cities'
  ) THEN
    CREATE POLICY "Temp admins can update cities"
      ON cities FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cities' 
    AND policyname = 'Temp admins can delete cities'
  ) THEN
    CREATE POLICY "Temp admins can delete cities"
      ON cities FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

-- Add RLS policies for temp_admin to view and manage keywords table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' 
    AND policyname = 'Temp admins can view all keywords'
  ) THEN
    CREATE POLICY "Temp admins can view all keywords"
      ON keywords FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' 
    AND policyname = 'Temp admins can insert keywords'
  ) THEN
    CREATE POLICY "Temp admins can insert keywords"
      ON keywords FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' 
    AND policyname = 'Temp admins can update keywords'
  ) THEN
    CREATE POLICY "Temp admins can update keywords"
      ON keywords FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'keywords' 
    AND policyname = 'Temp admins can delete keywords'
  ) THEN
    CREATE POLICY "Temp admins can delete keywords"
      ON keywords FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

-- Add RLS policies for temp_admin to view and manage location_services table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'location_services' 
    AND policyname = 'Temp admins can manage location services'
  ) THEN
    CREATE POLICY "Temp admins can manage location services"
      ON location_services FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;

-- Add RLS policies for temp_admin to view and manage location_content_templates table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'location_content_templates' 
    AND policyname = 'Temp admins can manage location templates'
  ) THEN
    CREATE POLICY "Temp admins can manage location templates"
      ON location_content_templates FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role IN ('admin', 'temp_admin')
        )
      );
  END IF;
END $$;
