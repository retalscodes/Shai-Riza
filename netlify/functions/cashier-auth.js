const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { password } = JSON.parse(event.body || '{}');
  const cashierPassword = process.env.CASHIER_PASSWORD;

  if (!cashierPassword) return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Cashier password not configured' }) };
  if (password !== cashierPassword) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Incorrect password' }) };

  const token = crypto.createHmac('sha256', cashierPassword).update('riza-cashier').digest('hex');
  return { statusCode: 200, headers: cors(), body: JSON.stringify({ token }) };
};

function cors() { return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }; }
