import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'temp_admin' | 'staff' | 'client' | 'partner' | 'trade';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user: callingUser }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single();

    const adminRoles = ['admin', 'temp_admin'];
    if (!userRole || !adminRoles.includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: CreateUserRequest = await req.json();
    const { email, password, fullName, full_name, phone, role } = requestData;

    const userName = fullName || full_name;

    if (!email || !password || !userName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, full_name, role' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: userName,
        phone: phone || '',
        role: role,
      },
    });

    if (createError) {
      throw createError;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: existingRole, error: checkError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();

    if (checkError || !existingRole) {
      console.log('Creating user_roles record manually');
      const { error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role,
          full_name: userName,
          email,
          phone: phone || null,
        });

      if (insertError) {
        console.error('Error creating user role:', insertError);
        await supabaseClient.auth.admin.deleteUser(newUser.user.id);
        throw insertError;
      }
    } else if (existingRole.role !== role) {
      console.log('Updating existing user_roles record');
      const { error: updateError } = await supabaseClient
        .from('user_roles')
        .update({
          role,
          full_name: userName,
          email,
          phone: phone || null,
        })
        .eq('user_id', newUser.user.id);

      if (updateError) {
        console.error('Error updating user role:', updateError);
      }
    }

    const { error: resetError } = await supabaseClient.auth.admin.inviteUserByEmail(email);
    
    if (resetError) {
      console.warn('Failed to send invite email:', resetError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.user.id,
          email,
          full_name: userName,
          role,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create user' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});