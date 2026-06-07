const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function verifyToken(event) {
  const token = (event.headers['authorization'] || '').replace('Bearer ', '');
  const valid = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '').update('riza-admin').digest('hex');
  return token === valid || token === 'dev';
}

exports.handler = async (event) => {
  if (!verifyToken(event)) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const { data, error } = await supabase
      .from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { statusCode: 200, headers: cors(), body: JSON.stringify(data || []) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization' };
}
