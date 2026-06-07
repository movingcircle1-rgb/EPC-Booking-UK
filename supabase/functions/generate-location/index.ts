import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateLocationRequest {
  city: string;
  county?: string;
  region?: string;
  additionalData?: Record<string, any>;
}

interface BulkGenerateRequest {
  cities: GenerateLocationRequest[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('User role check:', { userId: user.id, userRole, roleError });

    if (!userRole) {
      return new Response(
        JSON.stringify({
          error: 'No role found for user. Please contact administrator.',
          details: roleError?.message || 'User role not found in database'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const allowedRoles = ['admin', 'temp_admin'];
    if (!allowedRoles.includes(userRole.role)) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient permissions',
          details: `Your role (${userRole.role}) does not have permission to generate locations. Required roles: admin or temp_admin`
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'POST' && path.endsWith('/generate')) {
      const body: GenerateLocationRequest = await req.json();

      if (!body.city || body.city.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'City name is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: queueData, error: queueError } = await supabase
        .from('location_generation_queue')
        .insert({
          city_name: body.city.trim(),
          county: body.county || null,
          region: body.region || null,
          additional_data: body.additionalData || {},
          created_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (queueError) {
        throw queueError;
      }

      const { data: processResult, error: processError } = await supabase.rpc(
        'process_location_generation',
        { queue_id: queueData.id }
      );

      if (processError) {
        throw processError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Location generated successfully',
          data: processResult,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST' && path.endsWith('/bulk-generate')) {
      const body: BulkGenerateRequest = await req.json();

      if (!body.cities || !Array.isArray(body.cities) || body.cities.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Cities array is required and must not be empty' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const citiesData = body.cities.map((city) => ({
        city: city.city.trim(),
        county: city.county || null,
        region: city.region || null,
        additional_data: city.additionalData || {},
      }));

      const { data: bulkResult, error: bulkError } = await supabase.rpc(
        'bulk_generate_locations',
        {
          cities_data: citiesData,
          created_by_id: user.id,
        }
      );

      if (bulkError) {
        throw bulkError;
      }

      const queueIds = bulkResult.queue_ids || [];
      const results = [];

      for (const queueId of queueIds) {
        const { data: processResult } = await supabase.rpc(
          'process_location_generation',
          { queue_id: queueId }
        );
        results.push(processResult);
      }

      const successCount = results.filter((r) => r?.success).length;
      const failedCount = results.length - successCount;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Bulk generation completed: ${successCount} successful, ${failedCount} failed`,
          data: {
            total: results.length,
            successful: successCount,
            failed: failedCount,
            results,
          },
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET' && path.endsWith('/queue')) {
      const { data: queueData, error: queueError } = await supabase
        .from('location_generation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (queueError) {
        throw queueError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: queueData,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST' && path.endsWith('/validate')) {
      const body: { city: string; slug?: string } = await req.json();

      const { data: validationResult } = await supabase.rpc(
        'validate_location_data',
        {
          city_name: body.city,
          city_slug: body.slug || null,
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: validationResult,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-location function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
