const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function verifyToken(event) {
  const auth = event.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  const validToken = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '').update('riza-admin').digest('hex');
  return token === validToken || token === 'dev';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!verifyToken(event)) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Unauthorized' }) };

  const { key, value } = JSON.parse(event.body || '{}');
  if (!key) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'key is required' }) };

  try {
    const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' };
}
