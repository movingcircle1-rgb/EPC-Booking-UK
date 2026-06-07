export const resourcesGenerator = {
  generatePackingGuide(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the guide');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Packing Guide - National Removals and Storage</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #6b6b6b; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #6b6b6b; margin-bottom: 5px; }
            .document-title { font-size: 22px; color: #666; margin-top: 10px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #6b6b6b; margin-bottom: 15px; margin-top: 30px; }
            p { margin-bottom: 15px; font-size: 14px; }
            ul { margin-left: 25px; margin-bottom: 15px; font-size: 14px; }
            li { margin-bottom: 8px; }
            .tip-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
            .warning-box { background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .print-button { position: fixed; top: 20px; right: 20px; background: #6b6b6b; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-name">National Removals and Storage</div>
            <div class="document-title">Complete Packing Guide</div>
          </div>

          <div class="section">
            <h2 class="section-title">Getting Started</h2>
            <p>Proper packing is essential for a successful move. This guide will help you pack your belongings safely and efficiently.</p>
          </div>

          <div class="section">
            <h2 class="section-title">Essential Packing Materials</h2>
            <ul>
              <li><strong>Cardboard boxes:</strong> Various sizes (small for heavy items, large for light items)</li>
              <li><strong>Bubble wrap:</strong> For fragile items and electronics</li>
              <li><strong>Packing paper:</strong> For wrapping dishes, glassware, and filling gaps</li>
              <li><strong>Packing tape:</strong> Heavy-duty tape for sealing boxes</li>
              <li><strong>Markers:</strong> For labeling boxes clearly</li>
              <li><strong>Furniture covers:</strong> To protect furniture during transit</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Room-by-Room Packing Guide</h2>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Kitchen</h3>
            <ul>
              <li>Wrap each dish individually with packing paper or bubble wrap</li>
              <li>Place plates vertically (on edge) in boxes with dividers</li>
              <li>Fill gaps with crumpled paper to prevent movement</li>
              <li>Label boxes as "FRAGILE" and indicate "THIS SIDE UP"</li>
              <li>Keep heavy items in small boxes to prevent breakage</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Bedroom</h3>
            <ul>
              <li>Use wardrobe boxes for hanging clothes to minimize ironing</li>
              <li>Fold and pack other clothes in suitcases or boxes</li>
              <li>Keep bedding in large boxes or vacuum storage bags</li>
              <li>Wrap jewelry and valuables separately and keep with you</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Living Room</h3>
            <ul>
              <li>Wrap electronics in original boxes if possible</li>
              <li>Take photos of cable connections before unplugging</li>
              <li>Protect TV screens and mirrors with bubble wrap and cardboard</li>
              <li>Disassemble furniture where practical and keep screws in labeled bags</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Bathroom</h3>
            <ul>
              <li>Seal all liquids with tape and place in plastic bags</li>
              <li>Pack toiletries separately from other items</li>
              <li>Dispose of expired medications and cosmetics</li>
              <li>Keep a separate bag of essentials for first day in new home</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Packing Tips & Best Practices</h2>
            <ul>
              <li>Start packing early - at least 2-3 weeks before your move</li>
              <li>Pack one room at a time to stay organized</li>
              <li>Label every box with its contents and destination room</li>
              <li>Use color coding for different rooms (optional but helpful)</li>
              <li>Keep an inventory list of all boxes</li>
              <li>Pack heavier items at the bottom, lighter items on top</li>
              <li>Don't overfill boxes - keep weight manageable (max 20kg)</li>
              <li>Fill empty spaces to prevent items shifting</li>
              <li>Keep essential items separate (documents, medications, keys)</li>
            </ul>
          </div>

          <div class="tip-box">
            <strong>💡 Pro Tip:</strong> Pack an "essentials box" with items you'll need immediately: toiletries, change of clothes, phone chargers, basic tools, kettle, mugs, tea/coffee, and important documents.
          </div>

          <div class="warning-box">
            <strong>⚠️ Important:</strong> Do not pack hazardous materials (paint, aerosols, batteries, chemicals), perishable food, or valuable documents in moving boxes. Keep these items with you or dispose of them properly.
          </div>

          <div class="section">
            <h2 class="section-title">Labeling System</h2>
            <p>Use this format for labeling boxes:</p>
            <ul>
              <li><strong>Box number:</strong> e.g., "Box 1 of 15"</li>
              <li><strong>Room:</strong> e.g., "KITCHEN"</li>
              <li><strong>Contents:</strong> e.g., "Pots and Pans"</li>
              <li><strong>Special handling:</strong> e.g., "FRAGILE" or "THIS SIDE UP"</li>
            </ul>
          </div>

          <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="font-size: 11px; color: #666;">
              <strong>National Removals and Storage</strong><br>
              Phone: 0800 047 2607 | Email: info@nationalremovals.co.uk
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.focus();
  },

  generateMovingChecklist(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the checklist');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Moving Checklist - National Removals and Storage</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #6b6b6b; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #6b6b6b; margin-bottom: 5px; }
            .document-title { font-size: 22px; color: #666; margin-top: 10px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #6b6b6b; margin-bottom: 15px; margin-top: 30px; }
            .checklist { list-style: none; margin-left: 0; }
            .checklist li { padding: 10px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; }
            .checklist li:before { content: '☐'; font-size: 20px; margin-right: 15px; color: #6b6b6b; }
            .timeline { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin-bottom: 15px; }
            .print-button { position: fixed; top: 20px; right: 20px; background: #6b6b6b; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-name">National Removals and Storage</div>
            <div class="document-title">Complete Moving Checklist</div>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>8 Weeks Before Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Book your removal company</li>
              <li>Get quotes and compare prices</li>
              <li>Arrange building insurance for new property</li>
              <li>Start decluttering - donate or sell unwanted items</li>
              <li>Create a moving folder for important documents</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>6 Weeks Before Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Notify schools of change of address</li>
              <li>Register with new GP and dentist</li>
              <li>Arrange mail redirection with Royal Mail</li>
              <li>Update address with bank, insurance, DVLA</li>
              <li>Order packing materials</li>
              <li>Start packing items you don't use daily</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>4 Weeks Before Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Notify utility companies (gas, electric, water)</li>
              <li>Arrange internet and phone transfer</li>
              <li>Cancel or transfer council tax</li>
              <li>Update TV license address</li>
              <li>Notify subscriptions and memberships</li>
              <li>Arrange parking permits if needed</li>
              <li>Continue packing room by room</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>2 Weeks Before Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Confirm details with removal company</li>
              <li>Arrange childcare/pet care for moving day</li>
              <li>Defrost and clean freezer</li>
              <li>Return library books and borrowed items</li>
              <li>Use up frozen food</li>
              <li>Pack all non-essential items</li>
              <li>Label all boxes clearly</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>1 Week Before Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Confirm moving day arrangements</li>
              <li>Pack suitcase with essentials</li>
              <li>Clean out garden shed/garage</li>
              <li>Dispose of hazardous materials properly</li>
              <li>Take meter readings at current property</li>
              <li>Prepare refreshments for moving team</li>
              <li>Charge phone and devices</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Final walk-through of empty property</li>
              <li>Record meter readings</li>
              <li>Lock all windows and doors</li>
              <li>Hand over keys</li>
              <li>Supervise loading of removal van</li>
              <li>Keep valuables and documents with you</li>
              <li>Check everything is loaded before leaving</li>
            </ul>
          </div>

          <div class="section">
            <div class="timeline">
              <strong>After Moving Day</strong>
            </div>
            <ul class="checklist">
              <li>Take meter readings at new property</li>
              <li>Check all items have arrived safely</li>
              <li>Report any damage to removal company</li>
              <li>Unpack essentials box first</li>
              <li>Register with new local council</li>
              <li>Update electoral roll</li>
              <li>Inform friends and family of new address</li>
              <li>Explore your new neighborhood</li>
            </ul>
          </div>

          <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="font-size: 11px; color: #666;">
              <strong>National Removals and Storage</strong><br>
              Phone: 0800 047 2607 | Email: info@nationalremovals.co.uk
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.focus();
  },

  generatePreparationGuide(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the guide');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Preparation Guide - National Removals and Storage</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #6b6b6b; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #6b6b6b; margin-bottom: 5px; }
            .document-title { font-size: 22px; color: #666; margin-top: 10px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #6b6b6b; margin-bottom: 15px; margin-top: 30px; }
            p { margin-bottom: 15px; font-size: 14px; }
            ul { margin-left: 25px; margin-bottom: 15px; font-size: 14px; }
            li { margin-bottom: 8px; }
            .tip-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
            .print-button { position: fixed; top: 20px; right: 20px; background: #6b6b6b; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-name">National Removals and Storage</div>
            <div class="document-title">Moving Day Preparation Guide</div>
          </div>

          <div class="section">
            <h2 class="section-title">Preparing Your Property</h2>
            <p>Proper preparation ensures a smooth and efficient moving day.</p>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Access & Parking</h3>
            <ul>
              <li>Arrange parking permits for the removal van if needed</li>
              <li>Reserve parking spaces close to your property entrance</li>
              <li>Ensure clear access to both properties</li>
              <li>Check for any height or width restrictions</li>
              <li>Inform neighbors about the move to avoid parking issues</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Property Protection</h3>
            <ul>
              <li>Protect carpets and flooring with protective sheets</li>
              <li>Remove or secure any loose items in hallways</li>
              <li>Protect door frames and banisters if necessary</li>
              <li>Remove pictures and mirrors from walls</li>
              <li>Secure pets in a safe room away from moving activity</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Furniture Preparation</h2>
            <ul>
              <li>Disassemble furniture where possible (beds, tables, wardrobes)</li>
              <li>Keep screws and fixtures in labeled plastic bags</li>
              <li>Tape bags to the furniture piece they belong to</li>
              <li>Empty all drawers and cupboards</li>
              <li>Remove or secure any glass shelves</li>
              <li>Protect corners and edges of furniture</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Appliances</h2>
            <ul>
              <li>Defrost freezer 48 hours before moving</li>
              <li>Disconnect and clean washing machine</li>
              <li>Drain dishwasher and washing machine hoses</li>
              <li>Secure drum of washing machine if possible</li>
              <li>Keep appliance manuals and warranty cards together</li>
            </ul>
          </div>

          <div class="tip-box">
            <strong>✓ Top Tip:</strong> Take photos of how appliances are connected before disconnecting them. This makes reconnection much easier in your new home.
          </div>

          <div class="section">
            <h2 class="section-title">On Moving Day</h2>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Morning of the Move</h3>
            <ul>
              <li>Have a good breakfast - it's going to be a long day!</li>
              <li>Dress comfortably in practical clothing and shoes</li>
              <li>Keep phone fully charged</li>
              <li>Have cash available for tips (optional but appreciated)</li>
              <li>Prepare tea/coffee facilities for the moving team</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">During the Move</h3>
            <ul>
              <li>Be available to answer questions from the removal team</li>
              <li>Point out any fragile or valuable items</li>
              <li>Keep children and pets safe and out of the way</li>
              <li>Do a final check of all rooms, cupboards, and outdoor areas</li>
              <li>Take meter readings before leaving</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Essential Items to Keep With You</h2>
            <ul>
              <li>Important documents (passports, contracts, insurance)</li>
              <li>Medications and prescriptions</li>
              <li>Mobile phone and chargers</li>
              <li>Keys for new property</li>
              <li>Laptop and valuables</li>
              <li>Basic toiletries and change of clothes</li>
              <li>Snacks and drinks</li>
              <li>Pet supplies and food</li>
              <li>Basic cleaning supplies for new home</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Final Checks Before Leaving</h2>
            <ul>
              <li>Check all rooms including attic and basement</li>
              <li>Look in all cupboards and wardrobes</li>
              <li>Check garden, shed, and garage</li>
              <li>Ensure all windows are closed and locked</li>
              <li>Turn off all lights and appliances</li>
              <li>Lock all doors</li>
              <li>Hand over keys to estate agent or new owner</li>
            </ul>
          </div>

          <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="font-size: 11px; color: #666;">
              <strong>National Removals and Storage</strong><br>
              Phone: 0800 047 2607 | Email: info@nationalremovals.co.uk
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.focus();
  },

  generateNewHomeEssentials(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the guide');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>New Home Essentials - National Removals and Storage</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #6b6b6b; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #6b6b6b; margin-bottom: 5px; }
            .document-title { font-size: 22px; color: #666; margin-top: 10px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #6b6b6b; margin-bottom: 15px; margin-top: 30px; }
            p { margin-bottom: 15px; font-size: 14px; }
            ul { margin-left: 25px; margin-bottom: 15px; font-size: 14px; }
            li { margin-bottom: 8px; }
            .highlight-box { background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .print-button { position: fixed; top: 20px; right: 20px; background: #6b6b6b; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-name">National Removals and Storage</div>
            <div class="document-title">New Home Essentials Checklist</div>
          </div>

          <div class="section">
            <h2 class="section-title">First Day Essentials</h2>
            <p>Items you'll need immediately upon arrival at your new home.</p>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Kitchen Basics</h3>
            <ul>
              <li>Kettle and tea/coffee supplies</li>
              <li>Mugs, plates, and cutlery</li>
              <li>Bottle opener and corkscrew</li>
              <li>Basic cleaning supplies</li>
              <li>Bin bags and kitchen roll</li>
              <li>Snacks and easy meals</li>
              <li>Water bottles</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Bathroom Essentials</h3>
            <ul>
              <li>Toilet paper (priority!)</li>
              <li>Hand soap and shower gel</li>
              <li>Towels and bath mat</li>
              <li>Toothbrushes and toothpaste</li>
              <li>Basic first aid kit</li>
              <li>Medications</li>
            </ul>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Bedroom Must-Haves</h3>
            <ul>
              <li>Bedding (sheets, duvet, pillows)</li>
              <li>Change of clothes</li>
              <li>Phone chargers</li>
              <li>Alarm clock or phone</li>
              <li>Nightlight or torch</li>
            </ul>
          </div>

          <div class="highlight-box">
            <strong>⚡ Pro Tip:</strong> Pack an "overnight bag" with these essentials so you can access them immediately without searching through boxes.
          </div>

          <div class="section">
            <h2 class="section-title">First Week Tasks</h2>
            <ul>
              <li>Take meter readings and photograph them</li>
              <li>Test all lights, switches, and power outlets</li>
              <li>Check all taps and plumbing</li>
              <li>Test heating and hot water</li>
              <li>Locate stopcock and fusebox</li>
              <li>Check smoke alarms and carbon monoxide detectors</li>
              <li>Register with local GP and dentist</li>
              <li>Update your address with important services</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Essential Tools & Supplies</h2>
            <ul>
              <li>Screwdriver set</li>
              <li>Hammer</li>
              <li>Drill and drill bits</li>
              <li>Tape measure</li>
              <li>Spirit level</li>
              <li>Picture hooks and nails</li>
              <li>Light bulbs (various fittings)</li>
              <li>Extension cables</li>
              <li>Box cutter or scissors</li>
              <li>Cleaning supplies and vacuum</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Setting Up Utilities</h2>
            <ul>
              <li>Contact electricity and gas suppliers</li>
              <li>Set up water account</li>
              <li>Arrange internet and phone installation</li>
              <li>Set up TV license</li>
              <li>Register for council tax</li>
              <li>Arrange waste collection days</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Getting to Know Your New Area</h2>
            <ul>
              <li>Locate nearest supermarket and shops</li>
              <li>Find local post office</li>
              <li>Identify closest pharmacy</li>
              <li>Locate nearest hospital/urgent care</li>
              <li>Find local parks and leisure facilities</li>
              <li>Check public transport options</li>
              <li>Join local community groups on social media</li>
              <li>Introduce yourself to neighbors</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Home Safety Checklist</h2>
            <ul>
              <li>Change locks if previous owners had keys</li>
              <li>Test all smoke detectors</li>
              <li>Install carbon monoxide detectors</li>
              <li>Check window and door locks work properly</li>
              <li>Ensure garden gates and fences are secure</li>
              <li>Update home insurance</li>
              <li>Keep emergency numbers handy</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">Making It Feel Like Home</h2>
            <ul>
              <li>Unpack and set up bedrooms first</li>
              <li>Hang pictures and personal items</li>
              <li>Set up living room for relaxation</li>
              <li>Add plants or flowers</li>
              <li>Organize kitchen to your preference</li>
              <li>Take time to enjoy your new space!</li>
            </ul>
          </div>

          <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="font-size: 11px; color: #666;">
              <strong>National Removals and Storage</strong><br>
              Phone: 0800 047 2607 | Email: info@nationalremovals.co.uk<br>
              Welcome to your new home!
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.focus();
  }
};
