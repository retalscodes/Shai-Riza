const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { password } = JSON.parse(event.body || '{}');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return { statusCode: 500, body: JSON.stringify({ error: 'Admin password not configured' }) };
  if (password !== adminPassword) return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) };

  const token = crypto.randomBytes(32).toString('hex');
  // In production use a proper JWT or signed token. For simplicity we derive from env secret.
  const validToken = crypto.createHmac('sha256', adminPassword).update('riza-admin').digest('hex');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: validToken }),
  };
};
