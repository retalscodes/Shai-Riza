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
  const key = event.queryStringParameters?.key;

  try {
    if (key) {
      const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
      if (error && error.code !== 'PGRST116') throw error;
      return { statusCode: 200, headers: cors(), body: JSON.stringify(data?.value || {}) };
    }

    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const merged = {};
    (data || []).forEach(row => Object.assign(merged, row.value));
    return { statusCode: 200, headers: cors(), body: JSON.stringify(merged) };
  } catch (err) {
    console.error('get-settings error:', err.message);
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
