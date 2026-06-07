exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET ✓' : 'MISSING ✗',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET ✓' : 'MISSING ✗',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET ✓' : 'MISSING ✗',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET ✓' : 'MISSING ✗',
      CASHIER_PASSWORD: process.env.CASHIER_PASSWORD ? 'SET ✓' : 'MISSING ✗',
    }),
  };
};
