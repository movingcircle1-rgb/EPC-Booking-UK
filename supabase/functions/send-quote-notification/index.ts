import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const RESEND_API_KEY = 're_ZJqU7nc8_8EbAqXqxjzvf67G4KZ2B9uL1';
const ADMIN_EMAILS = ['sales@nationalremovalsandstorage.co.uk', 'waqas@godesign.pk'];

interface QuoteRequest {
  id: string;
  quote_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  move_from_postcode: string;
  move_to_postcode: string;
  property_type: string;
  number_of_bedrooms?: number;
  estimated_volume?: string;
  preferred_move_date?: string;
  flexible_dates: boolean;
  additional_notes?: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { quoteRequestId } = await req.json();

    if (!quoteRequestId) {
      return new Response(
        JSON.stringify({ error: 'Quote request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: quoteRequest, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteRequestId)
      .single();

    if (quoteError || !quoteRequest) {
      console.error('Quote request not found:', quoteError);
      return new Response(
        JSON.stringify({ error: 'Quote request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResults = await sendAdminNotification(quoteRequest as QuoteRequest);

    if (emailResults.some(r => !r.success)) {
      console.warn('Some emails failed to send:', emailResults);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailResults.filter(r => r.success).length,
        totalEmails: emailResults.length,
        results: emailResults,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending quote notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendAdminNotification(quote: QuoteRequest) {
  const results = [];

  for (const recipientEmail of ADMIN_EMAILS) {
    try {
      const emailHtml = generateAdminEmailHtml(quote);
      const emailText = generateAdminEmailText(quote);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'National Removals <notifications@nationalremovalsandstorage.co.uk>',
          to: recipientEmail,
          subject: `🚚 New Quote Request - ${quote.quote_reference}`,
          html: emailHtml,
          text: emailText,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Email sent successfully to ${recipientEmail}:`, result);
        results.push({ email: recipientEmail, success: true, messageId: result.id });
      } else {
        console.error(`❌ Failed to send email to ${recipientEmail}:`, result);
        results.push({ email: recipientEmail, success: false, error: result.message });
      }
    } catch (error: any) {
      console.error(`❌ Error sending email to ${recipientEmail}:`, error);
      results.push({ email: recipientEmail, success: false, error: error.message });
    }
  }

  return results;
}

function generateAdminEmailHtml(quote: QuoteRequest): string {
  const serviceName = formatServiceType(quote.service_type);
  const propertyInfo = quote.property_type ? formatPropertyType(quote.property_type) : 'Not specified';
  const bedroomsInfo = quote.number_of_bedrooms ? `${quote.number_of_bedrooms} bedroom(s)` : '';
  const moveDate = quote.preferred_move_date || 'Not specified';
  const flexibleDates = quote.flexible_dates ? 'Yes' : 'No';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #e71c5e 0%, #c91852 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .section { margin-bottom: 25px; }
    .section-title { color: #e71c5e; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #e71c5e; padding-bottom: 5px; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .info-label { font-weight: bold; width: 180px; color: #666; }
    .info-value { flex: 1; color: #333; }
    .button { display: inline-block; background: #e71c5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .highlight { background: #fff3f7; padding: 15px; border-left: 4px solid #e71c5e; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🚚 New Quote Request</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Reference: ${quote.quote_reference}</p>
    </div>

    <div class="content">
      <div class="highlight">
        <strong>⏰ Received:</strong> ${new Date(quote.created_at).toLocaleString('en-GB', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}
      </div>

      <div class="section">
        <div class="section-title">👤 Customer Information</div>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${quote.customer_name}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${quote.customer_email}">${quote.customer_email}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value"><a href="tel:${quote.customer_phone}">${quote.customer_phone}</a></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📦 Service Details</div>
        <div class="info-row">
          <div class="info-label">Service Type:</div>
          <div class="info-value"><strong>${serviceName}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">From:</div>
          <div class="info-value">${quote.move_from_postcode}</div>
        </div>
        <div class="info-row">
          <div class="info-label">To:</div>
          <div class="info-value">${quote.move_to_postcode}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🏠 Property Information</div>
        <div class="info-row">
          <div class="info-label">Property Type:</div>
          <div class="info-value">${propertyInfo}</div>
        </div>
        ${bedroomsInfo ? `
        <div class="info-row">
          <div class="info-label">Bedrooms:</div>
          <div class="info-value">${bedroomsInfo}</div>
        </div>
        ` : ''}
        ${quote.estimated_volume ? `
        <div class="info-row">
          <div class="info-label">Estimated Volume:</div>
          <div class="info-value">${quote.estimated_volume}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">📅 Move Details</div>
        <div class="info-row">
          <div class="info-label">Preferred Date:</div>
          <div class="info-value">${moveDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Flexible Dates:</div>
          <div class="info-value">${flexibleDates}</div>
        </div>
      </div>

      ${quote.additional_notes ? `
      <div class="section">
        <div class="section-title">📝 Additional Notes</div>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${quote.additional_notes}</div>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://nationalremovalsandstorage.co.uk/admin" class="button">View in Admin Dashboard →</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from National Removals and Storage.</p>
      <p>Please respond to the customer within 24 hours.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAdminEmailText(quote: QuoteRequest): string {
  const serviceName = formatServiceType(quote.service_type);

  return `
NEW QUOTE REQUEST - ${quote.quote_reference}

Received: ${new Date(quote.created_at).toLocaleString('en-GB')}

CUSTOMER INFORMATION
---------------------
Name: ${quote.customer_name}
Email: ${quote.customer_email}
Phone: ${quote.customer_phone}

SERVICE DETAILS
---------------
Service Type: ${serviceName}
From: ${quote.move_from_postcode}
To: ${quote.move_to_postcode}

PROPERTY INFORMATION
--------------------
Property Type: ${quote.property_type || 'Not specified'}
Bedrooms: ${quote.number_of_bedrooms || 'Not specified'}
${quote.estimated_volume ? `Estimated Volume: ${quote.estimated_volume}` : ''}

MOVE DETAILS
------------
Preferred Date: ${quote.preferred_move_date || 'Not specified'}
Flexible Dates: ${quote.flexible_dates ? 'Yes' : 'No'}

${quote.additional_notes ? `
ADDITIONAL NOTES
----------------
${quote.additional_notes}
` : ''}

View full details in Admin Dashboard:
https://nationalremovalsandstorage.co.uk/admin

---
This is an automated notification from National Removals and Storage.
Please respond to the customer within 24 hours.
  `.trim();
}

function formatServiceType(serviceType: string): string {
  const serviceTypes: { [key: string]: string } = {
    'house_removals': 'House Removals',
    'office_removals': 'Office Removals',
    'international_moves': 'International Moves',
    'european_moves': 'European Moves',
    'storage': 'Storage',
    'packing_services': 'Packing Services',
    'other': 'Other Services',
  };
  return serviceTypes[serviceType] || serviceType;
}

function formatPropertyType(propertyType: string): string {
  const propertyTypes: { [key: string]: string } = {
    'flat': 'Flat/Apartment',
    'house': 'House',
    'office': 'Office',
    'storage': 'Storage Unit',
    'other': 'Other',
  };
  return propertyTypes[propertyType] || propertyType;
}
