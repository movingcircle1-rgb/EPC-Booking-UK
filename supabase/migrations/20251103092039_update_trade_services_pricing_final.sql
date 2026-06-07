/*
  # Update Trade Services Pricing and Categories

  1. Changes
    - Clear all existing trade services
    - Update service_type constraint to include new categories
    - Add new Staff Hire services with updated pricing
    - Add new Vehicle Hire services with updated pricing
    - Add new Vehicle & Driver Hire services with updated pricing

  2. New Service Categories
    - staff_hire: Porter, 3.5T Driver, Class 2 Driver, Class 1 Driver
    - vehicle_hire: 3.5T Luton Van, 7.5T Removals Lorry, 18T Removals Lorry 5 Door
    - vehicle_driver_hire: Combined services with different pricing for weekdays

  3. Security
    - No RLS changes needed (existing policies apply)
*/

-- Clear ALL existing services first (this removes the constraint issue)
TRUNCATE trade_services CASCADE;

-- Drop the existing constraint
ALTER TABLE trade_services DROP CONSTRAINT IF EXISTS trade_services_service_type_check;

-- Add updated constraint with new service types
ALTER TABLE trade_services ADD CONSTRAINT trade_services_service_type_check 
  CHECK (service_type IN ('vehicle_hire', 'staff_hire', 'vehicle_driver_hire', 'equipment', 'storage', 'other'));

-- Insert Staff Hire services
INSERT INTO trade_services (name, service_type, description, price_per_day, is_active) VALUES
('Porter', 'staff_hire', 'Professional porter for removals and logistics', 120, true),
('3.5T Driver', 'staff_hire', 'Licensed 3.5T van driver', 150, true),
('Class 2 Driver', 'staff_hire', 'Licensed Class 2 (Category C) driver', 180, true),
('Class 1 Driver', 'staff_hire', 'Licensed Class 1 (Category C+E) driver', 240, true);

-- Insert Vehicle Hire services
INSERT INTO trade_services (name, service_type, description, price_per_day, is_active) VALUES
('3.5T Luton Van (600 CB FT)', 'vehicle_hire', '3.5 tonne Luton van with 600 cubic feet capacity', 75, true),
('7.5T Removals Lorry (1100 CB FT)', 'vehicle_hire', '7.5 tonne removals lorry with 1100 cubic feet capacity', 125, true),
('18T Removals Lorry 5 Door (2100 CB FT)', 'vehicle_hire', '18 tonne 5-door removals lorry with 2100 cubic feet capacity', 270, true);

-- Insert Vehicle & Driver Hire services
INSERT INTO trade_services (name, service_type, description, price_per_day, is_active) VALUES
('3.5T Luton Van (600 CB FT) & Driver', 'vehicle_driver_hire', '3.5 tonne Luton van with professional driver', 200, true),
('7.5T Removals Lorry & Driver (1100 CB FT)', 'vehicle_driver_hire', '7.5 tonne removals lorry with professional driver', 290, true),
('18T Removals Lorry 5 Door & Driver (2100 CB FT) Mon–Wed', 'vehicle_driver_hire', '18 tonne 5-door removals lorry with driver - Monday to Wednesday special rate', 350, true),
('18T Removals Lorry 5 Door & Driver (2100 CB FT) Thu–Sun', 'vehicle_driver_hire', '18 tonne 5-door removals lorry with driver - Thursday to Sunday rate', 450, true);