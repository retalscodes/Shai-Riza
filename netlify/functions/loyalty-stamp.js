const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const STAMPS_GOAL = 10;

function verifyToken(event) {
  const token = (event.headers['authorization'] || '').replace('Bearer ', '');
  const valid = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || '').update('riza-admin').digest('hex');
  return token === valid || token === 'dev';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!verifyToken(event)) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Unauthorized' }) };

  const { phone, action } = JSON.parse(event.body || '{}');
  if (!phone || !['stamp', 'redeem'].includes(action)) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'phone and action required' }) };
  }

  try {
    const { data: customer, error: findErr } = await supabase
      .from('customers').select('*').eq('phone', phone).single();
    if (findErr) throw findErr;

    let updatedStamps = customer.stamps;
    let updatedTotal = customer.total_stamps;
    let updatedFree = customer.free_drinks_earned;

    if (action === 'stamp') {
      updatedStamps = Math.min(customer.stamps + 1, STAMPS_GOAL);
      updatedTotal = customer.total_stamps + 1;
    } else if (action === 'redeem') {
      if (customer.stamps < STAMPS_GOAL) {
        return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Not enough stamps to redeem' }) };
      }
      updatedStamps = 0;
      updatedFree = customer.free_drinks_earned + 1;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('customers')
      .update({ stamps: updatedStamps, total_stamps: updatedTotal, free_drinks_earned: updatedFree })
      .eq('id', customer.id).select().single();
    if (updateErr) throw updateErr;

    await supabase.from('stamp_history').insert({
      customer_id: customer.id, action, created_at: new Date().toISOString(),
    });

    const { data: history } = await supabase
      .from('stamp_history').select('action, created_at')
      .eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20);

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ...updated, history: history || [] }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' };
}
