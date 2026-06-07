const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const featured = event.queryStringParameters?.featured === 'true';

  try {
    let query = supabase.from('menu_items').select('*').eq('available', true).order('sort_order');
    if (featured) query = query.limit(6);

    const { data, error } = await query;
    if (error) throw error;
    return { statusCode: 200, headers: cors(), body: JSON.stringify(data || []) };
  } catch (err) {
    console.error('get-menu error:', err.message);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}
