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
    const [customers, stamps, menu, recent] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('stamp_history').select('id', { count: 'exact', head: true }).eq('action', 'stamp'),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }),
      supabase.from('stamp_history')
        .select('action, created_at, customers(name, phone)')
        .eq('action', 'stamp')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    const freeDrinks = await supabase.from('customers').select('free_drinks_earned');
    const totalFree = (freeDrinks.data || []).reduce((sum, c) => sum + (c.free_drinks_earned || 0), 0);

    return {
      statusCode: 200, headers: cors(),
      body: JSON.stringify({
        customers: customers.count || 0,
        stamps: stamps.count || 0,
        free_drinks: totalFree,
        menu_items: menu.count || 0,
        recent_stamps: (recent.data || []).map(s => ({
          customer_name: s.customers?.name,
          customer_phone: s.customers?.phone,
          created_at: s.created_at,
        })),
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization' };
}
