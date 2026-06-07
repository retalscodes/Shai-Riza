const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const featured = event.queryStringParameters?.featured === 'true';

  try {
    let query = supabase.from('menu_items').select('*').eq('available', true).order('sort_order');
    if (featured) query = query.limit(6);

    const { data, error } = await query;
    if (error) throw error;
    return { statusCode: 200, headers: cors(), body: JSON.stringify(data || []) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() { return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }; }
