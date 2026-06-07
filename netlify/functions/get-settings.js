const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const key = event.queryStringParameters?.key;

  try {
    if (key) {
      const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
      if (error && error.code !== 'PGRST116') throw error;
      const value = data?.value || {};
      return { statusCode: 200, headers: cors(), body: JSON.stringify(value) };
    }

    // Return all settings merged
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const merged = {};
    (data || []).forEach(row => Object.assign(merged, row.value));
    return { statusCode: 200, headers: cors(), body: JSON.stringify(merged) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
}
