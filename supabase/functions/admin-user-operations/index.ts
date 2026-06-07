import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the calling user is an admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: callingUser } } = await supabaseAdmin.auth.getUser(token);

      if (callingUser) {
        const { data: userRole } = await supabaseAdmin
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
      }
    }

    const { operation, userId, password } = await req.json();

    if (operation === 'list') {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      const { data: userRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role, full_name, phone');

      if (rolesError) {
        throw rolesError;
      }

      const usersWithRoles = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        user_roles: userRoles?.find(r => r.user_id === user.id),
      }));

      return new Response(JSON.stringify({ users: usersWithRoles }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    if (operation === 'update-password') {
      if (!userId || !password) {
        throw new Error('userId and password are required');
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    if (operation === 'delete-user') {
      if (!userId) {
        throw new Error('userId is required');
      }

      try {
        // Get partner and trade account IDs
        const { data: partner } = await supabaseAdmin
          .from('partners')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const { data: tradeAccount } = await supabaseAdmin
          .from('trade_accounts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        // Delete partner-related records
        if (partner?.id) {
          await supabaseAdmin.from('partner_referrals').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('partner_commissions').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('commission_statements').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('material_orders').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('marketing_material_orders').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('material_downloads').delete().eq('partner_id', partner.id);
          await supabaseAdmin.from('partners').delete().eq('id', partner.id);
        }

        // Delete trade-related records
        if (tradeAccount?.id) {
          await supabaseAdmin.from('trade_bids').delete().eq('bidder_trade_id', tradeAccount.id);
          await supabaseAdmin.from('trade_jobs').delete().eq('posted_by_trade_id', tradeAccount.id);
          await supabaseAdmin.from('trade_jobs').delete().eq('awarded_to_trade_id', tradeAccount.id);
          await supabaseAdmin.from('trade_jobs').delete().eq('purchased_by_trade_id', tradeAccount.id);
          await supabaseAdmin.from('trade_service_bookings').delete().eq('trade_account_id', tradeAccount.id);
          await supabaseAdmin.from('trade_accounts').delete().eq('id', tradeAccount.id);
        }

        // Delete quote-related records
        await supabaseAdmin.from('quote_requests').delete().eq('client_user_id', userId);
        await supabaseAdmin.from('quote_requests').delete().eq('quoted_by', userId);
        await supabaseAdmin.from('quotes').delete().eq('user_id', userId);
        await supabaseAdmin.from('quotes').delete().eq('assigned_to', userId);

        // Delete staff-related records
        await supabaseAdmin.from('staff_job_assignments').delete().eq('staff_id', userId);
        await supabaseAdmin.from('staff_timesheets').delete().eq('staff_id', userId);
        await supabaseAdmin.from('job_reports').delete().eq('staff_id', userId);
        await supabaseAdmin.from('staff_availability').delete().eq('user_id', userId);
        await supabaseAdmin.from('availability_calendar').delete().eq('staff_id', userId);
        await supabaseAdmin.from('policy_acknowledgments').delete().eq('staff_id', userId);
        await supabaseAdmin.from('staff_profiles').delete().eq('user_id', userId);

        // Delete other user-related records
        await supabaseAdmin.from('partner_referrals').delete().eq('partner_user_id', userId);
        await supabaseAdmin.from('partner_commissions').delete().eq('partner_user_id', userId);
        await supabaseAdmin.from('marketing_material_orders').delete().eq('partner_user_id', userId);
        await supabaseAdmin.from('packaging_orders').delete().eq('user_id', userId);
        await supabaseAdmin.from('notifications').delete().eq('user_id', userId);
        await supabaseAdmin.from('support_tickets').delete().eq('user_id', userId);
        await supabaseAdmin.from('support_tickets').delete().eq('assigned_to', userId);
        await supabaseAdmin.from('gdpr_consents').delete().eq('user_id', userId);
        await supabaseAdmin.from('audit_logs').delete().eq('user_id', userId);
        await supabaseAdmin.from('activity_logs').delete().eq('user_id', userId);
        await supabaseAdmin.from('jobs').delete().eq('staff_id', userId);
        await supabaseAdmin.from('company_documents').delete().eq('uploaded_by', userId);
        await supabaseAdmin.from('announcements').delete().eq('created_by', userId);
        await supabaseAdmin.from('account_managers').delete().eq('user_id', userId);

        // Delete user roles
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);

        // Finally delete the user from auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
          throw authError;
        }

        return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (deleteError: any) {
        console.error('Error during user deletion:', deleteError);
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }
    }

    throw new Error('Invalid operation');
  } catch (error: any) {
    console.error('Error in admin-user-operations:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});