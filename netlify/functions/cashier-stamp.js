const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const STAMPS_GOAL = 10;

function verifyToken(event) {
  const token = (event.headers['authorization'] || '').replace('Bearer ', '');
  const cashierValid = crypto.createHmac('sha256', process.env.CASHIER_PASSWORD || '').update('riza-cashier').digest('hex');
  const adminValid   = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD  || '').update('riza-admin').digest('hex');
  return token === cashierValid || token === adminValid;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!verifyToken(event)) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Unauthorized' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let phone, action;
  try {
    ({ phone, action } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!phone || !['stamp', 'redeem'].includes(action)) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'phone and action required' }) };
  }

  try {
    const { data: customer, error: findErr } = await supabase
      .from('customers').select('*').eq('phone', phone).single();
    if (findErr) throw findErr;

    let stamps = customer.stamps;
    let total  = customer.total_stamps;
    let free   = customer.free_drinks_earned;

    if (action === 'stamp') {
      stamps = Math.min(stamps + 1, STAMPS_GOAL);
      total  = total + 1;
    } else {
      if (stamps < STAMPS_GOAL) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Not enough stamps' }) };
      stamps = 0;
      free   = free + 1;
    }

    const { data: updated, error: upErr } = await supabase
      .from('customers')
      .update({ stamps, total_stamps: total, free_drinks_earned: free })
      .eq('id', customer.id).select().single();
    if (upErr) throw upErr;

    await supabase.from('stamp_history').insert({ customer_id: customer.id, action, created_at: new Date().toISOString() });

    const { data: history } = await supabase
      .from('stamp_history').select('action, created_at')
      .eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20);

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ...updated, history: history || [] }) };
  } catch (err) {
    console.error('cashier-stamp error:', err.message);
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
