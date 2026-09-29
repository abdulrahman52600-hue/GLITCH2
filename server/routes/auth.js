import express from 'express';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { createSession, destroySession } from '../utils/session.js';
import { authenticate, requireSelf } from '../middleware/auth.js';

const router = express.Router();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, expected] = String(stored || '').split(':');
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
    return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  } catch { return false; }
}

function publicUser(user) {
  if (!user) return user;
  const { password, passwordHash, ...safe } = user;
  return safe;
}

router.get('/demo-users', async (req, res) => {
  try {
    if (process.env.ENABLE_DEMO_ACCOUNTS !== 'true') return res.json({ success: true, users: [] });
    const users = await db.getUsers();
    // Demo personas are limited to student and company accounts. Admin access
    // must use the configured credential and is never available as impersonation.
    res.json({ success: true, users: users.filter(user => user.role !== 'admin').map(publicUser) });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load demo users.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const role = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    let user = email ? await db.getUserByEmail(email) : null;
    if (!user && role) {
      const users = await db.getUsers(role);
      user = users[0];
    }
    if (!user) return res.status(404).json({ error: 'User not found. Try one-click demo login or register.' });
    if (['student', 'company'].includes(role) && ['student', 'company'].includes(user.role) && user.role !== role) return res.status(403).json({ error: `This is a ${user.role} account. Choose the matching workspace.` });
    const demoLogin = process.env.ENABLE_DEMO_ACCOUNTS === 'true' && !password && !user.passwordHash && user.role !== 'admin';
    let configuredAdminLogin = false;
    if (user.role === 'admin' && !user.passwordHash) {
      const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const configuredPassword = process.env.ADMIN_PASSWORD || '';
      const supplied = Buffer.from(password);
      const expected = Buffer.from(configuredPassword);
      const passwordMatches = configuredPassword.length > 0 && supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
      if (!configuredEmail || user.email.toLowerCase() !== configuredEmail || !passwordMatches) {
        return res.status(401).json({ error: 'Admin sign-in is not configured for this account.' });
      }
      configuredAdminLogin = true;
    } else if (user.passwordHash && !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.passwordHash && !demoLogin && !configuredAdminLogin) return res.status(401).json({ error: 'Password sign-in is required. Demo access is disabled.' });

    const token = createSession(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  const header = req.headers.authorization || '';
  destroySession(header.startsWith('Bearer ') ? header.slice(7) : '');
  res.json({ success: true });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, role, password } = req.body || {};
    if (!name || !email || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Name, email and a password of at least 8 characters are required.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await db.getUserByEmail(normalizedEmail);
    if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });

    // Public registration can create student accounts only. Company/admin roles are not client-controlled.
    const safeRole = 'student';
    const newUser = await db.createUser({
      name: String(name).trim().slice(0, 100),
      email: normalizedEmail,
      role: safeRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      skills: [],
      verifiedSkills: [],
      interests: [],
      availability: 'Flexible',
      resumeFilename: '',
      resumeUrl: '',
      bio: '',
      passwordHash: hashPassword(password)
    });
    const token = createSession(newUser);
    res.status(201).json({ success: true, token, user: publicUser(newUser) });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.get('/user/:id', authenticate, requireSelf(), async (req, res) => {
  const user = await db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user: publicUser(user) });
});

router.put('/profile/:id', authenticate, requireSelf(), async (req, res) => {
  try {
    const allowed = ['name', 'university', 'degree', 'gradYear', 'gpa', 'bio', 'availability', 'github', 'linkedin', 'portfolio', 'resumeFilename', 'resumeUrl', 'interests', 'skills'];
    const update = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) update[key] = req.body[key];
    }
    if (update.name !== undefined) update.name = String(update.name).trim().slice(0, 100);
    if (update.skills !== undefined) {
      if (!Array.isArray(update.skills)) return res.status(400).json({ error: 'Skills must be an array.' });
      update.skills = [...new Set(update.skills.map(s => String(s).trim()).filter(Boolean))].slice(0, 30);
    }
    if (update.interests !== undefined) {
      if (!Array.isArray(update.interests)) return res.status(400).json({ error: 'Interests must be an array.' });
      update.interests = [...new Set(update.interests.map(s => String(s).trim()).filter(Boolean))].slice(0, 20);
    }

    // Deliberately reject protected fields rather than silently accepting them.
    const protectedFields = ['role', 'verifiedSkills', 'verified', '_id', 'createdAt'];
    const attemptedProtected = protectedFields.find(k => Object.prototype.hasOwnProperty.call(req.body || {}, k));
    if (attemptedProtected) return res.status(400).json({ error: `${attemptedProtected} is server-managed and cannot be edited from the profile.` });

    const updated = await db.updateUser(req.params.id, update);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: publicUser(updated) });
  } catch (err) {
    res.status(400).json({ error: 'Invalid profile data.' });
  }
});

export default router;
