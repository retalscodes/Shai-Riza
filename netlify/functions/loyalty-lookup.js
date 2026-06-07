const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };

  const phone = event.queryStringParameters?.phone?.trim();
  if (!phone) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'phone required' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // service key bypasses RLS
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle(); // use maybeSingle to avoid 406 when not found

    if (error) {
      console.error('Supabase error:', error.message, error.code);
      throw error;
    }

    if (!customer) {
      return { statusCode: 404, headers: cors(), body: JSON.stringify({ error: 'Customer not found' }) };
    }

    const { data: history } = await supabase
      .from('stamp_history')
      .select('action, created_at')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ ...customer, history: history || [] }),
    };
  } catch (err) {
    console.error('loyalty-lookup error:', err.message);
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
