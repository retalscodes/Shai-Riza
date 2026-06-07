const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method not allowed' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let phone, name;
  try {
    ({ phone, name } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!phone) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'phone required' }) };

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({ phone, name: name || null, stamps: 0, total_stamps: 0, free_drinks_earned: 0 })
      .select().single();

    if (error) {
      if (error.code === '23505') return { statusCode: 409, headers: cors(), body: JSON.stringify({ error: 'Phone already registered' }) };
      throw error;
    }

    return { statusCode: 201, headers: cors(), body: JSON.stringify({ ...data, history: [] }) };
  } catch (err) {
    console.error('loyalty-register error:', err.message);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
