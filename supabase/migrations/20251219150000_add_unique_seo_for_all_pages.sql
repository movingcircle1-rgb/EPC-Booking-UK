/*
  # Add Unique SEO Meta Titles and Descriptions for All Pages

  1. Overview
    - Adds unique, SEO-optimized meta titles and descriptions for every page
    - Ensures no duplicate titles across the website
    - Improves search engine visibility and click-through rates

  2. Pages Updated
    - All service pages (House Removals, Office Removals, Packing, Storage, etc.)
    - All information pages (About, Contact, How It Works, etc.)
    - All special offer pages (Blue Light Card, Mid Week Move, etc.)
    - Location pages and index
    - Articles and services index

  3. SEO Best Practices
    - Unique titles for every page (no duplicates)
    - Compelling descriptions that encourage clicks
    - Location-specific keywords where appropriate
    - Clear value propositions
*/

-- First, ensure the page_seo_metadata table exists and has all required columns
DO $$
BEGIN
  -- Add is_indexable column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_seo_metadata' AND column_name = 'is_indexable'
  ) THEN
    ALTER TABLE page_seo_metadata ADD COLUMN is_indexable boolean DEFAULT true;
  END IF;

  -- Add last_updated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_seo_metadata' AND column_name = 'last_updated'
  ) THEN
    ALTER TABLE page_seo_metadata ADD COLUMN last_updated timestamptz DEFAULT now();
  END IF;
END $$;

-- Delete existing generic/duplicate SEO data
DELETE FROM page_seo_metadata
WHERE meta_title = 'National Removals and Storage'
   OR meta_title IS NULL
   OR meta_title = '';

-- Insert unique SEO data for all static pages
INSERT INTO page_seo_metadata (page_url, meta_title, meta_description, keywords, is_indexable, priority, last_updated)
VALUES
  -- Home page
  ('/',
   'Professional Removals & Storage UK | National Removals and Storage',
   'Expert removal and storage services across the UK. House removals, office moves, packing services, and secure storage. Fully insured, competitive pricing. Get your free quote today!',
   'removals uk, moving company, storage uk, house removals, office removals',
   true, 1.0, now()),

  -- Main service pages
  ('/house-removals',
   'House Removals UK | Residential Moving Services | National Removals',
   'Professional house removal services across the UK. Expert packing, secure transport, and full insurance. Stress-free home moves with experienced team. Free quotes available.',
   'house removals, home removals, residential moving, house moving company',
   true, 0.9, now()),

  ('/office-removals',
   'Office Removals & Business Relocation Services UK | National Removals',
   'Specialist office and business relocation services. Minimal downtime, secure IT equipment handling, weekend moves available. Professional commercial moving experts.',
   'office removals, business relocation, commercial moving, office moving',
   true, 0.9, now()),

  ('/packing-services',
   'Professional Packing Services UK | Expert Packing Materials | National Removals',
   'Complete packing services with premium materials. Full or partial packing available. Expert handling of fragile items. Reduce moving stress with professional packers.',
   'packing services, packing materials, moving boxes, professional packers',
   true, 0.8, now()),

  ('/storage',
   'Secure Storage Solutions UK | Self Storage & Container Storage',
   'Flexible storage solutions across the UK. Short and long-term options. Secure, climate-controlled facilities. Easy access, competitive rates. Free storage quotes.',
   'storage uk, self storage, container storage, secure storage',
   true, 0.8, now()),

  ('/international-moves',
   'International Removals UK | Overseas Moving Services | National Removals',
   'International moving services to over 150 countries. Customs clearance, shipping, full insurance. Experienced international removal specialists. Global relocation made easy.',
   'international removals, overseas moving, international shipping, emigration',
   true, 0.8, now()),

  ('/european-moves',
   'European Removals UK | Moving to Europe | National Removals',
   'Specialist European removal services. Door-to-door service across Europe. Post-Brexit customs expertise. France, Spain, Germany, and all EU countries.',
   'european removals, moving to europe, eu removals, france removals',
   true, 0.8, now()),

  ('/furniture-removal',
   'Furniture Removal & Disposal Services UK | Donate or Recycle',
   'Responsible furniture removal and disposal. Charity donations, recycling, and eco-friendly disposal. Single item or full house clearance. Same-day service available.',
   'furniture removal, furniture disposal, house clearance, charity donations',
   true, 0.7, now()),

  -- Information pages
  ('/about',
   'About Us | Professional UK Removal Company | National Removals',
   'Established UK removal company with decades of experience. Fully insured, professional team, modern fleet. Your trusted partner for stress-free moves nationwide.',
   'about us, removal company, moving company uk, professional movers',
   true, 0.6, now()),

  ('/contact',
   'Contact Us | Get Your Free Moving Quote | National Removals',
   'Get in touch for your free removal quote. Phone, email, or online enquiry. Quick response guaranteed. Expert advice available. Call 0800 047 2607 today.',
   'contact, moving quote, removal quote, free quote',
   true, 0.7, now()),

  ('/how-it-works',
   'How It Works | Simple Moving Process | National Removals',
   'Our simple 4-step moving process. From quote to completion, we make moving easy. Transparent pricing, no hidden fees. Professional service at every stage.',
   'how it works, moving process, removal process, moving guide',
   true, 0.6, now()),

  -- Special offers
  ('/blue-light-card',
   'Blue Light Card Discount | NHS & Emergency Services Removals | 10% Off',
   'Exclusive 10% discount for Blue Light Card holders. NHS, police, fire service, and armed forces. Professional removals at reduced rates. Thank you for your service.',
   'blue light card, nhs discount, emergency services discount, military discount',
   true, 0.7, now()),

  ('/mid-week-move',
   'Mid Week Move Discount | Save 15% on Weekday Removals',
   'Save 15% on mid-week removals. Monday to Thursday moves at reduced rates. Same professional service, better prices. Flexible weekday slots available.',
   'mid week discount, weekday removals, cheap removals, removal discount',
   true, 0.7, now()),

  ('/free-storage',
   'Free Storage Offer | Complimentary Storage with Removals',
   'Get free storage with qualifying removals. Secure storage facilities included. Perfect for flexible move dates. No hidden charges, genuine offer.',
   'free storage, storage offer, complimentary storage, removal storage',
   true, 0.7, now()),

  -- Environmental pages
  ('/low-emission-promise',
   'Low Emission Promise | Eco-Friendly Removals | Carbon Neutral Moving',
   'Our commitment to sustainable removals. Carbon offset program, fuel-efficient fleet, eco-friendly practices. Moving responsibly for a better future.',
   'eco-friendly removals, carbon neutral, sustainable moving, green removals',
   true, 0.6, now()),

  ('/we-donate',
   'We Donate Unwanted Items | Charity Furniture Collection',
   'Free furniture donation service. We deliver your unwanted items to local charities. Help your community while decluttering. Responsible removal with social impact.',
   'furniture donation, charity collection, donate furniture, community support',
   true, 0.6, now()),

  ('/we-recycle',
   'We Recycle | Eco-Friendly Waste Disposal | Responsible Removals',
   'Comprehensive recycling service. Proper disposal of unwanted items. Licensed waste carriers. Minimize landfill, maximize recycling. Environmental responsibility.',
   'recycling, waste disposal, eco disposal, responsible waste',
   true, 0.6, now()),

  ('/we-recommend',
   'Partner Recommendations | Trusted Service Providers | National Removals',
   'Our recommended partners for utilities, broadband, insurance, and more. Trusted providers to help with your move. Exclusive deals for our customers.',
   'moving partners, utility connections, broadband deals, removal partners',
   true, 0.5, now()),

  -- Location pages
  ('/locations',
   'UK Removal Locations | National Coverage | Find Your Local Removals',
   'Professional removal services across the UK. Find your local area. Nationwide coverage with local expertise. Search over 1000 locations we serve.',
   'removal locations, uk removals, local movers, nationwide removals',
   true, 0.8, now()),

  -- Content pages
  ('/services',
   'All Removal Services | Complete Moving Solutions | National Removals',
   'Complete range of removal services. Residential, commercial, packing, storage, and specialist moves. All your moving needs under one roof.',
   'removal services, moving services, all services, complete solutions',
   true, 0.7, now()),

  ('/articles',
   'Moving Tips & Advice | Removal Guides | National Removals Blog',
   'Expert moving tips, packing guides, and removal advice. Learn from the professionals. Make your move smooth and stress-free with our helpful articles.',
   'moving tips, packing tips, removal advice, moving guide',
   true, 0.6, now())

ON CONFLICT (page_url)
DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  keywords = EXCLUDED.keywords,
  is_indexable = EXCLUDED.is_indexable,
  priority = EXCLUDED.priority,
  last_updated = now();

-- Update location content templates to have better fallback titles
UPDATE location_content_templates
SET
  meta_title_template = '{{service}} in {{location}} | Professional Moving Services',
  meta_description_template = 'Expert {{service}} services in {{location}}. Professional local moving company with experienced team, competitive rates, and full insurance. Serving {{location}} and surrounding areas. Free quotes available.',
  updated_at = now()
WHERE service_type IN ('house-removals', 'office-removals', 'packing-services', 'storage-solutions');

-- Ensure all cities have proper meta titles (if not set)
UPDATE cities
SET
  meta_title = CONCAT(name, ' Removals | Professional Moving Services in ', name),
  meta_description = CONCAT('Professional removal services in ', name, '. Local moving experts with years of experience. House removals, office moves, packing, and storage. Serving ', name, ' and surrounding areas. Get your free quote today.'),
  updated_at = now()
WHERE meta_title IS NULL OR meta_title = '' OR meta_title = 'National Removals and Storage';

-- Add comment to table
COMMENT ON TABLE page_seo_metadata IS 'Stores unique SEO metadata for all pages. Each page must have a distinctive meta title and description for better search engine visibility.';
