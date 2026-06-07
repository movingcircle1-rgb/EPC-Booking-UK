/*
  # Add Unique Service-Specific Content for Location Pages

  ## Overview
  This migration enhances the location content templates with unique, service-specific content
  to eliminate duplicate content issues across location pages. Each service type (house-removals,
  office-removals, packing, storage) now has completely unique content.

  ## Changes
  1. Update existing location_content_templates with detailed, unique content sections
  2. Add unique benefits, processes, and features for each service type
  3. Ensure each service has distinct meta descriptions and titles
  4. Add service-specific FAQs and trust signals

  ## SEO Impact
  - Eliminates duplicate content penalties
  - Each location/service page now has unique 300+ words of content
  - Improved keyword targeting for service-specific searches
*/

-- Update House Removals Template with unique content
UPDATE location_content_templates
SET
  hero_title_template = 'Professional House Removals in {{location}}',
  hero_subtitle_template = 'Stress-free home moving services in {{location}} - Your trusted residential removal specialists',
  description_template = 'Moving home in {{location}}? Our professional house removal services make residential moves easy. From single-room apartments to large family homes, we provide comprehensive moving solutions including full packing, secure transportation, furniture assembly, and storage options. Our experienced team handles everything with care.',
  meta_title_template = 'House Removals {{location}} - Residential Moving Services | National Removals',
  meta_description_template = 'Professional house removals in {{location}}. Residential moving specialists with full packing service, secure transport, and furniture care. Free quotes, fully insured, trusted by families.',
  sections = '[
    {
      "type": "intro",
      "title": "Your Trusted Home Moving Partner in {{location}}",
      "content": "Moving house is one of life''s most stressful experiences, but it doesn''t have to be. Our professional house removal services in {{location}} are designed to take the stress out of your residential move. Whether you''re moving from a studio apartment or a five-bedroom family home, our experienced team handles every aspect of your move with care and precision."
    },
    {
      "type": "benefits",
      "title": "Why Choose Our House Removal Service in {{location}}?",
      "items": [
        {
          "title": "Family-Focused Service",
          "description": "We understand the emotional aspect of moving homes. Our team treats your belongings like our own, with special care for family heirlooms and sentimental items."
        },
        {
          "title": "Full Packing Service Available",
          "description": "Don''t have time to pack? We offer complete packing services using premium materials. We''ll carefully wrap, box, and label everything - or we can provide materials for DIY packing."
        },
        {
          "title": "Furniture Protection & Assembly",
          "description": "We dismantle furniture at your old home and reassemble it at your new one. All items are wrapped in protective blankets to prevent damage during transit."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Weekend moves, mid-week moves, or end-of-month moves - we work around your schedule. Early morning starts and evening completions available."
        }
      ]
    },
    {
      "type": "process",
      "title": "Our House Removal Process in {{location}}",
      "steps": [
        {
          "number": "1",
          "title": "Free Home Survey",
          "description": "We visit your home in {{location}} to assess the volume, special items, and access. This ensures accurate pricing and planning."
        },
        {
          "number": "2",
          "title": "Packing & Preparation",
          "description": "On moving day (or before), our team arrives with all materials. We pack systematically, room by room, labeling everything clearly."
        },
        {
          "number": "3",
          "title": "Safe Loading & Transport",
          "description": "Our trained movers load your belongings using proper lifting techniques. Items are secured in our modern removal vehicles for safe transport."
        },
        {
          "number": "4",
          "title": "Unloading & Setup",
          "description": "At your new home, we unload carefully, placing items in designated rooms. We reassemble furniture and remove all packing debris."
        }
      ]
    },
    {
      "type": "features",
      "title": "What''s Included in Your House Move",
      "items": [
        "Pre-move home survey and consultation",
        "Professional packing materials or full packing service",
        "Furniture dismantling and reassembly",
        "Secure transportation in modern vehicles",
        "Comprehensive goods in transit insurance",
        "Piano and special item moving expertise",
        "Temporary storage options if needed",
        "Weekend and evening moves available"
      ]
    },
    {
      "type": "faq",
      "title": "House Removals FAQs for {{location}} Residents",
      "questions": [
        {
          "q": "How much does a house removal cost in {{location}}?",
          "a": "Costs vary based on home size, distance, and services required. A typical 3-bedroom house move in {{location}} ranges from £600-£1200. We provide free, no-obligation quotes after a home survey."
        },
        {
          "q": "How far in advance should I book?",
          "a": "We recommend booking 2-4 weeks in advance, especially for weekend moves or end-of-month dates. However, we can often accommodate last-minute moves with 48 hours notice."
        },
        {
          "q": "Do you provide packing materials?",
          "a": "Yes! We supply boxes, tape, bubble wrap, and protective blankets. You can purchase a packing kit or opt for our full packing service where we handle everything."
        },
        {
          "q": "What if my completion date changes?",
          "a": "We understand house purchases can be unpredictable. We offer flexible rescheduling and will work with your solicitor''s timeline to ensure a smooth move."
        }
      ]
    }
  ]'::jsonb
WHERE service_type = 'house-removals';

-- Update Office Removals Template with unique content
UPDATE location_content_templates
SET
  hero_title_template = 'Office Removals in {{location}} - Business Relocation Experts',
  hero_subtitle_template = 'Minimize downtime with our professional office moving services in {{location}}',
  description_template = 'Planning an office move in {{location}}? Our commercial relocation specialists ensure minimal business disruption. We handle IT equipment, office furniture, confidential documents, and server rooms with expertise. Weekend and out-of-hours moves available to keep your business running.',
  meta_title_template = 'Office Removals {{location}} - Commercial Moving Services | National Removals',
  meta_description_template = 'Professional office removals in {{location}}. Specialist business relocation with IT equipment handling, minimal downtime, project management, and weekend moves. Trusted by local businesses.',
  sections = '[
    {
      "type": "intro",
      "title": "Expert Office Relocation Services in {{location}}",
      "content": "Relocating your office or business premises requires careful planning and execution to minimize disruption. Our professional office removal services in {{location}} are specifically designed for commercial clients who need their business up and running quickly. We handle everything from single offices to multi-floor corporate headquarters, with dedicated project management and specialized equipment handling."
    },
    {
      "type": "benefits",
      "title": "Why Businesses in {{location}} Choose Us",
      "items": [
        {
          "title": "Minimal Business Disruption",
          "description": "We work to your timeline, offering evening and weekend moves so your business continues operating. Our team works efficiently to have you operational in your new premises quickly."
        },
        {
          "title": "IT & Technology Specialists",
          "description": "Our trained technicians safely disconnect, move, and reconnect computers, servers, phone systems, and network equipment. Cable management and labeling included."
        },
        {
          "title": "Secure Document Handling",
          "description": "Confidential files and sensitive documents are handled with care. We use lockable crates and maintain chain of custody for important business records."
        },
        {
          "title": "Dedicated Project Manager",
          "description": "Every office move gets a dedicated manager who coordinates all aspects, from pre-move planning to post-move setup, keeping you informed throughout."
        }
      ]
    },
    {
      "type": "process",
      "title": "Our Office Relocation Process",
      "steps": [
        {
          "number": "1",
          "title": "Site Survey & Planning",
          "description": "We visit both your current and new premises in {{location}} to assess layout, access, and special requirements. We create a detailed move plan and timeline."
        },
        {
          "number": "2",
          "title": "Pre-Move Coordination",
          "description": "Your project manager coordinates with your IT team, building management, and staff. We provide labeling systems and packing schedules."
        },
        {
          "number": "3",
          "title": "Systematic Relocation",
          "description": "On move day, our team follows the plan precisely. IT equipment is disconnected by specialists, furniture is protected, and everything is loaded systematically."
        },
        {
          "number": "4",
          "title": "Setup & Commissioning",
          "description": "At your new office, we place furniture according to your floor plan, reconnect IT equipment, and ensure everything is operational before we leave."
        }
      ]
    },
    {
      "type": "features",
      "title": "Commercial Moving Services We Provide",
      "items": [
        "Complete office and premises surveys",
        "Detailed project planning and timeline",
        "IT equipment disconnection and reconnection",
        "Server room and data center moves",
        "Furniture dismantling and reconfiguration",
        "Secure crates for confidential documents",
        "Weekend and out-of-hours moving",
        "Storage and phased moves available",
        "Office clearance and recycling services",
        "Post-move deep cleaning coordination"
      ]
    },
    {
      "type": "faq",
      "title": "Office Relocation FAQs for {{location}} Businesses",
      "questions": [
        {
          "q": "Can you move our office without business interruption?",
          "a": "Yes! We specialize in evening and weekend office moves. Our team can complete most office relocations over a weekend, so you''re fully operational Monday morning."
        },
        {
          "q": "Do you handle IT equipment and servers?",
          "a": "Absolutely. Our technicians are trained in safely disconnecting, moving, and reconnecting all IT equipment including servers, workstations, phone systems, and network infrastructure."
        },
        {
          "q": "How much does an office move cost in {{location}}?",
          "a": "Costs depend on office size, equipment volume, and complexity. A typical 20-desk office move ranges from £1,500-£3,500. We provide detailed quotes after a site survey."
        },
        {
          "q": "What about confidential documents and data?",
          "a": "We use lockable, tamper-evident crates for sensitive documents. Our team is trained in confidentiality protocols and can provide secure chain of custody documentation if required."
        }
      ]
    }
  ]'::jsonb
WHERE service_type = 'office-removals';

-- Update Packing Services Template with unique content
UPDATE location_content_templates
SET
  hero_title_template = 'Professional Packing Services in {{location}}',
  hero_subtitle_template = 'Expert packing solutions using premium materials - Perfect for your {{location}} move',
  description_template = 'Don''t have time to pack for your {{location}} move? Our professional packing services save you time and stress. We use premium materials and expert techniques to protect everything from everyday items to fragile valuables. Full packing, partial packing, or packing materials supply available.',
  meta_title_template = 'Packing Services {{location}} - Professional Packing & Materials | National Removals',
  meta_description_template = 'Professional packing services in {{location}}. Expert packing team, premium materials, fragile item specialists, and unpacking services. Save time and protect your belongings.',
  sections = '[
    {
      "type": "intro",
      "title": "Expert Packing Services for Your {{location}} Move",
      "content": "Packing is often the most time-consuming and stressful part of any move. Our professional packing services in {{location}} take this burden off your shoulders. Our trained packing specialists use premium materials and proven techniques to ensure every item - from your everyday dishes to your most precious heirlooms - arrives safely at your new home or office."
    },
    {
      "type": "benefits",
      "title": "Benefits of Professional Packing in {{location}}",
      "items": [
        {
          "title": "Time-Saving Convenience",
          "description": "Why spend weeks packing when our team can do it in hours? We handle everything efficiently, allowing you to focus on other aspects of your move."
        },
        {
          "title": "Expert Techniques",
          "description": "Our packers are trained in proper techniques for different items. We know how to pack fragile china, wrap artwork, protect electronics, and secure furniture properly."
        },
        {
          "title": "Premium Materials",
          "description": "We use professional-grade materials: reinforced boxes, heavy-duty tape, premium bubble wrap, specialized dish packs, wardrobe boxes, and protective blankets."
        },
        {
          "title": "Insurance Confidence",
          "description": "Professionally packed items have better insurance coverage. Our packing meets insurance standards and we provide packing certificates when needed."
        }
      ]
    },
    {
      "type": "services",
      "title": "Packing Service Options",
      "items": [
        {
          "title": "Full Packing Service",
          "description": "We pack your entire home or office. Our team brings all materials and packs everything room by room, with careful labeling for easy unpacking.",
          "includes": ["All packing materials supplied", "Professional packing team", "Room-by-room systematic packing", "Detailed labeling system", "Fragile item protection", "Packing certificate provided"]
        },
        {
          "title": "Partial Packing Service",
          "description": "We pack specific rooms or items. Perfect if you want to pack personal items yourself but need help with kitchens, fragile items, or bulky furniture.",
          "includes": ["Materials for packed items", "Packing of selected rooms/items", "Fragile item specialists", "China and glassware packing", "Artwork and antique protection", "Furniture wrapping"]
        },
        {
          "title": "Fragile Item Packing",
          "description": "Specialist service for valuable or delicate items. We use custom crating for artwork, antiques, china, glassware, and other precious belongings.",
          "includes": ["Specialist fragile packing", "Custom crating if needed", "Individual item wrapping", "Extra protection layers", "Detailed inventory", "Insurance documentation"]
        },
        {
          "title": "Packing Materials Supply",
          "description": "Prefer to pack yourself? We supply all the materials you need with delivery to your {{location}} address. Expert advice included.",
          "includes": ["Professional-grade boxes", "Heavy-duty packing tape", "Bubble wrap and paper", "Wardrobe boxes", "Marker pens for labeling", "Packing tips guide"]
        }
      ]
    },
    {
      "type": "process",
      "title": "How Our Packing Service Works",
      "steps": [
        {
          "number": "1",
          "title": "Packing Assessment",
          "description": "We assess what needs packing and identify special items requiring extra care. We calculate materials needed and provide a detailed quote."
        },
        {
          "number": "2",
          "title": "Scheduled Packing Day",
          "description": "Our packing team arrives with all materials. We work room by room, using systematic labeling so you know what''s in each box and where it goes."
        },
        {
          "number": "3",
          "title": "Special Item Care",
          "description": "Fragile items get extra attention: bubble wrap, specialized boxes, custom crating. We create an inventory of valuable items for your records."
        },
        {
          "number": "4",
          "title": "Ready for Moving",
          "description": "Everything is securely packed, labeled, and ready for loading. We provide you with a master list of all boxes and their contents."
        }
      ]
    },
    {
      "type": "features",
      "title": "What We Pack",
      "items": [
        "Kitchen items - dishes, glassware, appliances",
        "Clothing - on hangers in wardrobe boxes",
        "Books, DVDs, and media collections",
        "Electronics and computers",
        "Artwork, mirrors, and picture frames",
        "Lamps, ornaments, and decorative items",
        "Bedding, linens, and soft furnishings",
        "Toys, games, and hobby equipment",
        "Garden items and outdoor furniture",
        "Workshop tools and garage items"
      ]
    },
    {
      "type": "faq",
      "title": "Packing Service FAQs for {{location}}",
      "questions": [
        {
          "q": "How much does professional packing cost in {{location}}?",
          "a": "Full packing for a 3-bedroom house typically costs £400-£700. Partial packing and materials-only options are more economical. We provide free quotes based on your specific needs."
        },
        {
          "q": "How long does packing take?",
          "a": "A 3-bedroom house takes our team about 4-6 hours to pack completely. Larger homes or properties with extensive china/glass collections may take longer."
        },
        {
          "q": "Can you pack fragile or valuable items?",
          "a": "Yes! We specialize in packing delicate items. Our team uses proper techniques for fine china, crystal, artwork, antiques, and other valuable items. Custom crating available."
        },
        {
          "q": "Do you provide unpacking services too?",
          "a": "Absolutely! We offer unpacking services where we unpack boxes, place items on shelves/in cupboards, and remove all packing materials. It''s a great way to settle in quickly."
        }
      ]
    }
  ]'::jsonb
WHERE service_type = 'packing';

-- Update Storage Template with unique content
UPDATE location_content_templates
SET
  hero_title_template = 'Secure Storage Solutions in {{location}}',
  hero_subtitle_template = 'Safe, clean storage facilities in {{location}} with flexible terms and 24/7 security',
  description_template = 'Need storage in {{location}}? Our secure storage facilities offer the perfect solution whether you need short-term storage during a move or long-term storage for business inventory. Climate-controlled units, 24/7 CCTV, flexible contracts, and easy access make us {{location}}''s trusted storage provider.',
  meta_title_template = 'Storage {{location}} - Secure Storage Facilities | National Removals and Storage',
  meta_description_template = 'Secure storage in {{location}}. Climate-controlled units, 24/7 security, flexible terms, container and room storage. Perfect for house moves, business storage, and long-term needs.',
  sections = '[
    {
      "type": "intro",
      "title": "Trusted Storage Facilities in {{location}}",
      "content": "Whether you''re between homes, decluttering, renovating, or need business storage, our secure facilities in {{location}} provide the perfect solution. We offer flexible storage options from short-term rental during moves to long-term storage for excess inventory or archived documents. All facilities feature 24/7 security, climate control, and easy access when you need your belongings."
    },
    {
      "type": "benefits",
      "title": "Why Store With Us in {{location}}?",
      "items": [
        {
          "title": "Maximum Security",
          "description": "24/7 CCTV monitoring, individual unit alarms, secure access control, regular security patrols, and comprehensive insurance options. Your belongings are in safe hands."
        },
        {
          "title": "Climate Controlled",
          "description": "Our units maintain consistent temperature and humidity levels. Perfect for protecting furniture, documents, electronics, artwork, and other sensitive items from damage."
        },
        {
          "title": "Flexible Contracts",
          "description": "No long-term commitment required. Store for a week, a month, or years. Easy contract adjustments if you need more or less space. One month''s notice to terminate."
        },
        {
          "title": "Convenient Access",
          "description": "Access your storage unit whenever you need. Extended access hours, 7 days a week. Loading bays and trolleys available. We can also deliver items to/from storage for you."
        }
      ]
    },
    {
      "type": "services",
      "title": "Storage Options in {{location}}",
      "items": [
        {
          "title": "Self-Storage Units",
          "description": "Drive-up units from 25 sq ft to 200 sq ft. You pack, we store. Perfect for household items, business inventory, or archived documents.",
          "sizes": ["25 sq ft - Few boxes, small items", "50 sq ft - 1 bedroom apartment", "100 sq ft - 2-3 bedroom house", "150 sq ft - 4 bedroom house", "200 sq ft - Large house or business stock"]
        },
        {
          "title": "Container Storage",
          "description": "We deliver a secure container to your {{location}} address. You load it at your pace, we collect and store it. Access available by appointment.",
          "features": ["Delivered to your door", "Load at your own pace", "Collected and stored securely", "No need to visit storage facility", "Access by appointment"]
        },
        {
          "title": "Business Storage",
          "description": "Specialized storage for businesses including document archiving, inventory storage, equipment storage, and seasonal stock management.",
          "includes": ["Pallet storage available", "Collection and delivery services", "Inventory management", "Document scanning options", "Flexible access arrangements"]
        },
        {
          "title": "Moving Storage",
          "description": "Short-term storage as part of your removal service. Ideal for chain breaks, renovation storage, or when completion dates don''t align.",
          "benefits": ["Coordinated with your move", "No double handling", "Flexible date changes", "Direct delivery to new home", "No minimum storage period"]
        }
      ]
    },
    {
      "type": "process",
      "title": "How to Store With Us",
      "steps": [
        {
          "number": "1",
          "title": "Choose Your Storage",
          "description": "Contact us to discuss your storage needs. We help you select the right size unit or container based on what you need to store."
        },
        {
          "number": "2",
          "title": "Pack & Prepare",
          "description": "Pack items in boxes for protection. We can provide packing materials or offer our packing service. Label boxes for easy retrieval later."
        },
        {
          "number": "3",
          "title": "Move In or Delivery",
          "description": "Either bring items to our {{location}} facility yourself, or we can collect everything. For container storage, we deliver and collect from your door."
        },
        {
          "number": "4",
          "title": "Secure Storage",
          "description": "Your items are stored in our secure, climate-controlled facility. Access anytime during operating hours, or arrange delivery when needed."
        }
      ]
    },
    {
      "type": "features",
      "title": "Storage Facility Features",
      "items": [
        "24/7 CCTV surveillance throughout facility",
        "Individual unit alarms and access logs",
        "Climate controlled units available",
        "Clean, dry, pest-controlled environment",
        "Secure perimeter fencing",
        "Fire detection and suppression systems",
        "Extended access hours (6am - 10pm)",
        "Trolleys and loading equipment",
        "Free padlocks for new customers",
        "Goods in storage insurance available",
        "Regular facility inspections",
        "Friendly on-site staff to help"
      ]
    },
    {
      "type": "faq",
      "title": "Storage FAQs for {{location}}",
      "questions": [
        {
          "q": "How much does storage cost in {{location}}?",
          "a": "Prices start from £15/week for a 25 sq ft unit (stores about 20 boxes). A 100 sq ft unit suitable for a 2-3 bedroom house costs around £35-45/week. Container storage from £25/week. First month often discounted."
        },
        {
          "q": "Can I access my storage unit anytime?",
          "a": "Yes! Our facilities offer extended access hours from 6am to 10pm, 7 days a week. You can visit your unit as often as needed. For container storage, access is by appointment."
        },
        {
          "q": "Is my stored property insured?",
          "a": "The facility itself is fully insured, but you''re responsible for insuring your contents. We can arrange goods in storage insurance at competitive rates, or you can use your home insurance."
        },
        {
          "q": "What shouldn''t I store?",
          "a": "We cannot store perishable food, flammable materials, hazardous substances, illegal items, or living things. Most household and business items are fine. Contact us if unsure about specific items."
        },
        {
          "q": "How long is the minimum storage period?",
          "a": "There''s no minimum period. You can store for as short as one week. Contracts are monthly, with one month''s notice to terminate. Discounts available for longer-term storage."
        }
      ]
    }
  ]'::jsonb
WHERE service_type = 'storage';

-- Create indexes for better performance on new JSONB content
CREATE INDEX IF NOT EXISTS idx_location_templates_service_type
  ON location_content_templates(service_type);

CREATE INDEX IF NOT EXISTS idx_location_templates_sections
  ON location_content_templates USING gin(sections);
