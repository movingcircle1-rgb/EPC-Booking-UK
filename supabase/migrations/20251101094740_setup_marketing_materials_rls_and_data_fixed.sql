/*
  # Setup Marketing Materials - RLS & Sample Data (Fixed)

  1. Changes
    - Add RLS policies to existing marketing_materials table
    - Insert sample marketing materials using correct category values
    - Create marketing_material_orders table
  
  2. Security
    - All authenticated users can view active materials
    - Partners can view own orders and create new orders
    - Admins can manage everything
*/

-- Enable RLS on marketing_materials if not already enabled
ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "View active marketing materials" ON marketing_materials;
DROP POLICY IF EXISTS "Admins manage marketing materials" ON marketing_materials;

-- RLS Policies for marketing_materials

CREATE POLICY "View active marketing materials"
  ON marketing_materials FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage marketing materials"
  ON marketing_materials FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Marketing Material Orders Table
CREATE TABLE IF NOT EXISTS marketing_material_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  partner_id uuid REFERENCES partners(id) NOT NULL,
  partner_user_id uuid REFERENCES auth.users(id) NOT NULL,
  material_id uuid REFERENCES marketing_materials(id) NOT NULL,
  
  quantity integer NOT NULL DEFAULT 1,
  
  delivery_contact_name text NOT NULL,
  delivery_address text NOT NULL,
  delivery_postcode text NOT NULL,
  delivery_phone text NOT NULL,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  order_notes text,
  admin_notes text,
  
  shipped_date timestamptz,
  delivered_date timestamptz,
  tracking_number text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_material_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_material_orders

CREATE POLICY "Partners view own orders"
  ON marketing_material_orders FOR SELECT
  TO authenticated
  USING (partner_user_id = auth.uid());

CREATE POLICY "Partners create orders"
  ON marketing_material_orders FOR INSERT
  TO authenticated
  WITH CHECK (partner_user_id = auth.uid());

CREATE POLICY "Admins view all orders"
  ON marketing_material_orders FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins update orders"
  ON marketing_material_orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_partner ON marketing_material_orders(partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON marketing_material_orders(status, created_at DESC);

-- Clear existing data and insert fresh sample materials (using lowercase categories to match constraint)
DELETE FROM marketing_materials;

INSERT INTO marketing_materials (title, description, category, file_url, file_type, file_size, is_downloadable, is_orderable, stock_available, display_order, is_active)
VALUES 
  ('Company Brochure 2025', 'Full-color 8-page company brochure showcasing all our removal and storage services. Perfect for giving to potential clients.', 'brochures', '/marketing/brochure-2025.pdf', 'PDF', '2.4 MB', true, true, 500, 1, true),
  
  ('House Removals Flyer', 'A5 flyer highlighting our house removal services with pricing guide and contact information.', 'flyers', '/marketing/house-removals-flyer.pdf', 'PDF', '1.2 MB', true, true, 1000, 2, true),
  
  ('Business Cards (250 pack)', 'Premium business cards with your unique referral code printed. High-quality 400gsm card stock.', 'business_cards', null, 'Physical', null, false, true, 50, 3, true),
  
  ('Partner Logo Pack', 'High-resolution company logos in multiple formats (PNG, SVG, EPS) for your use in marketing materials.', 'digital', '/marketing/logo-pack.zip', 'ZIP', '15.8 MB', true, false, 0, 4, true),
  
  ('Social Media Templates', 'Ready-to-use social media post templates for Facebook, Instagram, and LinkedIn. Editable Canva links included.', 'templates', '/marketing/social-templates.zip', 'ZIP', '8.5 MB', true, false, 0, 5, true),
  
  ('A3 Window Poster', 'Eye-catching A3 poster for display in your office window or reception area. Full-color, weather-resistant.', 'posters', '/marketing/poster-a3.pdf', 'PDF', '3.1 MB', true, true, 200, 6, true),
  
  ('Email Signature Template', 'Professional email signature HTML template with our branding and your referral information.', 'templates', '/marketing/email-signature.html', 'HTML', '0.1 MB', true, false, 0, 7, true),
  
  ('Pull-up Banner (6ft)', 'Large promotional pull-up banner for events and trade shows. Professional print on durable material with carry case.', 'posters', null, 'Physical', null, false, true, 15, 8, true),
  
  ('European Moves Leaflet', 'Specialized leaflet focusing on our European removal services. Includes common routes and pricing information.', 'flyers', '/marketing/european-moves-leaflet.pdf', 'PDF', '1.8 MB', true, true, 500, 9, true),
  
  ('Referral Program Guide', 'Detailed guide explaining how our referral program works, commission rates, and payment terms.', 'digital', '/marketing/referral-program-guide.pdf', 'PDF', '0.9 MB', true, false, 0, 10, true)
ON CONFLICT DO NOTHING;