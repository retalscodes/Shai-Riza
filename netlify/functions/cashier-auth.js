const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method not allowed' }) };

  let password = '';
  try {
    password = JSON.parse(event.body || '{}').password || '';
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const cashierPassword = process.env.CASHIER_PASSWORD;
  if (!cashierPassword) {
    console.error('CASHIER_PASSWORD env var is not set');
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Cashier password not configured' }) };
  }

  if (password.trim() !== cashierPassword.trim()) {
    console.log('Cashier login attempt failed — password mismatch');
    return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Incorrect password' }) };
  }

  const token = crypto.createHmac('sha256', cashierPassword).update('riza-cashier').digest('hex');
  console.log('Cashier login successful');
  return { statusCode: 200, headers: cors(), body: JSON.stringify({ token }) };
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
