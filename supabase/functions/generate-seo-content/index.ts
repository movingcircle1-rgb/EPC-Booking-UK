import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import OpenAI from 'npm:openai@4.72.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ContentBlock {
  heading: string;
  content: string;
  image_alt: string;
}

interface GenerateContentRequest {
  cityId: string;
  cityName: string;
  serviceType: string;
  county?: string;
  region?: string;
  nearbyAreas?: string[];
}

const servicePrompts = {
  'general': {
    focus: 'comprehensive removal services',
    keywords: 'professional removals, house moving, reliable movers, local removal company'
  },
  'house-removals': {
    focus: 'residential house removals and home moving',
    keywords: 'house removals, home moving, residential relocation, furniture moving'
  },
  'office-removals': {
    focus: 'commercial office relocations and business moves',
    keywords: 'office removals, business relocation, commercial moves, workplace moving'
  },
  'storage': {
    focus: 'secure storage solutions and facilities',
    keywords: 'storage services, secure storage, storage facilities, self storage'
  },
  'packing': {
    focus: 'professional packing services',
    keywords: 'packing services, professional packing, packing materials, moving boxes'
  },
  'furniture-removal': {
    focus: 'specialized furniture removal and transport',
    keywords: 'furniture removal, furniture transport, single item moves, sofa removal'
  },
  'international-moves': {
    focus: 'international removals and overseas relocations',
    keywords: 'international removals, overseas moves, European removals, global relocation'
  },
  'european-moves': {
    focus: 'European removals and cross-border moves',
    keywords: 'European removals, EU moves, cross-border removals, continental moves'
  }
};

async function generateContentBlocks(
  openai: OpenAI,
  request: GenerateContentRequest
): Promise<ContentBlock[]> {
  const serviceInfo = servicePrompts[request.serviceType as keyof typeof servicePrompts] || servicePrompts.general;

  const nearbyText = request.nearbyAreas && request.nearbyAreas.length > 0
    ? `We also serve nearby areas including ${request.nearbyAreas.slice(0, 5).join(', ')}.`
    : '';

  const locationContext = request.county
    ? `${request.cityName}, ${request.county}`
    : request.cityName;

  const systemPrompt = `You are an expert SEO content writer for a professional UK removals company called National Removals and Storage.
Your writing is professional, trustworthy, locally-focused, and optimized for search engines.
You naturally incorporate keywords while maintaining readability and providing genuine value to readers.
Always mention specific local details when provided and create content that feels authentic to the area.`;

  const userPrompt = `Generate 3 unique SEO content blocks for a ${serviceInfo.focus} page about ${locationContext}.

REQUIREMENTS:
- Each block must be completely unique with different angles and information
- Block 1: Focus on local expertise and area knowledge
- Block 2: Focus on service quality and customer benefits
- Block 3: Focus on process, reliability, and trust factors

For each block, provide:
1. A compelling H2 heading (50-65 characters) that includes the city name
2. Content (150-250 words) that:
   - Naturally incorporates these keywords: ${serviceInfo.keywords}
   - Mentions ${locationContext} multiple times naturally
   - Includes specific local details when possible
   - Provides genuine value and information
   - Uses UK English spelling
   - Sounds natural and conversational, not overly promotional
3. An SEO-friendly image alt text (80-120 characters)

${nearbyText}

Respond with valid JSON in this exact format:
{
  "blocks": [
    {
      "heading": "H2 heading here",
      "content": "Content paragraph here",
      "image_alt": "Alt text here"
    },
    {
      "heading": "Different H2 heading here",
      "content": "Different content paragraph here",
      "image_alt": "Different alt text here"
    },
    {
      "heading": "Another unique H2 heading here",
      "content": "Another unique content paragraph here",
      "image_alt": "Another unique alt text here"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(responseText);
    return parsed.blocks;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured',
          message: 'Please add OPENAI_API_KEY to your Supabase Edge Function secrets'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });

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

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const allowedRoles = ['admin', 'temp_admin'];
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const body: GenerateContentRequest = await req.json();

      if (!body.cityId || !body.cityName || !body.serviceType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: cityId, cityName, serviceType' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const blocks = await generateContentBlocks(openai, body);

      return new Response(
        JSON.stringify({
          success: true,
          blocks,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: 'gpt-4o',
            cityName: body.cityName,
            serviceType: body.serviceType
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-seo-content function:', error);

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