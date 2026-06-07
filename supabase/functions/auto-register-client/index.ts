import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  move_from_postcode: string;
  move_to_postcode: string;
  preferred_move_date?: string;
  service_type: string;
  property_type: string;
  number_of_bedrooms?: number;
  quote_reference: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { quoteRequestId } = await req.json();

    if (!quoteRequestId) {
      return new Response(
        JSON.stringify({ error: 'Quote request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: quoteRequest, error: quoteError } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', quoteRequestId)
      .single();

    if (quoteError || !quoteRequest) {
      return new Response(
        JSON.stringify({ error: 'Quote request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const email = quoteRequest.customer_email.toLowerCase().trim();

    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.find((u: any) => u.email === email);

    let userId: string;
    let tempPassword: string | null = null;
    let isNewUser = false;

    if (userExists) {
      userId = userExists.id;
      console.log(`User already exists: ${email}`);
    } else {
      tempPassword = generateSecurePassword();

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: quoteRequest.customer_name,
          phone: quoteRequest.customer_phone,
          registered_via: 'quote_form',
          registration_date: new Date().toISOString(),
        },
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account', details: createError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`New user created: ${email}`);
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        email: email,
        role: 'client',
      }, { onConflict: 'user_id' });

    if (roleError) {
      console.error('Error creating user role:', roleError);
    }

    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingClient) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          full_name: quoteRequest.customer_name,
          email: email,
          phone: quoteRequest.customer_phone,
          move_from_postcode: quoteRequest.move_from_postcode,
          move_to_postcode: quoteRequest.move_to_postcode,
          preferred_move_date: quoteRequest.preferred_move_date,
        });

      if (clientError) {
        console.error('Error creating client record:', clientError);
      }
    }

    await supabase
      .from('quote_requests')
      .update({
        client_user_id: userId,
        auto_registered: isNewUser,
        registration_completed_at: new Date().toISOString(),
      })
      .eq('id', quoteRequestId);

    if (isNewUser && tempPassword) {
      await sendWelcomeEmail({
        email: email,
        name: quoteRequest.customer_name,
        password: tempPassword,
        quoteReference: quoteRequest.quote_reference,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId,
        isNewUser: isNewUser,
        email: email,
        password: isNewUser ? tempPassword : undefined,
        message: isNewUser
          ? 'Account created successfully. Welcome email sent.'
          : 'Quote linked to existing account.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Auto-registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const RESEND_API_KEY = 're_ZJqU7nc8_8EbAqXqxjzvf67G4KZ2B9uL1';

async function sendWelcomeEmail(data: {
  email: string;
  name: string;
  password: string;
  quoteReference: string;
}): Promise<void> {
  try {
    const portalUrl = 'https://nationalremovalsandstorage.co.uk/client-portal';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #e71c5e 0%, #c91852 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .welcome-box { background: #fff3f7; border-left: 4px solid #e71c5e; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .credentials-box { background: #f9f9f9; border: 2px dashed #e71c5e; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .credential-row { display: flex; margin: 10px 0; }
    .credential-label { font-weight: bold; width: 100px; color: #666; }
    .credential-value { flex: 1; color: #333; font-family: monospace; background: white; padding: 8px 12px; border-radius: 4px; }
    .button { display: inline-block; background: #e71c5e; color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
    .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    .section { margin: 25px 0; }
    .section-title { color: #e71c5e; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">Welcome to National Removals!</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your quote request has been received</p>
    </div>

    <div class="content">
      <div class="welcome-box">
        <p style="margin: 0;"><strong>Hello ${data.name},</strong></p>
        <p style="margin: 10px 0 0;">Thank you for requesting a quote with National Removals and Storage! We've received your request and our team will prepare your personalized quote within 24 hours.</p>
      </div>

      <div class="section">
        <div class="section-title">📋 Your Quote Reference</div>
        <p style="font-size: 24px; font-weight: bold; color: #e71c5e; margin: 10px 0;">${data.quoteReference}</p>
        <p style="color: #666; font-size: 14px;">Please reference this number in any communication with us.</p>
      </div>

      <div class="section">
        <div class="section-title">🎉 Client Portal Access Created</div>
        <p>We've created a secure client portal account for you where you can:</p>
        <ul>
          <li>View and track your quote status</li>
          <li>Manage your move details</li>
          <li>Upload documents and photos</li>
          <li>Communicate with our team</li>
          <li>Access helpful moving resources</li>
        </ul>
      </div>

      <div class="credentials-box">
        <h3 style="margin: 0 0 15px; color: #e71c5e;">🔐 Your Login Credentials</h3>
        <div class="credential-row">
          <div class="credential-label">Email:</div>
          <div class="credential-value">${data.email}</div>
        </div>
        <div class="credential-row">
          <div class="credential-label">Password:</div>
          <div class="credential-value">${data.password}</div>
        </div>
        <p style="margin: 15px 0 0; font-size: 13px; color: #e71c5e;">
          <strong>⚠️ Important:</strong> Please change your password after your first login for security.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${portalUrl}" class="button">Access Your Client Portal →</a>
      </div>

      <div class="section">
        <div class="section-title">📞 Need Help?</div>
        <p>Our team is here to assist you:</p>
        <ul style="list-style: none; padding: 0;">
          <li>📧 Email: <a href="mailto:sales@nationalremovalsandstorage.co.uk" style="color: #e71c5e;">sales@nationalremovalsandstorage.co.uk</a></li>
          <li>🌐 Website: <a href="https://nationalremovalsandstorage.co.uk" style="color: #e71c5e;">nationalremovalsandstorage.co.uk</a></li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p><strong>National Removals and Storage</strong></p>
      <p>Professional Moving Services Across the UK</p>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        This email was sent because you requested a quote on our website.<br>
        If you didn't make this request, please contact us immediately.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
Welcome to National Removals and Storage!

Hello ${data.name},

Thank you for requesting a quote! We've received your request and our team will prepare your personalized quote within 24 hours.

YOUR QUOTE REFERENCE: ${data.quoteReference}
Please reference this number in any communication with us.

CLIENT PORTAL ACCESS CREATED
-----------------------------
We've created a secure client portal account for you.

Your Login Credentials:
Email: ${data.email}
Password: ${data.password}

IMPORTANT: Please change your password after your first login for security.

Portal URL: ${portalUrl}

In your client portal, you can:
- View and track your quote status
- Manage your move details
- Upload documents and photos
- Communicate with our team
- Access helpful moving resources

NEED HELP?
----------
Email: sales@nationalremovalsandstorage.co.uk
Website: https://nationalremovalsandstorage.co.uk

---
National Removals and Storage
Professional Moving Services Across the UK

This email was sent because you requested a quote on our website.
If you didn't make this request, please contact us immediately.
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'National Removals <notifications@nationalremovalsandstorage.co.uk>',
        to: data.email,
        subject: `Welcome to National Removals - Quote ${data.quoteReference}`,
        html: emailHtml,
        text: emailText,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Welcome email sent successfully to ${data.email}:`, result);
    } else {
      console.error(`❌ Failed to send welcome email to ${data.email}:`, result);
    }
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
  }
}
