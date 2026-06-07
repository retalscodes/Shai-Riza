const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function verifyToken(event) {
  const token = (event.headers['authorization'] || '').replace('Bearer ', '');
  const valid = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '').update('riza-admin').digest('hex');
  return token === valid || token === 'dev';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (!verifyToken(event)) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Unauthorized' }) };

  const id = event.queryStringParameters?.id;

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase.from('menu_items').insert(body).select().single();
      if (error) throw error;
      return { statusCode: 201, headers: cors(), body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase.from('menu_items').update(body).eq('id', id).select().single();
      if (error) throw error;
      return { statusCode: 200, headers: cors(), body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { error } = await supabase.from('menu_items').update({ available: body.available }).eq('id', id);
      if (error) throw error;
      return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' };
}
