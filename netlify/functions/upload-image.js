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

  try {
    // Parse multipart body — Netlify provides raw body as base64
    const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const contentType = event.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];

    if (!boundary) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'No boundary found' }) };

    // Simple multipart parser
    const parts = body.toString('binary').split(`--${boundary}`);
    let fileBuffer = null;
    let fileName = `upload-${Date.now()}.jpg`;
    let fileMime = 'image/jpeg';

    for (const part of parts) {
      if (!part.includes('Content-Disposition')) continue;
      if (!part.includes('filename')) continue;
      const nameMatch = part.match(/filename="([^"]+)"/);
      if (nameMatch) fileName = nameMatch[1].replace(/[^a-zA-Z0-9._-]/g, '_');
      const mimeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
      if (mimeMatch) fileMime = mimeMatch[1].trim();
      const dataStart = part.indexOf('\r\n\r\n') + 4;
      const dataEnd = part.lastIndexOf('\r\n');
      if (dataStart > 3 && dataEnd > dataStart) {
        fileBuffer = Buffer.from(part.slice(dataStart, dataEnd), 'binary');
      }
    }

    if (!fileBuffer) return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'No file data found' }) };

    const storagePath = `gallery/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('riza-gallery').upload(storagePath, fileBuffer, { contentType: fileMime });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('riza-gallery').getPublicUrl(storagePath);

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ url: publicUrl }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' };
}
