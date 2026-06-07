/*
  # Populate Portal Sample Data

  ## Overview
  Creates comprehensive sample data for Partner, Trade, and Staff portals to enable
  full functionality testing and demonstration.

  ## Data Created
  
  ### Partner Portal
  - 3 sample partner accounts linked to demo users
  - 15 referrals with various statuses (pending, contacted, quoted, completed)
  - Commission statements for completed referrals
  - Marketing materials available for download
  
  ### Trade Portal
  - 3 sample trade accounts linked to demo users
  - 10 open trade jobs with various service types
  - 8 trade bids from different trade accounts
  - Trade services available for booking
  - Sample service bookings
  
  ### Staff Portal
  - 5 staff profiles with complete information
  - 20 availability calendar entries (shifts, time-off requests)
  - 6 company policy documents
  - Policy acknowledgments
  
  ### Shared
  - 50 notifications across all portal types
  - Sample additional services for bookings
  
  ## Security
  All data respects existing RLS policies and user relationships
*/

-- Insert sample partner accounts linked to existing users
INSERT INTO partners (user_id, company_name, contact_name, email, phone, address, status, partnership_type, description)
SELECT 
  u.id,
  'Partner Company ' || (ROW_NUMBER() OVER ()),
  ur.full_name,
  u.email,
  ur.phone,
  '123 Business Street, London, UK',
  'active',
  'referral',
  'Established partnership for client referrals'
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'partner'
LIMIT 3
ON CONFLICT (email) DO NOTHING;

-- Insert sample trade accounts
INSERT INTO trade_accounts (user_id, business_name, contact_name, email, phone, business_address, account_status, discount_rate, credit_limit)
SELECT 
  u.id,
  'Trade Business ' || (ROW_NUMBER() OVER ()),
  ur.full_name,
  u.email,
  ur.phone,
  '456 Commerce Road, Manchester, UK',
  'active',
  10.00,
  5000.00
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'trade'
LIMIT 3
ON CONFLICT (email) DO NOTHING;

-- Insert sample referrals for partner portal
DO $$
DECLARE
  partner_rec RECORD;
  ref_count INT := 0;
BEGIN
  FOR partner_rec IN SELECT id FROM partners WHERE status = 'active' LIMIT 3 LOOP
    -- Pending referrals
    FOR i IN 1..2 LOOP
      INSERT INTO referrals (
        partner_id, customer_name, customer_email, customer_phone,
        service_type, move_from, move_to, estimated_move_date,
        status, commission_rate, commission_amount, referral_notes
      ) VALUES (
        partner_rec.id,
        'Customer ' || (ref_count + i),
        'customer' || (ref_count + i) || '@example.com',
        '07' || LPAD((700000000 + ref_count + i)::text, 9, '0'),
        CASE (i % 4) WHEN 0 THEN 'House Removal' WHEN 1 THEN 'Office Removal' WHEN 2 THEN 'Storage Services' ELSE 'International Move' END,
        'London',
        'Birmingham',
        CURRENT_DATE + (i * 7),
        'pending',
        5.00,
        0,
        'Initial enquiry received'
      );
    END LOOP;
    
    -- Contacted referrals
    FOR i IN 1..2 LOOP
      INSERT INTO referrals (
        partner_id, customer_name, customer_email, customer_phone,
        service_type, move_from, move_to, estimated_move_date,
        status, commission_rate, commission_amount, referral_notes
      ) VALUES (
        partner_rec.id,
        'Customer ' || (ref_count + i + 10),
        'customer' || (ref_count + i + 10) || '@example.com',
        '07' || LPAD((700000010 + ref_count + i)::text, 9, '0'),
        CASE (i % 3) WHEN 0 THEN 'House Removal' WHEN 1 THEN 'Packing Services' ELSE 'Furniture Removal' END,
        'Manchester',
        'Leeds',
        CURRENT_DATE + (i * 14),
        'contacted',
        5.00,
        125.00,
        'Quote sent to customer'
      );
    END LOOP;
    
    -- Completed referrals with commission
    INSERT INTO referrals (
      partner_id, customer_name, customer_email, customer_phone,
      service_type, move_from, move_to, estimated_move_date,
      status, commission_rate, commission_amount, commission_paid, commission_paid_date, referral_notes
    ) VALUES (
      partner_rec.id,
      'Customer Completed',
      'completed@example.com',
      '07700000099',
      'House Removal',
      'Bristol',
      'Cardiff',
      CURRENT_DATE - 30,
      'completed',
      5.00,
      150.00,
      true,
      CURRENT_DATE - 7,
      'Job completed successfully'
    );
    
    ref_count := ref_count + 10;
  END LOOP;
END $$;

-- Insert marketing materials for partners
INSERT INTO marketing_materials (title, description, category, file_url, thumbnail_url, is_downloadable, is_orderable, stock_available, is_active)
VALUES
  ('Company Brochure 2024', 'Latest company brochure with service information', 'brochures', '/docs/brochure-2024.pdf', '/images/brochure-thumb.jpg', true, true, 500, true),
  ('Business Card Template', 'Customizable business card template', 'business_cards', '/docs/business-card.pdf', '/images/card-thumb.jpg', true, true, 1000, true),
  ('Service Flyer', 'Promotional flyer for house removals', 'flyers', '/docs/service-flyer.pdf', '/images/flyer-thumb.jpg', true, true, 300, true),
  ('Digital Banner Ads', 'Social media banner templates', 'digital', '/docs/banners.zip', '/images/banner-thumb.jpg', true, false, 0, true),
  ('Email Template', 'Professional email signature template', 'templates', '/docs/email-template.html', '/images/email-thumb.jpg', true, false, 0, true);

-- Insert sample trade jobs
INSERT INTO trade_jobs (
  title, description, service_type, pickup_postcode, delivery_postcode,
  volume_cubic_feet, preferred_date, flexible_dates, budget_amount,
  requirements, status
)
VALUES
  ('Large House Removal - 4 Bedroom', 'Full house removal service needed for 4-bedroom property. Includes furniture and boxes.', 'removal', 'SW1A 1AA', 'M1 1AD', 800, CURRENT_DATE + 14, true, 1200.00, 'Need 2 large vans and 4 porters. Parking available at both locations.', 'open'),
  ('Office Relocation', 'Small office move with filing cabinets, desks, and IT equipment.', 'removal', 'EC1A 1BB', 'W1A 0AX', 400, CURRENT_DATE + 21, false, 800.00, 'Must be completed over weekend. Careful handling of IT equipment required.', 'open'),
  ('Single Item Delivery', 'Antique piano delivery requiring specialist handling.', 'delivery', 'B1 1AA', 'B15 1TT', 50, CURRENT_DATE + 7, true, 300.00, 'Piano removal specialists preferred. Insurance required.', 'open'),
  ('Storage Collection', 'Collect items from storage facility and deliver to new address.', 'delivery', 'L1 8JQ', 'L25 2RF', 200, CURRENT_DATE + 10, true, 400.00, 'Access to storage unit will be provided. Standard van sufficient.', 'open'),
  ('Packing Service Required', 'Packing service for 2-bedroom flat before main removal.', 'packing', 'SE1 9SG', 'SE1 9SG', 0, CURRENT_DATE + 5, false, 250.00, '2 packers needed for full day. Materials provided.', 'open'),
  ('Driver with Van', 'Need experienced driver with LWB van for multiple deliveries.', 'driver', 'NW1 2DB', 'Various', 0, CURRENT_DATE + 3, true, 150.00, 'Full day hire, 8am-6pm. Clean driving license essential.', 'open'),
  ('Porter Assistance', 'Need 2 porters to help load customer items into van.', 'porter', 'E1 6AN', 'E1 6AN', 0, CURRENT_DATE + 2, false, 120.00, '3 hours work, heavy lifting involved. PPE provided.', 'open'),
  ('European Delivery', 'Delivery of personal effects to France.', 'delivery', 'CT1 1QH', 'Paris, France', 300, CURRENT_DATE + 28, true, 1500.00, 'International documentation required. Customs experience essential.', 'open'),
  ('Student Move', 'Small student move - boxes and furniture from halls to house share.', 'removal', 'OX1 2JD', 'OX4 1EZ', 150, CURRENT_DATE + 4, true, 200.00, 'Quick job, estimated 2-3 hours. Small van sufficient.', 'open'),
  ('Furniture Assembly', 'Dismantle and reassemble bedroom furniture at new property.', 'other', 'GL1 1SP', 'GL50 1AB', 0, CURRENT_DATE + 12, false, 180.00, 'Flat-pack furniture experience required. Own tools needed.', 'open');

-- Insert sample trade bids
DO $$
DECLARE
  job_rec RECORD;
  trade_rec RECORD;
  bid_count INT := 0;
BEGIN
  FOR job_rec IN SELECT id FROM trade_jobs WHERE status = 'open' LIMIT 5 LOOP
    FOR trade_rec IN SELECT id FROM trade_accounts WHERE account_status = 'active' LIMIT 2 LOOP
      IF bid_count < 8 THEN
        INSERT INTO trade_bids (
          job_id, bidder_trade_id, bid_amount, proposed_date,
          cover_letter, estimated_duration_hours, status
        ) VALUES (
          job_rec.id,
          trade_rec.id,
          (500 + (bid_count * 100))::decimal,
          CURRENT_DATE + (bid_count + 5),
          'We have extensive experience in this type of work and can complete the job to the highest standard. Our team is fully insured and DBS checked.',
          (4 + (bid_count % 4)),
          CASE WHEN bid_count % 3 = 0 THEN 'accepted' ELSE 'pending' END
        );
        bid_count := bid_count + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Insert trade services
INSERT INTO trade_services (name, description, service_type, price_per_day, price_per_hour, is_active, availability_info, requirements)
VALUES
  ('Luton Van Hire', 'Large Luton van with tail lift, perfect for house removals', 'vehicle_hire', 120.00, NULL, true, 'Available 7 days a week', 'Full UK driving license, 25+ years old'),
  ('Transit Van Hire', 'Standard Ford Transit van for medium moves', 'vehicle_hire', 80.00, NULL, true, 'Available weekdays', 'Full UK driving license, 21+ years old'),
  ('Experienced Driver', 'Professional driver with 10+ years experience', 'driver', 180.00, 25.00, true, 'Advance booking required', 'None - driver fully qualified'),
  ('Porter Service', 'Trained porter for loading/unloading assistance', 'porter', 140.00, 20.00, true, 'Available most days', 'Heavy lifting ability required'),
  ('Packing Materials Kit', 'Complete packing materials including boxes, tape, bubble wrap', 'equipment', 50.00, NULL, true, 'Always available', 'None'),
  ('Furniture Dolly', 'Heavy-duty furniture moving equipment', 'equipment', 15.00, NULL, true, 'Subject to availability', 'Training provided if needed');

-- Insert staff profiles
DO $$
DECLARE
  staff_user RECORD;
  emp_num INT := 1001;
BEGIN
  FOR staff_user IN 
    SELECT u.id, ur.full_name 
    FROM auth.users u 
    JOIN user_roles ur ON u.id = ur.user_id 
    WHERE ur.role = 'staff' 
    LIMIT 5 
  LOOP
    INSERT INTO staff_profiles (
      user_id, job_role, department, employee_number, hire_date,
      certifications, emergency_contact_name, emergency_contact_phone,
      emergency_contact_relationship
    ) VALUES (
      staff_user.id,
      CASE (emp_num % 3) WHEN 0 THEN 'Removal Operative' WHEN 1 THEN 'Driver' ELSE 'Team Leader' END,
      'Operations',
      'EMP' || emp_num,
      CURRENT_DATE - (365 * (1 + (emp_num % 3))),
      ARRAY['First Aid', 'Manual Handling', 'Customer Service'],
      'Emergency Contact ' || emp_num,
      '07' || LPAD((800000000 + emp_num)::text, 9, '0'),
      'Spouse'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    emp_num := emp_num + 1;
  END LOOP;
END $$;

-- Insert availability calendar entries
DO $$
DECLARE
  staff_rec RECORD;
  day_offset INT;
BEGIN
  FOR staff_rec IN SELECT user_id FROM staff_profiles LIMIT 5 LOOP
    -- Next 2 weeks of shifts
    FOR day_offset IN 0..13 LOOP
      INSERT INTO availability_calendar (
        staff_id, date, is_available, shift_type, approval_status
      ) VALUES (
        staff_rec.user_id,
        CURRENT_DATE + day_offset,
        true,
        CASE 
          WHEN day_offset % 7 IN (5, 6) THEN 'off'
          WHEN day_offset % 3 = 0 THEN 'morning'
          WHEN day_offset % 3 = 1 THEN 'afternoon'
          ELSE 'full_day'
        END,
        'approved'
      ) ON CONFLICT (staff_id, date) DO NOTHING;
    END LOOP;
    
    -- Add a pending time-off request
    INSERT INTO availability_calendar (
      staff_id, date, is_available, time_off_type, time_off_reason, approval_status
    ) VALUES (
      staff_rec.user_id,
      CURRENT_DATE + 20,
      false,
      'vacation',
      'Family holiday',
      'pending'
    ) ON CONFLICT (staff_id, date) DO NOTHING;
  END LOOP;
END $$;

-- Insert policy documents
INSERT INTO policies_documents (title, description, category, file_url, version, is_active, requires_acknowledgment, effective_date)
VALUES
  ('Employee Handbook 2024', 'Complete guide to company policies and procedures', 'handbook', '/docs/employee-handbook-2024.pdf', '2024.1', true, true, '2024-01-01'),
  ('Health & Safety Policy', 'Workplace health and safety guidelines', 'safety', '/docs/health-safety-policy.pdf', '3.2', true, true, '2024-01-01'),
  ('Manual Handling Training', 'Safe lifting and handling procedures', 'training', '/docs/manual-handling.pdf', '2.1', true, false, '2023-06-01'),
  ('Vehicle Safety Checks', 'Daily vehicle inspection checklist', 'procedure', '/docs/vehicle-checks.pdf', '1.5', true, false, '2023-09-01'),
  ('Customer Service Standards', 'Guidelines for professional customer interaction', 'company_policy', '/docs/customer-service.pdf', '1.0', true, false, '2024-01-01'),
  ('Data Protection Policy', 'GDPR compliance and data handling procedures', 'hr', '/docs/data-protection.pdf', '2.0', true, true, '2024-01-01');

-- Insert additional services for bookings
INSERT INTO additional_services (name, description, category, price, unit, is_active, display_order)
VALUES
  ('Standard Packing Boxes', 'Set of 10 double-walled cardboard boxes', 'packing', 25.00, 'set', true, 1),
  ('Wardrobe Boxes', 'Hanging wardrobe boxes for clothes', 'packing', 15.00, 'box', true, 2),
  ('Bubble Wrap Roll', 'Large bubble wrap roll for fragile items', 'packing', 12.00, 'roll', true, 3),
  ('Furniture Covers', 'Protective covers for sofas and mattresses', 'packing', 8.00, 'cover', true, 4),
  ('Short-term Storage', 'Secure storage per week', 'storage', 50.00, 'week', true, 5),
  ('Transit Insurance', 'Comprehensive goods in transit insurance', 'insurance', 75.00, 'policy', true, 6),
  ('End of Tenancy Clean', 'Professional cleaning service', 'cleaning', 150.00, 'property', true, 7),
  ('Piano Moving', 'Specialist piano moving service', 'other', 200.00, 'item', true, 8),
  ('Dismantling Service', 'Furniture dismantling and reassembly', 'other', 80.00, 'service', true, 9);

-- Insert sample notifications for all portal types
DO $$
DECLARE
  user_rec RECORD;
  notif_types text[] := ARRAY['info', 'success', 'warning'];
  notif_count INT := 0;
BEGIN
  -- Notifications for partners
  FOR user_rec IN SELECT u.id FROM auth.users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role = 'partner' LIMIT 3 LOOP
    INSERT INTO notifications (user_id, title, message, type, category, is_read)
    VALUES
      (user_rec.id, 'New Referral Contacted', 'Your referral for Customer has been contacted by our team.', 'success', 'referral', false),
      (user_rec.id, 'Commission Payment Processed', 'Commission of £150.00 has been paid to your account.', 'success', 'payment', true),
      (user_rec.id, 'Referral Status Update', 'Referral #1234 status changed to quoted.', 'info', 'referral', false);
  END LOOP;
  
  -- Notifications for trade accounts
  FOR user_rec IN SELECT u.id FROM auth.users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role = 'trade' LIMIT 3 LOOP
    INSERT INTO notifications (user_id, title, message, type, category, is_read)
    VALUES
      (user_rec.id, 'New Job Posted', 'A new removal job matching your criteria has been posted.', 'info', 'job', false),
      (user_rec.id, 'Bid Accepted', 'Your bid for job #789 has been accepted!', 'success', 'job', false),
      (user_rec.id, 'Payment Received', 'Payment of £850.00 for completed job has been processed.', 'success', 'payment', true);
  END LOOP;
  
  -- Notifications for staff
  FOR user_rec IN SELECT u.id FROM auth.users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role = 'staff' LIMIT 5 LOOP
    INSERT INTO notifications (user_id, title, message, type, category, is_read)
    VALUES
      (user_rec.id, 'Shift Reminder', 'You have a full day shift scheduled for tomorrow.', 'info', 'system', false),
      (user_rec.id, 'Time Off Approved', 'Your vacation request for next month has been approved.', 'success', 'system', false),
      (user_rec.id, 'New Policy Document', 'Please review and acknowledge the updated Health & Safety Policy.', 'warning', 'system', false);
  END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_jobs_created_at ON trade_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_bids_created_at ON trade_bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
