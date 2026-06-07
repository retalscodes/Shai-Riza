// TEMPORARY DEBUG ENDPOINT — delete after fixing
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors(), body: 'POST only' };

  let typed = '';
  try { typed = JSON.parse(event.body || '{}').password || ''; } catch {}

  const adminPw  = process.env.ADMIN_PASSWORD  || '';
  const cashierPw = process.env.CASHIER_PASSWORD || '';

  const typedTrimmed  = typed.trim();
  const adminTrimmed  = adminPw.trim();
  const cashierTrimmed = cashierPw.trim();

  return {
    statusCode: 200,
    headers: cors(),
    body: JSON.stringify({
      typed_length:         typedTrimmed.length,
      admin_pw_length:      adminTrimmed.length,
      cashier_pw_length:    cashierTrimmed.length,
      matches_admin:        typedTrimmed === adminTrimmed,
      matches_cashier:      typedTrimmed === cashierTrimmed,
      admin_first_char_code:   adminTrimmed.charCodeAt(0),
      typed_first_char_code:   typedTrimmed.charCodeAt(0),
      admin_last_char_code:    adminTrimmed.charCodeAt(adminTrimmed.length - 1),
      typed_last_char_code:    typedTrimmed.charCodeAt(typedTrimmed.length - 1),
    }),
  };
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
