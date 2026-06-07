const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const phone = event.queryStringParameters?.phone;
  if (!phone) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'phone required' }) };

  try {
    const { data: customer, error } = await supabase
      .from('customers').select('*').eq('phone', phone).single();

    if (error && error.code === 'PGRST116') {
      return { statusCode: 404, headers: cors(), body: JSON.stringify({ error: 'Customer not found' }) };
    }
    if (error) throw error;

    const { data: history } = await supabase
      .from('stamp_history').select('action, created_at')
      .eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20);

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ...customer, history: history || [] }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() { return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }; }
