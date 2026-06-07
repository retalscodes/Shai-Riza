const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { phone, name } = JSON.parse(event.body || '{}');
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
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
}
