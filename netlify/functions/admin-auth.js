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

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env var is not set');
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Admin password not configured' }) };
  }

  const received = password.trim();
  const expected = adminPassword.trim();
  console.log(`Admin login — received.length=${received.length} expected.length=${expected.length} match=${received === expected}`);

  if (received !== expected) {
    return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: 'Incorrect password' }) };
  }

  const token = crypto.createHmac('sha256', expected).update('riza-admin').digest('hex');
  console.log('Admin login successful');
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
