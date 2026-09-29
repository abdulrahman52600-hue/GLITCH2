import { getSession } from '../utils/session.js';
import { db } from '../db/database.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Authentication required.' });

  const user = await db.getUserById(session.userId);
  if (!user) return res.status(401).json({ error: 'Session user no longer exists.' });
  req.user = user;
  req.session = session;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

export function requireSelf(param = 'id') {
  return (req, res, next) => {
    if (req.user?.role === 'admin' || req.user?._id === req.params[param]) return next();
    return res.status(403).json({ error: 'You can only access your own account.' });
  };
}

export async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = getSession(token);
  if (session) {
    const user = await db.getUserById(session.userId);
    if (user) { req.user = user; req.session = session; }
  }
  next();
}
