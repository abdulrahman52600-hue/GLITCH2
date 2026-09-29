import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { createSession } from '../utils/session.js';

const router = express.Router();
const pendingStates = new Map();
const exchangeCodes = new Map();
const phoneChallenges = new Map();
const phoneIpWindows = new Map();
const providers = () => ({ google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET), phone: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) });
const nonce = () => crypto.randomBytes(32).toString('base64url');
const safeRole = value => ['student', 'company'].includes(value) ? value : 'student';
const callbackUrl = provider => `${String(process.env.SERVER_PUBLIC_URL || '').replace(/\/$/, '')}/api/auth/oauth/${provider}/callback`;
const clientUrl = (path) => `${String(process.env.CLIENT_PUBLIC_URL || process.env.CLIENT_ORIGIN || '').split(',')[0].replace(/\/$/, '')}${path}`;
async function twilioRequest(url, form) {
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  try {
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    return { response, body: await response.json() };
  } catch { return { response: null, body: null }; }
}

router.get('/providers', (req, res) => res.json({ success: true, providers: providers() }));

router.get('/oauth/:provider/start', (req, res) => {
  const { provider } = req.params;
  if (!['google', 'github'].includes(provider) || !providers()[provider]) return res.status(503).json({ error: `${provider} sign-in is not configured yet.` });
  if (!process.env.SERVER_PUBLIC_URL || !process.env.CLIENT_PUBLIC_URL) return res.status(503).json({ error: 'Social sign-in needs the public client and server URLs configured.' });
  const role = safeRole(req.query.role);
  const state = nonce();
  pendingStates.set(state, { provider, role, expiresAt: Date.now() + 10 * 60_000 });
  const params = new URLSearchParams({ client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`], redirect_uri: callbackUrl(provider), response_type: 'code', state });
  if (provider === 'google') { params.set('scope', 'openid email profile'); params.set('prompt', 'select_account'); }
  else { params.set('scope', 'read:user user:email'); }
  res.redirect(`${provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : 'https://github.com/login/oauth/authorize'}?${params}`);
});

router.get('/oauth/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const pending = pendingStates.get(String(req.query.state || ''));
  pendingStates.delete(String(req.query.state || ''));
  if (!pending || pending.provider !== provider || pending.expiresAt < Date.now() || typeof req.query.code !== 'string') return res.redirect(`${clientUrl('/login')}?authError=Sign-in%20expired.%20Please%20try%20again.`);
  try {
    const params = new URLSearchParams({ client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`], client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`], code: req.query.code, redirect_uri: callbackUrl(provider) });
    if (provider === 'google') params.set('grant_type', 'authorization_code');
    const tokenResponse = await fetch(provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error('Provider token exchange failed');
    const headers = { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json', 'User-Agent': 'NexBridge' };
    let identity;
    if (provider === 'google') {
      const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers });
      identity = await response.json();
      if (!response.ok || identity.email_verified !== true) throw new Error('Verified Google email required');
      identity.providerId = identity.sub;
    } else {
      const response = await fetch('https://api.github.com/user', { headers });
      const profile = await response.json();
      const emailResponse = await fetch('https://api.github.com/user/emails', { headers });
      const emails = await emailResponse.json();
      const email = Array.isArray(emails) ? emails.find(item => item.primary && item.verified)?.email : null;
      if (!response.ok || !email) throw new Error('A verified GitHub email is required');
      identity = { providerId: String(profile.id), email, name: profile.name || profile.login, picture: profile.avatar_url };
    }
    let user = await db.getUserByProvider(provider, String(identity.providerId));
    if (user && user.role !== pending.role) throw new Error('This account belongs to a different workspace. Choose the matching account type.');
    if (!user) {
      user = await db.getUserByEmail(identity.email);
      if (user && user.role !== pending.role) throw new Error('This email is already used by a different workspace.');
      if (user) {
        user = await db.updateUser(user._id, { authProviders: { ...(user.authProviders || {}), [provider]: String(identity.providerId) } });
      } else {
        if (pending.role === 'company') throw new Error('Company workspaces must be created by NexBridge before sign-in.');
        user = await db.createUser({ name: String(identity.name || identity.email.split('@')[0]).slice(0, 100), email: identity.email.toLowerCase(), role: 'student', avatar: identity.picture || '', authProviders: { [provider]: String(identity.providerId) }, skills: [], verifiedSkills: [], interests: [], availability: 'Flexible', passwordHash: '' });
      }
    }
    const code = nonce();
    exchangeCodes.set(code, { token: createSession(user), userId: user._id, expiresAt: Date.now() + 60_000 });
    res.redirect(`${clientUrl('/login')}?oauth_code=${encodeURIComponent(code)}`);
  } catch (error) {
    res.redirect(`${clientUrl('/login')}?authError=${encodeURIComponent(error.message || 'Sign-in failed. Please try again.')}`);
  }
});

router.post('/oauth/exchange', (req, res) => {
  const code = String(req.body?.code || '');
  const result = exchangeCodes.get(code);
  exchangeCodes.delete(code);
  if (!result || result.expiresAt < Date.now()) return res.status(401).json({ error: 'Sign-in expired. Please try again.' });
  db.getUserById(result.userId).then(user => user ? res.json({ success: true, token: result.token, user }) : res.status(401).json({ error: 'Account no longer exists.' }));
});

router.post('/phone/start', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  if (!providers().phone) return res.status(503).json({ error: 'Phone sign-in is not configured yet.' });
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({ error: 'Enter a phone number in international format, such as +14155552671.' });
  const ipStart = phoneIpWindows.get(req.ip);
  if (ipStart && Date.now() - ipStart.startedAt < 60 * 60_000 && ipStart.count >= 10) return res.status(429).json({ error: 'Too many code requests. Try again later.' });
  if (!ipStart || Date.now() - ipStart.startedAt >= 60 * 60_000) phoneIpWindows.set(req.ip, { startedAt: Date.now(), count: 1 });
  else ipStart.count += 1;
  const windowStart = Date.now() - 60 * 60_000;
  const recent = phoneChallenges.get(phone);
  if (recent?.sentAt > windowStart) return res.status(429).json({ error: 'Please wait before requesting another code.' });
  const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(process.env.TWILIO_VERIFY_SERVICE_SID)}/Verifications`;
  const form = new URLSearchParams({ To: phone, Channel: 'sms' });
  const { response } = await twilioRequest(url, form);
  if (!response?.ok) return res.status(502).json({ error: 'Could not send a verification code. Check the number and try again.' });
  phoneChallenges.set(phone, { sentAt: Date.now(), attempts: 0 });
  res.json({ success: true, message: 'Verification code sent.' });
});

router.post('/phone/verify', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  const code = String(req.body?.code || '').trim();
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 100) : '';
  const role = safeRole(req.body?.role);
  const challenge = phoneChallenges.get(phone);
  if (name.length < 2) return res.status(400).json({ error: 'Enter your full name before completing phone sign-in.' });
  if (!providers().phone || !challenge || Date.now() - challenge.sentAt > 10 * 60_000 || challenge.attempts >= 5 || !/^\d{4,10}$/.test(code)) return res.status(400).json({ error: 'Code expired or invalid. Request a new one.' });
  challenge.attempts += 1;
  const url = `https://verify.twilio.com/v2/Services/${encodeURIComponent(process.env.TWILIO_VERIFY_SERVICE_SID)}/VerificationCheck`;
  const form = new URLSearchParams({ To: phone, Code: code });
  const { response, body: result } = await twilioRequest(url, form);
  if (!response?.ok || result?.status !== 'approved') return res.status(401).json({ error: 'That verification code is incorrect or expired.' });
  phoneChallenges.delete(phone);
  let user = await db.getUserByPhone(phone);
  if (user && user.role !== role) return res.status(403).json({ error: 'This phone number is registered to a different workspace.' });
  if (!user) {
    if (role === 'company') return res.status(403).json({ error: 'Company workspaces must be created by NexBridge before sign-in.' });
    user = await db.createUser({ name, email: `phone-${crypto.createHash('sha256').update(phone).digest('hex')}@phone.nexbridge.invalid`, phone, role: 'student', authProviders: {}, skills: [], verifiedSkills: [], interests: [], availability: 'Flexible', passwordHash: '' });
  }
  res.json({ success: true, token: createSession(user), user });
});

export default router;
