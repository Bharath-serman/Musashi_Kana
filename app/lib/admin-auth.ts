const encoder = new TextEncoder();

async function getCryptoKey(secret: string) {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(payload: Record<string, unknown>, secret: string): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  // Using Buffer for Node-friendly base64 encoding (Next.js server-side)
  const payloadBase64 = Buffer.from(payloadStr).toString('base64');
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadBase64)
  );
  const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');
  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifySession(token: string, secret: string): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, signatureBase64] = parts;
  try {
    const key = await getCryptoKey(secret);
    const signatureBytes = new Uint8Array(Buffer.from(signatureBase64, 'base64'));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadBase64)
    );
    if (!isValid) return null;
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr) as Record<string, unknown>;
    
    // Check expiration
    if (payload.expires && typeof payload.expires === 'number' && Date.now() > payload.expires) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
