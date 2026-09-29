import crypto from 'crypto';

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    const session = sessions.get(payload.sid);
    if (!session || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function createSession(user) {
  const sid = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(sid, { userId: user._id, role: user.role, expiresAt });
  return sign({ sid, exp: expiresAt });
}

export function getSession(token) {
  return verify(token);
}

export function destroySession(token) {
  if (!token) return;
  const [encoded] = token.split('.');
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.sid) sessions.delete(payload.sid);
  } catch {}
}
